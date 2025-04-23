const router = require("express").Router();
let User = require("../models/users.model");
let Restaurant = require("../models/restaurant.model");
let pendingApprovalRestaurant = require("../models/pendingApprovalRestaurant.model");
const PendingEdits = require('../models/pendingEdits.model');
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
  console.log("RestaurantID: " + RestaurantID);
  try {
    const pendingRestaurant = await pendingApprovalRestaurant.findById(RestaurantID); // Fetch from pending collection
    if (!pendingRestaurant) {
      return res.status(404).json({ error: 'Pending restaurant not found' });
    }

    console.log("Existing Restaurant ID: " + pendingRestaurant.ExistingRestaurantId);

    if (pendingRestaurant.ExistingRestaurantId) {
      // Handle edit request
      const existingRestaurant = await Restaurant.findById(pendingRestaurant.ExistingRestaurantId);
      if (!existingRestaurant) {
        // Return a descriptive error message if the existing restaurant is not found
        return res.status(404).json({ error: 'Existing restaurant not found for the provided ID' });
      }
      console.log("Existing Restaurant: " + existingRestaurant);

      // Update the existing restaurant with the new data
      existingRestaurant.name = pendingRestaurant.name;
      existingRestaurant.price = pendingRestaurant.price;
      existingRestaurant.category = pendingRestaurant.category;
      existingRestaurant.location = pendingRestaurant.location;
      existingRestaurant.phone = pendingRestaurant.phone;
      existingRestaurant.email = pendingRestaurant.email;
      existingRestaurant.description = pendingRestaurant.description;
      existingRestaurant.imageID = pendingRestaurant.imageID;
      existingRestaurant.Bookingduration = pendingRestaurant.Bookingduration;
      existingRestaurant.openHour = pendingRestaurant.openHour;
      existingRestaurant.closeHour = pendingRestaurant.closeHour;
      existingRestaurant.status = "Approved"; // Ensure the status is set to Approved

      await existingRestaurant.save(); // Save the updated restaurant
    } else {
      // Handle new restaurant submission
      const approvedRestaurant = new Restaurant({
        name: pendingRestaurant.name,
        price: pendingRestaurant.price,
        category: pendingRestaurant.category,
        location: pendingRestaurant.location,
        phone: pendingRestaurant.phone,
        email: pendingRestaurant.email,
        description: pendingRestaurant.description,
        imageID: pendingRestaurant.imageID,
        status: "Approved", // Set status to Approved
        owner: pendingRestaurant.owner,
        Bookingduration: pendingRestaurant.Bookingduration,
        openHour: pendingRestaurant.openHour,
        closeHour: pendingRestaurant.closeHour,
      });

      await approvedRestaurant.save(); // Save to the main Restaurant collection
    }

    // Remove the pending restaurant from the pending collection
    await pendingApprovalRestaurant.findByIdAndDelete(RestaurantID);

    console.log("Restaurant approved and processed!");
    res.json("Restaurant approved and processed!");
  } catch (error) {
    console.error("Error approving restaurant:", error);
    res.status(500).json({ message: 'An error occurred while approving the restaurant', error: error.message });
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

    const pendingRestaurants = await Restaurant.find(query)
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


// Route to approve a pending edit
router.post('/approve-edit/:id', async (req, res) => {
  try {
    // Find the pending edit
    const pendingEdit = await PendingEdits.findById(req.params.id);
    if (!pendingEdit) {
      return res.status(404).json({ message: 'Pending edit not found' });
    }

    // Find the restaurant
    const restaurant = await Restaurant.findById(pendingEdit.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Flag to track if we need to handle closedDays separately
    let hasClosedDaysChange = false;
    let closedDaysValue = null;
    
    // Process each change
    for (const [field, value] of Object.entries(pendingEdit.changes)) {
      console.log(`Processing change for field: ${field}`);
      
      if (field === 'closedDays') {
        // Mark for special handling after main updates
        hasClosedDaysChange = true;
        closedDaysValue = value.new;
        continue;
      }
      
      // Handle other fields normally
      if (restaurant[field] !== undefined) {
        restaurant[field] = value.new;
      }
    }
    
    // Save the restaurant with all regular field updates
    await restaurant.save();
    
    // Handle closed days separately if needed
    if (hasClosedDaysChange) {
      console.log('Handling closed days change:', closedDaysValue);
      
      // Import DefaultClosedDay at the top of your file
      const DefaultClosedDay = require('../models/DefaultClosedDays.model');
      
      // Delete existing closed days
      await DefaultClosedDay.deleteMany({ restaurant: restaurant._id });
      
      // Create new entries for all days
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      const defaultDays = dayNames.map((dayName) => {
        const isClosed = Array.isArray(closedDaysValue) && closedDaysValue.includes(dayName);
        return {
          restaurant: restaurant._id,
          dayOfWeek: dayName,
          isClosed: isClosed
        };
      });
      
      // Insert all the new entries
      await DefaultClosedDay.insertMany(defaultDays);
      console.log(`Default closed days updated for restaurant ${restaurant._id}`);
    }
    
    // Delete the pending edit
    await PendingEdits.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Edit approved successfully' });
  } catch (error) {
    console.error('Error approving edit:', error);
    res.status(500).json({ message: 'Failed to approve edit', error: error.message });
  }
});

// Add a route specifically for processing image changes if needed
router.post("/process-image-changes/:id", async (req, res) => {
  try {
    const { restaurantId, imageId, changes } = req.body;
    
    if (!changes || !restaurantId || !imageId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    console.log(`Processing image changes for restaurant ${restaurantId}`);
    
    // Process deleted images
    if (changes.deleted && Array.isArray(changes.deleted) && changes.deleted.length > 0) {
      for (const img of changes.deleted) {
        const imageId = img.id || img._id;
        if (imageId) {
          await Image.findByIdAndDelete(imageId);
          console.log(`Deleted image ${imageId}`);
        }
      }
    }
    
    // For "added" images, they should already be uploaded
    // but we can verify they exist and are properly linked
    
    res.json({ message: "Image changes processed successfully" });
  } catch (error) {
    console.error("Error processing image changes:", error);
    res.status(500).json({ message: error.message });
  }
});

// Route to reject a pending edit
router.post("/reject-edit/:id", async (req, res) => {
  try {
    const pendingEdit = await PendingEdits.findById(req.params.id);
    if (!pendingEdit || pendingEdit.status !== 'pending approval') {
      return res.status(404).json({ error: 'Pending edit not found or not in pending status' });
    }

    // Update status
    pendingEdit.status = 'rejected';
    await pendingEdit.save();

    res.json({ message: "Edit rejected" });
  } catch (error) {
    console.error("Error rejecting edit:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;