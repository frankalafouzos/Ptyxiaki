const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Restaurant = require('../models/restaurant.model');
const Image = require('../models/images.model');
const RestaurantCapacity = require('../models/restaurantCapacity.model');
const Owner = require('../models/restaurantOwner.model')
const BookingRating = require("../models/bookingRating.model");
const Booking = require("../models/booking.model");
const DefaultClosedDay = require('../models/DefaultClosedDays.model');
const ClosedDate = require('../models/ClosedDates.model');
const { Types: { ObjectId } } = require('mongoose');
const { uploadImage, deleteImage } = require('../functions/s3-utils');

const upload = multer({ storage: multer.memoryStorage() });

const extractFileName = (url) => {
  const parts = url.split('/');
  return parts[parts.length - 1];
};


//Not needed right now
// router.post('/ChangeStatusOfAllRestaurants', async (req, res) => {
//   try {
//     const restaurants = await Restaurant.find({});
//     for (restaurant of restaurants) {
//       restaurant.status = "Approved";
//       await restaurant.save()
//     }
//     res.status(200).send('All restaurant statuses updated to Approved');
//   } catch (error) {
//     res.status(500).send('An error occurred');
//   }
// });


// Get all unique locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await Restaurant.distinct('location');
    res.json(locations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching locations' });
  }
});

// Get all unique categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Restaurant.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Get all unique status
router.get('/status', async (req, res) => {
  try {
    const status = await Restaurant.distinct('status');
    res.json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching status' });
  }
});

router.route('/').get(async (req, res) => {
  let { page, itemsPerPage, sortField, sortOrder, categoryFilter, locationFilter, minPrice, maxPrice, owner, searchQuery } = req.query;

  const regex = new RegExp(searchQuery, 'i');

  const filters = {
    $or: [
      { name: { $regex: regex } },
      { category: { $regex: regex } },
      { location: { $regex: regex } }
    ]
  };

  page = parseInt(page) || 1;
  itemsPerPage = parseInt(itemsPerPage) || 12;
  sortOrder = sortOrder === 'asc' ? 1 : -1;


  if (categoryFilter) filters.category = categoryFilter;
  if (locationFilter) filters.location = locationFilter;
  if (minPrice) filters.price = { $gte: parseFloat(minPrice) };
  if (maxPrice) filters.price = { ...filters.price, $lte: parseFloat(maxPrice) };
  if (owner) filters.owner = owner; 
  filters.status = "Approved";

  let sort = {};
  if (sortField) sort[sortField] = sortOrder;

  try {
    const restaurants = await Restaurant.find(filters).sort(sort).skip((page - 1) * itemsPerPage).limit(itemsPerPage);
    const totalItems = await Restaurant.countDocuments(filters);
    const images = await Image.find();

    res.json({ restaurants, images, totalPages: Math.ceil(totalItems / itemsPerPage) });
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// router.route('/Restaurants', async (req, res) => {
//   const restaurants = await Restaurant.find({});
//   const images = await Image.find()
//   res.render('Restaurants', { restaurants, images, cities })
// });

router.get('/top-restaurants', async (req, res) => {
  try {
    // Fetch top 10 restaurants sorted by visitCounter
    const topRestaurants = await Restaurant.find({ status: 'Approved' })
      .sort({ visitCounter: -1 })
      .limit(10)
      .lean(); // Use lean() for better performance

    // Fetch images for each restaurant
    const topRestaurantsWithImages = await Promise.all(
      topRestaurants.map(async (restaurant) => {
        const images = await Image.find({ ImageID: restaurant.imageID }).lean();
        return {
          restaurant,
          images,
        };
      })
    );

    res.json(topRestaurantsWithImages);
  } catch (error) {
    console.error('Error fetching top restaurants:', error);
    res.status(500).json({ message: 'Error fetching top restaurants' });
  }
});

router.route('/:id').get(async (req, res) => {
  const id = new ObjectId(req.params.id);
  console.log("ID: ", id)
  const restaurant = await Restaurant.findById(id);
  console.log("Restaurant: ", restaurant)
  
  if (!restaurant) {
    return res.status(404).json({ message: 'Restaurant not found' });
  }
  
  const images = await Image.find({ ImageID: restaurant.imageID });
  res.json({ restaurant, images });
});

// Get restaurant analytics/stats
router.get('/:id/analytics', async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    console.log(`Fetching analytics for restaurant ${restaurantId}, year ${year}`);

    // Get restaurant data
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get all bookings for this restaurant
    const bookings = await Booking.find({ restaurantid: restaurantId });
    console.log(`Found ${bookings.length} total bookings for restaurant`);

    // Filter bookings by year
    const filteredBookings = bookings.filter((booking) => {
      const bookingYear = new Date(booking.date).getFullYear();
      return bookingYear === year;
    });
    console.log(`Found ${filteredBookings.length} bookings for year ${year}`);

    // Calculate all stats
    const totalBookings = bookings.length;
    const totalBookingsThisYear = filteredBookings.length;
    
    // Calculate total guests (all time)
    const totalGuests = bookings.reduce((sum, booking) => {
      return sum + (booking.partySize || 0);
    }, 0);
    
    // Calculate total guests this year
    const totalGuestsThisYear = filteredBookings.reduce((sum, booking) => {
      return sum + (booking.partySize || 0);
    }, 0);
    
    // Calculate average guests per booking (this year)
    const averageGuestsPerBooking = totalBookingsThisYear > 0 
      ? Math.round(totalGuestsThisYear / totalBookingsThisYear) 
      : 0;
    
    // Calculate bookings per day (this year only)
    const bookingsPerDay = filteredBookings.reduce((acc, booking) => {
      const date = new Date(booking.date).toLocaleDateString('en-GB'); // DD/MM/YYYY format
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {});
    
    // Calculate bookings per hour (all time for better data)
    const hours = Array(24).fill(0);
    bookings.forEach((booking) => {
      const hour = Math.floor(booking.startingTime / 60);
      if (hour >= 0 && hour < 24) {
        hours[hour]++;
      }
    });

    // Find busiest hour
    const maxBookings = Math.max(...hours);
    const busiestHour = maxBookings > 0 ? hours.indexOf(maxBookings) : null;

    console.log('Analytics calculated:', {
      totalBookings,
      totalBookingsThisYear,
      totalGuests,
      totalGuestsThisYear,
      averageGuestsPerBooking,
      busiestHour,
      bookingsPerDayCount: Object.keys(bookingsPerDay).length,
      maxHourlyBookings: maxBookings
    });

    const analytics = {
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        status: restaurant.status
      },
      stats: {
        totalBookings,
        totalBookingsThisYear,
        totalGuests,
        totalGuestsThisYear,
        averageGuestsPerBooking,
        busiestHour,
        bookingsPerDay,
        bookingsPerHour: hours
      },
      year
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching restaurant analytics:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
});

// Get owner with active restaurants
router.post('/filterActiveRestaurants', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get owner data
    const owner = await Owner.findOne({ email: email });
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    // Get all active restaurants in one query
    const activeRestaurants = await Restaurant.find({
      _id: { $in: owner.restaurantsIds },
      status: { $ne: 'Deleted' }
    }).select('_id name status');

    // Extract just the IDs for the frontend
    const activeRestaurantIds = activeRestaurants.map(restaurant => restaurant._id);

    const dashboardData = {
      owner: {
        id: owner._id,
        email: owner.email,
        restaurantsIds: owner.restaurantsIds,
        activeRestaurantsIds: activeRestaurantIds
      },
      activeRestaurants: activeRestaurants
    };

    console.log(`Owner ${email} has ${activeRestaurantIds.length} active restaurants`);
    res.json(dashboardData);

  } catch (error) {
    console.error('Error fetching owner dashboard:', error);
    res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
});

router.post('/add', async (req, res) => {
  const { name, price, category, location, phone, email, description, tables, seatsPerTable, Bookingduration, openHour, closeHour, owner } = req.body;
  let imageID = crypto.randomUUID();
  const newRestaurant = new Restaurant({
    name,
    price,
    category,
    location,
    imageID,
    phone,
    email,
    description,
    tables,
    seatsPerTable,
    Bookingduration,
    openHour,
    closeHour,
    status: 'Pending Approval', // added status field
    owner
  });
  try {
    await newRestaurant.save();
    console.log("Done")
    res.json(newRestaurant);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Edit restaurant
router.put('/edit/:id', async (req, res) => {
  try {
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedRestaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete image
router.delete('/delete-image/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await deleteImage(image.Key);
    await image.remove();
    res.json({ message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add restaurant capacity
router.post('/restaurant-capacities/add', async (req, res) => {
  const { restaurantid, tablesForTwo, tablesForFour, tablesForSix, tablesForEight } = req.body;

  const newCapacity = new RestaurantCapacity({
    restaurantid,
    tablesForTwo,
    tablesForFour,
    tablesForSix,
    tablesForEight
  });

  try {
    await newCapacity.save();
    res.json(newCapacity);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Delete only the restaurant by ID
router.delete('/:id', (req, res) => {
  Restaurant.findByIdAndDelete(req.params.id)
    .then(() => res.json('Restaurant deleted.'))
    .catch(err => res.status(404).json('Error: ' + err));
});

// Delete a restaurant capacity by restaurant ID
router.delete('/restaurant-capacities/:id', (req, res) => {
  RestaurantCapacity.findOneAndDelete({ restaurantId: req.params.id })
    .then(() => res.json('Restaurant capacity deleted.'))
    .catch(err => res.status(404).json('Error: ' + err));
});

//Delete status temporarily by changing the status to "Deleted"
router.delete('/delete/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    restaurant.status = "Deleted";
    await restaurant.save();
    res.json("Deleted");
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
})


// Delete all restaurants info by ID
router.post('/deleteAll/:id', async (req, res) => {
  const id = new ObjectId(req.params.id);
  const ownerId = new ObjectId(req.body.ownerId)


  const restaurant = await Restaurant.findById(id);
  const images = await Image.find({ ImageID: restaurant.imageID });
 
  for (image of images) {
    let response = await deleteImage(extractFileName(image.link))
    let response_2 = await Image.deleteOne({ _id: image._id })
    console.log(response + "/nResponse from Mongo: " + response_2)
    console.log("ImageID for the image jst deleted: "+image.ImageID)
  }

  await RestaurantCapacity.deleteOne({ restaurantid: id })

 
  const result = await Owner.updateOne(  
    { _id: ownerId },
    { $pull: { restaurantsIds: restaurant._id } }
  );
  console.log(result)


  Restaurant.findByIdAndDelete(id)
    .then(() => res.json('Restaurant deleted.'))
    .catch(err => res.status(404).json('Error: ' + err));
});

//Get restaurant capacities by restaurant ID 
router.get('/restaurant-capacities/:id', async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const capacities = await RestaurantCapacity.findOne({ restaurantid: restaurantId });
    res.json(capacities);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

router.post('/increnmentVisitCounter/:id', async (req, res) => {
  try {
    console.log("ID: ", req.params.id);
    const restaurant = await Restaurant.findById(req.params.id);
    console.log("Restaurant: ", restaurant);
    
    restaurant.visitCounter += 1;
    await restaurant.save();
    res.status(200).json({ message: "Visit counter incremented for restaurant with id: "+ req.params.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/restaurants/:restaurantId/ratings', async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const ratings = await BookingRating.find({ restaurantId }).populate('userId', 'firstname lastname');
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length || 0;

    res.status(200).json({ ratings, averageRating });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to fetch restaurant capacity and bookings
router.get('/:restaurantId/capacity', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    // Fetch restaurant capacity
    const capacity = await RestaurantCapacity.findOne({ restaurantid: restaurantId });
    if (!capacity) {
      return res.status(404).json({ message: 'Capacity data not found' });
    }
    const totalCapacity = capacity.totalCapacity();

    // Fetch bookings for the restaurant
    const bookings = await Booking.find({ restaurantid: restaurantId });

    // Calculate capacity usage per day
    const capacityData = bookings.reduce((acc, booking) => {
      const date = booking.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { bookedSeats: 0, totalCapacity };
      }
      acc[date].bookedSeats += booking.partySize;
      return acc;
    }, {});

    const result = Object.entries(capacityData).map(([date, data]) => ({
      date,
      bookedSeats: data.bookedSeats,
      totalCapacity: data.totalCapacity,
      capacityPercentage: Math.round((data.bookedSeats / data.totalCapacity) * 100),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to fetch bookings for a specific day
router.get('/:restaurantId/bookings/:date', async (req, res) => {
  try {
    const { restaurantId, date } = req.params;

    // Get bookings for the given restaurant and date
    const bookings = await Booking.find({
      restaurantid: restaurantId,
      date: new Date(date),
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get closed dates for a restaurant
router.get('/:restaurantId/closedDates', async (req, res) => {
  try {
    const closedDates = await ClosedDate.find({ restaurantId: req.params.restaurantId });
    res.json(closedDates.map((entry) => entry.date.toISOString().split('T')[0]));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch closed dates.' });
  }
});

// Add a closed date
router.post('/:restaurantId/close', async (req, res) => {
  const { date } = req.body;

  try {
    // Check if there are bookings on the given date
    const existingBookings = await Booking.find({
      restaurantid: req.params.restaurantId,
      date: new Date(date),
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({ message: 'Cannot close the restaurant on this day. Existing bookings found.' });
    }

    // Add closed date
    const closedDate = new ClosedDate({
      restaurantId: req.params.restaurantId,
      date: new Date(date),
    });

    await closedDate.save();
    res.status(200).json({ message: 'Date successfully closed.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to close the date.' });
  }
});

// Remove a closed date
router.delete('/:restaurantId/closedDates', async (req, res) => {
  const { date } = req.body;

  try {
    await ClosedDate.deleteOne({
      restaurantId: req.params.restaurantId,
      date: new Date(date),
    });
    res.status(200).json({ message: 'Closed date successfully removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove closed date.' });
  }
});

// GET: Fetch default closed days for a restaurant
router.get('/:restaurantId/default-closed-days', async (req, res) => {
  const { restaurantId } = req.params;

  try {
    const defaults = await DefaultClosedDay.find({ restaurant: restaurantId });

    
    // Extract only the days that are closed
    const closedDays = defaults
      .filter(day => day.isClosed)
      .map(day => day.dayOfWeek);

    console.log("Closed days: ", closedDays)

    res.status(200).json(closedDays);
  } catch (err) {
    console.error('Error fetching default closed days:', err);
    res.status(500).json({ message: 'Failed to fetch default closed days.' });
  }
});


// POST: Set default closed days for a restaurant
router.post('/default-closed-days/set', async (req, res) => {
  const { restaurantId, closedDays } = req.body;
  console.log("Closed days (raw):", closedDays);
  
  try {
    // Convert string ID to ObjectId
    const restaurantObjectId = new ObjectId(restaurantId);
    
    // First, delete any existing default closed day entries for this restaurant
    await DefaultClosedDay.deleteMany({ restaurant: restaurantObjectId });
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Map between day names and indices
    const dayIndices = {};
    dayNames.forEach((name, index) => {
      dayIndices[name] = index;
    });
    
    // Create entries for all days of the week
    const defaultDays = dayNames.map((dayName) => {
      // Check if this day name is in the closedDays array
      const isClosed = Array.isArray(closedDays) && closedDays.includes(dayName);
      console.log(`Day ${dayName}: closed = ${isClosed}`);
      
      return {
        restaurant: restaurantObjectId,
        dayOfWeek: dayName,
        isClosed: isClosed
      };
    });

    // Insert all the new entries
    await DefaultClosedDay.insertMany(defaultDays);

    console.log(`Default closed days set for restaurant ${restaurantId}:`, closedDays);
    res.status(200).json({ 
      message: 'Default closed days set successfully',
      closedDays
    });
  } catch (err) {
    console.error('Error setting default closed days:', err);
    res.status(500).json({ message: 'Failed to set default closed days' });
  }
});



module.exports = router;
