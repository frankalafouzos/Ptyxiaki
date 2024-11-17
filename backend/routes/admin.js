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
    if (restaurant.status === "Hidden") {
      restaurant.status = "Approved";
    } else {
      restaurant.status = "Hidden";
    }
    await restaurant.save();
    res.json("Restaurant hidden!");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.route("/approve-restaurant/:id").post(async (req, res) => {
  const RestaurantID = new ObjectId(req.params.id);
  try {
    const restaurant = await Restaurant.findById(RestaurantID);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    restaurant.status = "Approved";

    await restaurant.save();
    res.json("Restaurant approved!");
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


// Get all users for admin
// router.route('/allUsers').get(async (req, res) => {
//   try {
//     const users = await User.find();
//     const owners = await Owner.find();

//     // Combine users and owners, with 'role' indicating 'User' or 'Owner'
//     const combinedData = [
//       ...users.map(user => ({ ...user.toObject(), role: user.admin ? 'Admin' : 'User' })),
//       ...owners.map(owner => ({ ...owner.toObject(), role: 'Owner' }))
//     ];

//     console.log('Final combinedData:', combinedData); // Debugging output

//     res.status(200).json(combinedData); // Send the combined array
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });



// Get all users with filters and sorting
router.route('/allUsers').get(async (req, res) => {
  try {
    const { role, searchQuery, sortField, sortOrder } = req.query;

    // Fetch users and owners
    const users = await User.find();
    const owners = await Owner.find();

    // Combine users and owners
    let combinedData = [
      ...users.map(user => ({ ...user.toObject(), role: user.admin ? 'Admin' : 'User' })),
      ...owners.map(owner => ({ ...owner.toObject(), role: 'Owner' }))
    ];

    // Filter based on role if specified
    if (role) {
      combinedData = combinedData.filter(user => user.role === role);
    }

    // Search filter: checks if any of the search criteria match
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      combinedData = combinedData.filter(user =>
        `${user.firstname} ${user.lastname}`.toLowerCase().includes(lowercasedQuery) ||
        user.email.toLowerCase().includes(lowercasedQuery)
      );
    }

    // Sort the data if a sort field is specified
    if (sortField) {
      combinedData.sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];

        if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    res.status(200).json(combinedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Delete a user by ID
router.delete('/user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
});

// Toggle admin status of a user by ID
router.patch('/user/:id/toggleAdmin', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.admin = !user.admin;
    await user.save();

    res.status(200).json({ message: `User ${user.admin ? 'promoted to' : 'demoted from'} admin`, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle admin status', error: error.message });
  }
});


// Route to add a new admin
router.post('/addAdmin', async (req, res) => {
  const { firstname, lastname, email, location, password } = req.body;
  console.log("Body: " + JSON.stringify(req.body))
  // Check if all required fields are provided
  if (!firstname || !lastname || !email || !password || !location) {
      return res.status(400).json({ message: 'All fields are required' });
  }

  try {
      // Check if a user with the provided email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: 'Email is already in use' });
      }

      // Create a new user with the admin flag set to true
      const newUser = new User({
          firstname,
          lastname,
          email,
          password, // This will be hashed automatically by the pre-save hook
          location,
          admin: true
      });

      await newUser.save();
      res.status(201).json({ message: 'Admin user created successfully', user: newUser });
  } catch (error) {
      console.error('Error creating admin:', error);
      res.status(500).json({ message: 'Server error' });
  }
});






module.exports = router;