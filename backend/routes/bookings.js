const router = require("express").Router();
let Booking = require("../models/booking.model");
let RestaurantCapacity = require("../models/restaurantCapacity.model");
let Restaurant = require("../models/restaurant.model");
let User = require("../models/users.model");

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
    let Capacity = await RestaurantCapacity.find({
      restaurantid: restaurantId,
    });
    console.log(Capacity);
    let restaurant = await Restaurant.find({ _id: restaurantId });
    console.log(restaurant);

    if (!Capacity || !restaurant) {
      return res
        .status(404)
        .json({ message: "Restaurant or capacity not found" });
    }
    let interval = 30;
    let slots = generateTimeSlots(
      restaurant[0].openHour,
      restaurant[0].closeHour,
      interval
    );
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0); // Set to the beginning of the day

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    availabilityPerSlot = [];
    // console.log(slots);
    for (let slot of slots) {
      console.log("Slot: " + slot);

      let bookings = await Booking.find({
        restaurantid: restaurantId,
        date: {
          $gte: startOfDay,
          $lt: endOfDay
        },
        $or: [
          {
            startingTime: {
              $gte: slot,
              $lt: slot + restaurant[0].Bookingduration,
            },
          },
          {
            endingTime: {
              $gt: slot,
              $lte: slot + restaurant[0].Bookingduration,
            },
          },
        ],
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
          availabilityPerSlot.push({
            time: `${Math.floor(slot / 60)}:${
              slot % 60 === 0 ? "00" : slot % 60
            }`,
            available: true,
          });
        } else {
          availabilityPerSlot.push({
            time: `${Math.floor(slot / 60)}:${
              slot % 60 === 0 ? "00" : slot % 60
            }`,
            available: false,
          });
        }
      } else if (partyNumber <= 4) {
        if (trueCapacityFor4 > 0) {
          availabilityPerSlot.push({
            time: `${Math.floor(slot / 60)}:${
              slot % 60 === 0 ? "00" : slot % 60
            }`,
            available: true,
          });
        } else {
          availabilityPerSlot.push({
            time: `${Math.floor(slot / 60)}:${
              slot % 60 === 0 ? "00" : slot % 60
            }`,
            available: false,
          });
        }
      } else if (partyNumber <= 6) {
        if (trueCapacityFor6 > 0) {
          availabilityPerSlot.push({
            time: `${Math.floor(slot / 60)}:${
              slot % 60 === 0 ? "00" : slot % 60
            }`,
            available: true,
          });
        } else {
          availabilityPerSlot.push({
            time: `${Math.floor(slot / 60)}:${
              slot % 60 === 0 ? "00" : slot % 60
            }`,
            available: false,
          });
        }
      } else if (partyNumber <= 8) {
        if (trueCapacityFor8 > 0) {
          availabilityPerSlot.push({
            time: `${Math.floor(slot / 60)}:${
              slot % 60 === 0 ? "00" : slot % 60
            }`,
            available: true,
          });
        } else {
          availabilityPerSlot.push({
            time: `${Math.floor(slot / 60)}:${
              slot % 60 === 0 ? "00" : slot % 60
            }`,
            available: false,
          });
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
  const partyNumber = req.query.partyNumber; // Ensure partyNumber is an integer

  // Assuming the date string is in "YYYY-MM-DD" format
  const dateString = req.query.date; 
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
    return res
      .status(500)
      .json({ message: "An error occurred while fetching availability" });
  }
});

router.route("/create").post(async (req, res) => {
  console.log(req.body);
  const { userid, restaurantId, date, time, partySize, phone } = req.body;
  console.log(partySize);
  try {
    const restaurant = await Restaurant.find({ _id: restaurantId });

    if (restaurant.length === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const [hours, minutes] = time.split(":").map(Number); // Convert to numbers

    const startingTimeMinutes = hours * 60 + minutes;
    // Ensure Bookingduration is a number and add it correctly
    const endingTimeMinutes =
      startingTimeMinutes + Number(restaurant[0].Bookingduration);

    // Determine table capacity based on party size
    let tableCapacity = 0;
    if (partySize <= 2) {
      tableCapacity = 2;
    } else if (partySize <= 4) {
      tableCapacity = 4;
    } else if (partySize <= 6) {
      tableCapacity = 6;
    } else {
      tableCapacity = 8; 
    }

    const newBooking = new Booking({
      userid: userid,
      restaurantid: restaurantId,
      date: date,
      startingTime: startingTimeMinutes,
      endingTime: endingTimeMinutes,
      partySize: partySize,
      tableCapacity: tableCapacity,
      phone: phone,
      duration: restaurant[0].Bookingduration,
    });

    const booking = await newBooking.save();
    const bookingID = booking._id.toString();
    console.log({ message: "Booking created successfully", id: bookingID });
    return res
      .status(201)
      .json({ message: "Booking created successfully", id: `${bookingID}` });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while creating the booking" });
  }
});

router.route("/userbookings").post(async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const formatTime = (minutesFromMidnight) => {
      const hours = Math.floor(minutesFromMidnight / 60);
      const minutes = minutesFromMidnight % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const userid = user._id;

    // Fetch all bookings made by the user
    let bookings = await Booking.find({ userid: userid }).sort({ date: -1 });

    // Fetch restaurant names in a single query
    const restaurantIds = bookings.map(booking => booking.restaurantid);
    const restaurants = await Restaurant.find({
      '_id': { $in: restaurantIds }
    }).select('name _id');

    // Create a mapping of restaurant ID to restaurant name
    const restaurantNameMap = restaurants.reduce((acc, restaurant) => {
      acc[restaurant._id.toString()] = restaurant.name; // Ensure the key is a string
      return acc;
    }, {});

    // Add restaurantName to each booking
    bookings = bookings.map(booking => {
      const bookingObject = booking.toObject(); // Convert Mongoose document to plain JavaScript object
      bookingObject.restaurantName = restaurantNameMap[booking.restaurantid.toString()] || 'Restaurant name not found';
      bookingObject.formattedStartingTime = formatTime(bookingObject.startingTime);
      bookingObject.formattedEndingTime = formatTime(bookingObject.endingTime);
      return bookingObject;
    });

    return res.json(bookings);
  } catch (error) {
    console.error("Error retrieving bookings:", error);
    return res.status(500).json({ message: "An error occurred while fetching bookings" });
  }
});

router.route("/deleteone/:id").delete((req, res) => {
  Booking.findByIdAndDelete(req.params.id)
    .then(() => res.json({ message: "Booking deleted successfully" }))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/getonebyid").get(async (req, res) => {
  const {id} = req.query;
  const booking = await Booking.findById(id)

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  console.log(`Booking fetched successfully ${booking}`);
  return res.json(booking);

});

router.route("/edit/:id").post((req, res) => {
  Booking.findById(req.params.id)
    .then((booking) => {
      booking.userid = req.body.userid;
      booking.restaurantid = req.body.restaurantid;
      booking.date = req.body.date;
      booking.startingTime = req.body.startingTime;
      booking.endingTime = req.body.endingTime;
      booking.partySize = req.body.partySize;
      booking.tableCapacity = req.body.tableCapacity;
      booking.phone = req.body.phone;
      booking.duration = req.body.duration;

      booking
        .save()
        .then(() => res.json({ message: "Booking updated successfully" }))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});


router.get('getbookings/:restaurantid', (req, res) => {
  Booking.find({ restaurantid: req.params.restaurantid })
    .then(bookings => res.json(bookings))
    .catch(err => res.status(400).json('Error: ' + err));
});




module.exports = router;
