const router = require("express").Router();
let User = require("../models/users.model");
let Restaurant = require("../models/restaurant.model");
let Owner = require("../models/restaurantOwner.model");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");
const Image = require('../models/images.model');
const { Types: { ObjectId } } = require('mongoose');

// /admins

router.route("/changeRole").post(async (req, res) => {
  try {
    const email = req.body.email;
    console.log("Email: " + email);
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.admin !== true) {
      return res.status(403).json({ error: 'Not an Admin!' });
    }
    user.admin = false;
    await user.save();
    res.status(200).json("Role changed to User!");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



router.route("/editpassword").post(async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  console.log("Email: " + email)
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const result = user.isValidPassword(currentPassword)

    if (!result) {
      throw Error('Current password is incorrect');
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json("Password edited!");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



router.route("/profile").post(async (req, res) => {
  try {
    const email = req.body.email;
    console.log("Email: " + email);
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.route("/editprofile").post(async (req, res) => {
  const { firstname, lastname, email, location } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log("In")
    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.location = location;

    console.log("User: " + JSON.stringify(user))
    await user.save();
    res.json("User edited!");
  } catch (error) {
    console.log("Error: " + error)
    res.status(400).json({ error: error });
  }
});

router.route("/hide-restaurant/:id").post(async (req, res) => {
  const RestaurantID = new ObjectId(req.params.id);
  try {
    const restaurant = await Restaurant.findById(RestaurantID);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    restaurant.status = "Hidden";
    await restaurant.save();
    res.json("Restaurant hidden!");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.route('/restaurants').get(async (req, res) => {
  let { page, itemsPerPage, sortField, sortOrder, categoryFilter, locationFilter, minPrice, maxPrice } = req.query;

  page = parseInt(page) || 1;
  itemsPerPage = parseInt(itemsPerPage) || 12;
  sortOrder = sortOrder === 'asc' ? 1 : -1;

  let filters = {};
  if (categoryFilter) filters.category = categoryFilter;
  if (locationFilter) filters.location = locationFilter;
  if (minPrice) filters.price = { $gte: parseFloat(minPrice) };
  if (maxPrice) filters.price = { ...filters.price, $lte: parseFloat(maxPrice) };
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

const getCurrentTimeInMinutes = () => {
  const date = new Date();
  return date.getHours() * 60 + date.getMinutes();
};


router.route("/get-filtered-restaurants").post(async (req, res) => {
  const {
    name,
    category,
    location,
    minPrice,
    maxPrice,
    status,
    owner,
    minVisits,
    openNow
  } = req.query;

  let filter = {};

  // Add filters based on user input
  if (name) {
    filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search using regex
  }

  if (category) {
    filter.category = category;
  }

  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (status) {
    filter.status = status;
  }

  if (owner) {
    filter.owner = owner;
  }

  if (minVisits) {
    filter.visitCounter = { $gte: Number(minVisits) };
  }

  // Optional: Check if the restaurant is currently open based on openHour and closeHour
  if (openNow) {
    const currentTime = getCurrentTimeInMinutes();
    filter.openHour = { $lte: currentTime };
    filter.closeHour = { $gte: currentTime };
  }

  try {
    const restaurants = await Restaurant.find(filter);
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching restaurants', error });
  }
});









//Admin routes for restaurants

// Handle POST request for filtering restaurants
router.post('/filter', async (req, res) => {
  const {
    searchQuery,
    page = 1,
    itemsPerPage = 12,
    sortField = 'createdAt',
    sortOrder = 'asc',
    categoryFilter,
    locationFilter,
    minPrice,
    maxPrice,
    status, // Receiving status filter
    visitCounterMin, // Receiving min visit counter
    visitCounterMax, // Receiving max visit counter
  } = req.body;  // Read filters from the body

  const regex = new RegExp(searchQuery, 'i');

  const query = {
    $or: [
      { name: { $regex: regex } },
      { category: { $regex: regex } },
      { location: { $regex: regex } }
    ]
  };

  if (categoryFilter) query.category = categoryFilter;
  if (locationFilter) query.location = locationFilter;
  if (minPrice) query.price = { $gte: minPrice };
  if (maxPrice) query.price = { $lte: maxPrice };
  if (minPrice && maxPrice) query.price = { $gte: minPrice, $lte: maxPrice };

  // Status filter
  if (status) query.status = status;

  // Visit counter range filter
  if (visitCounterMin) query.visitCounter = { $gte: visitCounterMin };
  if (visitCounterMax) query.visitCounter = { $lte: visitCounterMax };
  if (visitCounterMin && visitCounterMax) {
    query.visitCounter = { $gte: visitCounterMin, $lte: visitCounterMax };
  }

  try {
    const restaurants = await Restaurant.find(query)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * itemsPerPage)
      .limit(parseInt(itemsPerPage));

    const images = await Image.find();

    const totalPages = Math.ceil((await Restaurant.countDocuments(query)) / itemsPerPage);

    res.json({ restaurants, totalPages, images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching restaurants' });
  }
});






module.exports = router;