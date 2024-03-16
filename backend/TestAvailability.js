require('dotenv').config()
const mongoose = require("mongoose");
let Booking = require("./models/booking.model");
let RestaurantCapacity = require("./models/restaurantCapacity.model");
let Restaurant = require("./models/restaurant.model");

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});


async function generateBookings() {
  // Booking.deleteMany({});
  const restaurantId = "65f5e0bdcae164a47210aa30"; // Target restaurant ID
  let bookingsData = [
    {
      userid: "65c2b146e88cd065d885b41a",
      restaurantid: "65f5e0bdcae164a47210aa30",
      date: new Date(2023, 2, 31), 
      startingTime: 600, // 10:00 AM
      endingTime: 720, // 12:00 PM
      partySize: 2,
      phone: "1234567890",
      duration: 120, // 120 minutes
      numberOfGuests: 2,
      tableCapacity: 2
  },
  {
      userid: "65c2b146e88cd065d885b41a",
      restaurantid: "65f5e0bdcae164a47210aa30",
      date: new Date(2023, 2, 31), 
      startingTime: 720, // 12:00 PM
      endingTime: 840, // 2:00 PM
      partySize: 4,
      phone: "0987654321",
      duration: 120,
      numberOfGuests: 4,
      tableCapacity: 4
  },
  {
      userid: "65c2b146e88cd065d885b41a",
      restaurantid: "65f5e0bdcae164a47210aa30",
      date: new Date(2023, 2, 31), 
      startingTime: 840, // 2:00 PM
      endingTime: 960, // 4:00 PM
      partySize: 2,
      phone: "2345678901",
      duration: 120,
      numberOfGuests: 2,
      tableCapacity: 2
  },
  {
      userid: "65c2b146e88cd065d885b41a",
      restaurantid: "65f5e0bdcae164a47210aa30",
      date: new Date(2023, 2, 31), 
      startingTime: 960, // 4:00 PM
      endingTime: 1080, // 6:00 PM
      partySize: 4,
      phone: "3456789012",
      duration: 120,
      numberOfGuests: 4,
      tableCapacity: 4
  },
  {
      userid: "65c2b146e88cd065d885b41a",
      restaurantid: "65f5e0bdcae164a47210aa30",
      date: new Date(2023, 2, 31), 
      startingTime: 1080, // 6:00 PM
      endingTime: 1200, // 8:00 PM
      partySize: 6,
      phone: "4567890123",
      duration: 120,
      numberOfGuests: 6,
      tableCapacity: 6
  },
  {
      userid: "65c2b146e88cd065d885b41a",
      restaurantid: "65f5e0bdcae164a47210aa30",
      date: new Date(2023, 2, 31), 
      startingTime: 1200, // 8:00 PM
      endingTime: 1320, // 10:00 PM
      partySize: 3,
      phone: "5678901234",
      duration: 120,
      numberOfGuests: 3,
      tableCapacity: 4
  },
  {
      userid: "65c2b146e88cd065d885b41a",
      restaurantid: "65f5e0bdcae164a47210aa30",
      date: new Date(2023, 2, 31), 
      startingTime: 1320, // 10:00 PM
      endingTime: 1440, // 12:00 AM
      partySize: 2,
      phone: "6789012345",
      duration: 120,
      numberOfGuests: 2,
      tableCapacity: 2
  },
  {
    userid: "65c2b146e88cd065d885b41a",
    restaurantid: "65f5e0bdcae164a47210aa30",
    date: new Date(2023, 2, 31), 
    startingTime: 780, // 1:00 PM overlaps with previous
    endingTime: 900, // 3:00 PM
    partySize: 2,
    phone: "2345678901",
    duration: 120,
    numberOfGuests: 2,
    tableCapacity: 2
},
{
    userid: "65c2b146e88cd065d885b41a",
    restaurantid: "65f5e0bdcae164a47210aa30",
    date: new Date(2023, 2, 31), 
    startingTime: 870, // 2:30 PM overlaps with previous
    endingTime: 990, // 4:30 PM
    partySize: 4,
    phone: "3456789012",
    duration: 120,
    numberOfGuests: 4,
    tableCapacity: 4
},
{
    userid: "65c2b146e88cd065d885b41a",
    restaurantid: "65f5e0bdcae164a47210aa30",
    date: new Date(2023, 2, 31), 
    startingTime: 960, // 4:00 PM overlaps with previous
    endingTime: 1080, // 6:00 PM
    partySize: 6,
    phone: "4567890123",
    duration: 120,
    numberOfGuests: 6,
    tableCapacity: 6
},
{
    userid: "65c2b146e88cd065d885b41a",
    restaurantid: "65f5e0bdcae164a47210aa30",
    date: new Date(2023, 2, 31), 
    startingTime: 1050, // 5:30 PM overlaps with previous
    endingTime: 1170, // 7:30 PM
    partySize: 3,
    phone: "5678901234",
    duration: 120,
    numberOfGuests: 3,
    tableCapacity: 4
},
{
    userid: "65c2b146e88cd065d885b41a",
    restaurantid: "65f5e0bdcae164a47210aa30",
    date: new Date(2023, 2, 31), 
    startingTime: 1140, // 7:00 PM overlaps with previous
    endingTime: 1260, // 9:00 PM
    partySize: 2,
    phone: "6789012345",
    duration: 120,
    numberOfGuests: 2,
    tableCapacity: 2
},
{
    userid: "65c2b146e88cd065d885b41a",
    restaurantid: "65f5e0bdcae164a47210aa30",
    date: new Date(2023, 2, 31), 
    startingTime: 1230, // 8:30 PM overlaps with previous
    endingTime: 1350, // 10:30 PM
    partySize: 4,
    phone: "7890123456",
    duration: 120,
    numberOfGuests: 4,
    tableCapacity: 4
},
{
    userid: "65c2b146e88cd065d885b41a",
    restaurantid: "65f5e0bdcae164a47210aa30",
    date: new Date(2023, 2, 31), 
    startingTime: 1320, // 10:00 PM overlaps with previous
    endingTime: 1440, // 12:00 AM
    partySize: 5,
    phone: "8901234567",
    duration: 120,
    numberOfGuests: 5,
    tableCapacity: 6
},
{
    userid: "65c2b146e88cd065d885b41a",
    restaurantid: "65f5e0bdcae164a47210aa30",
    date: new Date(2023, 2, 31), 
    startingTime: 1410, // 11:30 PM overlaps with previous
    endingTime: 1530, // 1:30 AM
    partySize: 3,
    phone: "9012345678",
    duration: 120,
    numberOfGuests: 3,
    tableCapacity: 4
},
{
    userid: "65c2b146e88cd065d885b41a",
    restaurantid: "65f5e0bdcae164a47210aa30",
    date: new Date(2023, 2, 31), 
    startingTime: 1500, // 1:00 AM, starts after previous ends
    endingTime: 1620, // 3:00 AM
    partySize: 2,
    phone: "0123456789",
    duration: 120,
    numberOfGuests: 2,
    tableCapacity: 2
},
{
    userid: "65c2b146e88cd065d885b41a",
    restaurantid: "65f5e0bdcae164a47210aa30",
    date: new Date(2023, 2, 31), 
    startingTime: 1590, // 2:30 AM, overlaps with previous
    endingTime: 1710, // 4:30 AM
    partySize: 4,
    phone: "1234567890",
    duration: 120,
    numberOfGuests: 4,
    tableCapacity: 4
}
  
    
      
  ];

  try {
      for (let bookingData of bookingsData) {
          const booking = new Booking(bookingData);
          await booking.save();
      }
      console.log("Bookings generated successfully.");
  } catch (error) {
      console.error("Error generating bookings:", error);
  }
}






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
    // Handle the error here
  }
};

let Availability = getAvailability("65f5e0bdcae164a47210aa30", new Date(2023, 2, 31), 4);
console.log(Availability);
// generateBookings();
