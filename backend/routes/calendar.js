const router = require("express").Router();
const mongoose = require('mongoose');
const Booking = require('../models/booking.model'); // Import Booking schema
const ClosedDate = require('../models/ClosedDates.model'); // Import ClosedDate schema
const DefaultClosedDay = require('../models/DefaultClosedDays.model'); // Import DefaultClosedDay schema
const RestaurantCapacity = require('../models/restaurantCapacity.model'); // Import RestaurantCapacity schema
const Restaurant = require('../models/restaurant.model'); // Import Restaurant schema
const Owner = require('../models/restaurantOwner.model'); // Import Owner schema
let isDayClosed = require('../functions/IsDayClosed'); // Import the isDayClosed function
let { sendCustomerConfirmationMail, sendOwnerConfirmationMail, sendBookingReminderMail } = require("../functions/notifications");
const ForcedOpenDate = require('../models/forcedOpenDates.model');
 
// Helper: get day of week string from a Date=
function getDayOfWeek(date) {
    return date.toLocaleString('en', { weekday: 'long' }); // e.g. "Monday", "Tuesday", ...
  }

// Fetch calendar data
router.route("/:restaurantId").get(async (req, res) => {
    const { restaurantId } = req.params;
    const { startDate, endDate } = req.query;
    console.log("Fetching calendar data for restaurant:", restaurantId, "from", startDate, "to", endDate);
    
    try {
      // 1. Fetch all Bookings for that date range
      const bookings = await Booking.find({
        restaurantid: restaurantId,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });
  
      // 2. Fetch all one-off closed dates for that range
      const closedDates = await ClosedDate.find({
        restaurant: restaurantId,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });

      // 2b. Fetch all forced open dates for that range
      const forcedOpenDates = await ForcedOpenDate.find({
        restaurant: restaurantId,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });

      // Create a Set of forced open date strings for quick checking
      const forcedOpenDateSet = new Set(
        forcedOpenDates.map((d) => d.date.toISOString().split('T')[0])
      );
  
      // 3. Fetch capacity if needed
      const capacityDoc = await RestaurantCapacity.findOne({ restaurantid: restaurantId });
      const totalCapacity = capacityDoc ? capacityDoc.totalCapacity : 0;
  
      // 4. Fetch the default closed days for this restaurant (e.g., "Monday", "Tuesday", etc.)
      const defaultClosedDays = await DefaultClosedDay.find({
        restaurant: restaurantId,
        isClosed: true
      }); 
      // Turn them into a Set for quick checking: e.g. { "Monday", "Tuesday" }
      const closedDayOfWeekSet = new Set(defaultClosedDays.map((d) => d.dayOfWeek));
  
      // 5. Build a day-by-day structure from startDate to endDate
      //    so that *every* day appears in the final output.
      const start = new Date(startDate);
      const end = new Date(endDate);
      const calendar = {};
  
      let current = new Date(start);
      while (current <= end) {
        const dayStr = current.toISOString().split('T')[0];
        calendar[dayStr] = {
          bookings: 0,
          capacity: totalCapacity,
          closed: false,  // We will override this below
        };
        current.setDate(current.getDate() + 1);
      }
  
      // 6. Mark default closed days by day of week
      Object.keys(calendar).forEach(dayStr => {
        const dayDate = new Date(dayStr);
        const dayOfWeek = getDayOfWeek(dayDate);
        
        // Only mark as closed if it's not in the forced open set
        if (closedDayOfWeekSet.has(dayOfWeek) && !forcedOpenDateSet.has(dayStr)) {
          calendar[dayStr].closed = true;
        }
      });
  
      // 7. Mark one-off closed days
      closedDates.forEach(({ date }) => {
        const day = date.toISOString().split('T')[0];
        if (calendar[day]) {
          calendar[day].closed = true;
        }
      });
  
      // 8. Apply bookings count
      bookings.forEach((booking) => {
        const day = booking.date.toISOString().split('T')[0];
        if (!calendar[day]) {
          // This day might not have existed if it was out of the loop range, or a corner case
          calendar[day] = { bookings: 0, capacity: totalCapacity, closed: false };
        }
        // Increase the booking count for the day if it's not closed
        calendar[day].bookings += 1;
      });
  
      // 9. Build the final bookingSummary array that your front-end expects
      const bookingSummary = Object.keys(calendar).map(date => {
        const dayData = calendar[date];
        const bookingsCount = dayData.bookings;
        const capacity = dayData.capacity;
        const percentageBooked = capacity > 0 ? Math.round((bookingsCount / capacity) * 100) : 0;
        return {
          date,
          bookingsCount,
          percentageBooked,
          closed: dayData.closed,
        };
      });
  
      res.json(bookingSummary);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      res.status(500).json({ error: 'Error fetching calendar data.' });
    }
  });
  
  // Close a date (one-off)
  router.route("/close-date").post(async (req, res) => {
    const { restaurantId, date, reason } = req.body;

    try {
      // 0. First check if this date is in forced open dates
      const forcedOpenDate = await ForcedOpenDate.findOne({
        restaurant: restaurantId,
        date: new Date(date)
      });

      if (forcedOpenDate) {
        // If it's a forced open date, just remove it from forced open dates
        // This will automatically revert it to its default closed state
        await ForcedOpenDate.deleteOne({
          _id: forcedOpenDate._id
        });
        return res.status(200).json({ 
          message: 'Date closed successfully (removed from forced open dates).' 
        });
      }

      // 1. Make sure there are no existing bookings on that day
      const existingBooking = await Booking.findOne({
        restaurantid: restaurantId,
        date: new Date(date),
      });

      if (existingBooking) {
        return res.status(400).json({ error: 'Cannot close a date with existing bookings.' });
      }

      // 2. Create a closed date record
      const closedDate = new ClosedDate({ 
        restaurant: restaurantId, 
        date: new Date(date),
        reason: reason || 'Closed'
      });
      await closedDate.save();

      res.status(200).json({ message: 'Date closed successfully.' });
    } catch (error) {
      console.error("Error closing date:", error);
      res.status(500).json({ error: 'Error closing the date.' });
    }
  });

// Fetch bookings for a specific date
router.route("/:restaurantId/bookings/:date").get(async (req, res) => {
    const { restaurantId, date } = req.params;
    console.log("Fetching bookings for restaurant:", restaurantId, "on date:", date); // Debugging log
    try {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        const bookings = await Booking.find({
            restaurantid: restaurantId,
            date: { $gte: startDate, $lt: endDate },
        });
        console.log("Fetched bookings:", bookings); // Debugging log
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: 'Error fetching bookings.' });
    }
});

// Add a new booking
router.route("/add-booking").post(async (req, res) => {
    const { restaurantId, date, time, partySize, phone, firstname, lastname, email } = req.body;
    console.log("Received booking request:", req.body); // Debugging log

    try {

        // Check if the restaurant is closed on the requested date
        const closed = await isDayClosed(restaurantId, date);
        if (closed) {
          return res.status(400).json({ error: 'Cannot create a booking on a closed day.' });
        }

        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        const [hours, minutes] = time.split(":").map(Number);
        const startingTime = hours * 60 + minutes;
        const endingTime = startingTime + restaurant.Bookingduration;

        const newBooking = new Booking({
            restaurantid: restaurantId,
            date: new Date(date),
            startingTime,
            endingTime,
            partySize,
            phone,
            firstname,
            lastname,
            email,
            duration: restaurant.Bookingduration,
            tableCapacity: partySize <= 2 ? 2 : partySize <= 4 ? 4 : partySize <= 6 ? 6 : 8,
        });

        await newBooking.save();
        console.log("Booking added successfully:", newBooking); // Debugging log
        res.status(200).json({ message: 'Booking added successfully.' });

        console.log("Restaurant: "+ restaurant)

         const customerEmailData = {
              toName: firstname + " " + lastname,
              toEmail: email,
              restaurantName: restaurant.name,
              bookingDate: date,
              bookingTime: time,
              guestCount: partySize
            };
        
            // const emailData = {
            //   toName: "Frank Alafouzos",
            //   toEmail: "frankalafouzos@gmail.com",
            //   restaurantName: "Test",
            //   bookingDate: "test",
            //   bookingTime: "test",
            //   guestCount: "test"
            // };
        
            sendCustomerConfirmationMail(customerEmailData)
              .then(result => {
                if (!result.success) {
                  console.error("Failed to send email:", result.error);
                }
              })
              .catch(err => {
                console.error("Unexpected email error:", err);
              });
        
            try {
              const owner = await Owner.findById(restaurant.owner);
              console.log("Owner: "+ owner)
        
              const ownerEmailData = {
                toName: owner.firstname + " " + owner.lastname,
                toEmail: owner.email,
                restaurantName: restaurant.name,
                bookingDate: date,
                bookingTime: time,
                guestCount: partySize
              };
        
              sendOwnerConfirmationMail(ownerEmailData)
            } catch (error) {
              console.log('Server error:' + error);
            }
        
    } catch (error) {
        console.error("Error adding booking:", error);
        res.status(500).json({ error: 'Error adding booking.' });
    }
});

// Remove a booking
router.route("/remove-booking/:id").delete(async (req, res) => {
    const { id } = req.params;

    try {
        await Booking.findByIdAndDelete(id);
        res.status(200).json({ message: 'Booking removed successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error removing booking.' });
    }
});


router.route("/open-date").post(async (req, res) => {
  const { restaurantId, date, reason } = req.body;

  try {
    // 1. First check if it's a one-off closed date
    const closedDateResult = await ClosedDate.findOneAndDelete({
      restaurant: restaurantId,
      date: new Date(date)
    });

    if (closedDateResult) {
      // It was a one-off closed date and has been deleted
      return res.status(200).json({ message: 'Date opened successfully (one-off closure removed).' });
    }

    // 2. If not a one-off date, it might be a default closed day
    // Get the day of week for this date
    const dateObj = new Date(date);
    const dayOfWeek = getDayOfWeek(dateObj);

    // Check if this day is in the default closed days
    const isDefaultClosed = await DefaultClosedDay.findOne({
      restaurant: restaurantId,
      dayOfWeek: dayOfWeek,
      isClosed: true
    });

    if (!isDefaultClosed) {
      // This date was not closed to begin with
      return res.status(400).json({ error: 'This date is not closed by default.' });
    }

    // 3. It's a default closed day, so we need to add it to forced open dates
    // First check if it's already in forced open dates
    const existingForcedOpen = await ForcedOpenDate.findOne({
      restaurant: restaurantId,
      date: new Date(date)
    });

    if (existingForcedOpen) {
      return res.status(200).json({ message: 'Date is already set to be forced open.' });
    }

    // Create a forced open date record
    const forcedOpenDate = new ForcedOpenDate({ 
      restaurant: restaurantId, 
      date: new Date(date),
      reason: reason || 'Forced Open'
    });
    await forcedOpenDate.save();

    res.status(200).json({ message: 'Date opened successfully (added to forced open dates).' });
  } catch (error) {
    console.error("Error opening date:", error);
    res.status(500).json({ error: 'Error opening the date.' });
  }
});


module.exports = router;