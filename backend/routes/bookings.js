const router = require("express").Router();
let Booking = require("../models/booking.model");
let RestaurantCapacity = require("../models/restaurantCapacity.model");
const Restaurant = mongoose.model('Restaurant');


router.route("/").get((req, res) => {
  Booking.find()
    .then((bookings) => res.json(bookings))
    .catch((err) => res.status(400).json("Error: " + err));
});

// Old code
// router.route("availability/:restaurantId").get((req, res) => {
//   const restaurantId = req.params.restaurantId;
//   const date = req.query.date;
//   const partyNumber = req.query.partyNumber;
//   let bookings = Booking.find({ restaurantid: restaurantId, date: date});
//   let Capacity = RestaurantCapacity.find({ restaurantid: restaurantId });
  
//   let bookingsfor2 = 0, bookingsfor4 = 0, bookingsfor6 = 0, bookingsfor8 = 0;

//   bookings.forEach((booking) => {
//     if (booking.tableCapacity === "2") {
//       bookingsfor2 += booking.numberOfGuests;
//     } else if (booking.tableCapacity === "4") {
//       bookingsfor4 += booking.numberOfGuests;
//     } else if (booking.tableCapacity === "6") {
//       bookingsfor6 += booking.numberOfGuests;
//     } else if (booking.tableCapacity === "8") {
//       bookingsfor8 += booking.numberOfGuests;
//     }
//   });

//   let trueCapacityFor2 = Capacity.tablesForTwo - bookingsfor2;
//   let trueCapacityFor4 = Capacity.tablesForFour - bookingsfor4;
//   let trueCapacityFor6 = Capacity.tablesForSix - bookingsfor6;
//   let trueCapacityFor8 = Capacity.tablesForEight - bookingsfor8;

//   if(partyNumber <= 2) {
//     if(trueCapacityFor2 > 0) {
//       res.json(true);
//     } else {
//       res.json(false);
//     }
//   }
//   if(partyNumber <= 4) {
//     if(trueCapacityFor4 > 0) {
//       res.json(true);
//     } else {
//       res.json(false);
//     }
//   }
//   if(partyNumber <= 6) {
//     if(trueCapacityFor6 > 0) {
//       res.json(true);
//     } else {
//       res.json(false);
//     }
//   }
//   if(partyNumber <= 8) {
//     if(trueCapacityFor8 > 0) {
//       res.json(true);
//     } else {
//       res.json(false);
//     }
//   }


// });

// Helper function to add minutes to a given time string
function addMinutesToTime(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0, 0);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// Function to check slot availability against existing bookings
function isSlotAvailable(slot, bookings, bookingDuration) {
    return !bookings.some(booking => {
        const bookingEnd = addMinutesToTime(booking.time, parseInt(booking.duration));
        const slotEnd = addMinutesToTime(slot, bookingDuration);
        // Check if slot overlaps with booking time
        return (slot < bookingEnd && slotEnd > booking.time);
    });
}

router.get("/availability/:restaurantId", async (req, res) => {
    const restaurantId = req.params.restaurantId;
    const date = req.query.date; // Expecting format YYYY-MM-DD
    const partyNumber = parseInt(req.query.partyNumber, 10);

    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).send('Restaurant not found');

        const capacity = await RestaurantCapacity.findOne({ restaurantid: restaurantId });
        if (!capacity) return res.status(404).send('Capacity information not found');

        const bookings = await Booking.find({ restaurantid: restaurantId, date: new Date(date) });

        // Generate slots based on restaurant operating hours at 30-minute intervals
        let slots = [];
        let currentTime = restaurant.openHour;
        while (currentTime < restaurant.closeHour) {
            slots.push(currentTime);
            currentTime = addMinutesToTime(currentTime, 30); // Increment by 30 minutes
        }

        // Filter slots based on existing bookings and party size
        const bookingDuration = restaurant.Bookingduration; // Assuming this is in minutes
        let availableSlots = slots.filter(slot => isSlotAvailable(slot, bookings, bookingDuration));

        // Adjust the response based on the party size and capacity
        // Here, you might want to further filter `availableSlots` based on the party size and actual table capacity
        // This part of logic is omitted for brevity and needs to be adjusted based on how you want to handle capacity vs. party size

        res.json({ availableSlots });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
