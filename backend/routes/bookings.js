const router = require("express").Router();
let Booking = require("../models/booking.model");
let RestaurantCapacity = require("../models/restaurantCapacity.model");
let Restaurant = require("../models/restaurant.model");

router.route("/").get((req, res) => {
  Booking.find()
    .then((bookings) => res.json(bookings))
    .catch((err) => res.status(400).json("Error: " + err));
});


function generateTimeSlots(startTime, endTime, interval) {
  const timeArray = [];
  console.log(startTime);
  for (let time = startTime; time < endTime; time += interval) {

      timeArray.push(time);
  }
  console.log(timeArray);
  return timeArray;
}

const getAvailability = async (restaurantId, date, partyNumber) => {
  
  try {

    let Capacity = await RestaurantCapacity.find({ restaurantid: restaurantId });
    console.log(Capacity);
    let restaurant = await Restaurant.find({ _id: restaurantId });
    console.log(restaurant);

    if (!Capacity || !restaurant) {
      return res
        .status(404)
        .json({ message: "Restaurant or capacity not found" });
    }
    let interval = 30;
    let slots = generateTimeSlots(restaurant[0].openHour, restaurant[0].closeHour, interval);

    availabilityPerSlot = [];
    // console.log(slots);
    for (let slot of slots) {
      console.log("Slot: "+slot);
      let bookings = await Booking.find({ 
        restaurantid: restaurantId, 
        date: date,
        $or: [
          { startingTime: { $gte: slot, $lt: slot + restaurant[0].Bookingduration } },
          { endingTime: { $gt: slot, $lte: slot + restaurant[0].Bookingduration } }
        ]
      });
      console.log(bookings);
      let booked = {
        time: slot,
        bookingsfor2: 0,
        bookingsfor4: 0,
        bookingsfor6: 0,
        bookingsfor8: 0,
      };

      bookings.forEach((booking) => {
        bookings.forEach((booking) => {
          console.log(`Table Capacity: ${booking.tableCapacity}`);
          if (booking.tableCapacity === 2) {
            booked.bookingsfor2 += 1;
          } else if (booking.tableCapacity === 4) {
            booked.bookingsfor4 += 1;
          } else if (booking.tableCapacity === 6) {
            booked.bookingsfor6 += 1;
          } else if (booking.tableCapacity === 8) {
            booked.bookingsfor8 += 1;
          }
        });
      });

      let trueCapacityFor2 = Capacity[0].tablesForTwo - booked.bookingsfor2;
      let trueCapacityFor4 = Capacity[0].tablesForFour - booked.bookingsfor4;
      let trueCapacityFor6 = Capacity[0].tablesForSix - booked.bookingsfor6;
      let trueCapacityFor8 = Capacity[0].tablesForEight - booked.bookingsfor8;
      console.log(`True Capacity ${trueCapacityFor4}`);
      if (partyNumber <= 2) {
        if (trueCapacityFor2 > 0) {
          availabilityPerSlot.push({ time: `${Math.floor(slot / 60)}:${slot % 60 === 0 ? '00' : slot % 60}`, available: true });
        } else {
          availabilityPerSlot.push({ time: `${Math.floor(slot / 60)}:${slot % 60 === 0 ? '00' : slot % 60}`, available: false });
        }
      }
      else if (partyNumber <= 4) {
        if (trueCapacityFor4 > 0) {
          availabilityPerSlot.push({ time: `${Math.floor(slot / 60)}:${slot % 60 === 0 ? '00' : slot % 60}`, available: true });
        } else {
          availabilityPerSlot.push({ time: `${Math.floor(slot / 60)}:${slot % 60 === 0 ? '00' : slot % 60}`, available: false });
        }
      }
      else if (partyNumber <= 6) {
        if (trueCapacityFor6 > 0) {
          availabilityPerSlot.push({ time: `${Math.floor(slot / 60)}:${slot % 60 === 0 ? '00' : slot % 60}`, available: true });
        } else {
          availabilityPerSlot.push({ time: `${Math.floor(slot / 60)}:${slot % 60 === 0 ? '00' : slot % 60}`, available: false });
        }
      }
      else if (partyNumber <= 8) {
        if (trueCapacityFor8 > 0) {
          availabilityPerSlot.push({ time: `${Math.floor(slot / 60)}:${slot % 60 === 0 ? '00' : slot % 60}`, available: true });
        } else {
          availabilityPerSlot.push({ time: `${Math.floor(slot / 60)}:${slot % 60 === 0 ? '00' : slot % 60}`, available: false });
        }
      }
    }
    console.log("Out of loop");
    console.log(availabilityPerSlot);
    return availabilityPerSlot;
  } catch (error) {
    console.error("Error retrieving availability:", error);
  }
};

router.route("/availability/:restaurantId").get(async (req, res) => {
  const restaurantId = req.params.restaurantId;
  const partyNumber = req.query.partyNumber// Ensure partyNumber is an integer


  // Assuming the date string is in "YYYY-MM-DD" format
const dateString = req.query.date; // e.g., "2023-03-15"
const parts = dateString.split("-");

// Note: parts[1] - 1 because months are 0-indexed in JavaScript Date objects
console.log(parts);
const date = new Date(parts[0], parts[1] - 1, parts[2]);
console.log(date);


  try {
    // Call the getAvailability function and await its result
    const availability = await getAvailability(restaurantId, date, partyNumber);

    // Check if the availability array is empty or not
    if (availability.length === 0) {
      // No available slots
      return res.status(404).json({ message: "No available slots found" });
    }

    // If available slots are found, return them
    return res.json(availability);
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error retrieving availability:", error);
    return res.status(500).json({ message: "An error occurred while fetching availability" });
  }
});

module.exports = router;
