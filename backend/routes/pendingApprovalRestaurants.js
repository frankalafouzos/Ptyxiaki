const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Restaurant = require('../models/pendingApprovalRestaurant.model');
const Image = require('../models/images.model');
const RestaurantCapacity = require('../models/restaurantCapacity.model');
const Owner = require('../models/restaurantOwner.model')
const { Types: { ObjectId } } = require('mongoose');
const { uploadImage, deleteImage } = require('../functions/s3-utils');

const upload = multer({ storage: multer.memoryStorage() });


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

router.post('/add', async (req, res) => {
  const {
    name,
    price,
    category,
    location,
    phone,
    email,
    description,
    tables,
    seatsPerTable,
    Bookingduration,
    openHour,
    closeHour,
    owner,
    ApplicationCategory,
    ExistingRestaurantId,
  } = req.body;

  // Find existing pending approval changes for the restaurant
  const existing_changes = await Restaurant.find({
    ExistingRestaurantId: ExistingRestaurantId,
    status: 'pending approval',
  });

  if (existing_changes.length > 0) {
    // Update all existing changes' status to "Overrun changes" or "Past changes"
    await Restaurant.updateMany(
      { ExistingRestaurantId: ExistingRestaurantId, status: 'pending approval' },
      { $set: { status: 'Past changes' } } // Update the status as needed
    );
  } else {
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
      Bookingduration,
      openHour,
      closeHour,
      ApplicationCategory, // Either Edit or Add (If Edit, when approved the changes will be passed in the existing one)(If Add a new restaurant will be created.)
      ExistingRestaurantId,
      status: 'pending approval', // Added status field
      owner,
    });
    try {
      await newRestaurant.save();
      console.log('Done');
      res.json(newRestaurant);
    } catch (err) {
      res.status(400).json('Error: ' + err);
    }
  }
});


// Delete only the restaurant by ID
router.delete('/:id', (req, res) => {
  Restaurant.findByIdAndDelete(req.params.id)
    .then(() => res.json('Restaurant deleted.'))
    .catch(err => res.status(404).json('Error: ' + err));
});



module.exports = router;