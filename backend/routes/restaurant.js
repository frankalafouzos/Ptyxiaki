const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const Restaurant = require('../models/restaurant.model');
const Image = require('../models/images.model');
const RestaurantCapacity = require('../models/restaurantCapacity.model');
const { Types: { ObjectId } } = require('mongoose');
const { uploadImage, deleteImage } = require('../functions/s3-utils');

const upload = multer({ storage: multer.memoryStorage() });

router.route('/').get(async (req, res) => {
  let { page, itemsPerPage, sortField, sortOrder, categoryFilter, locationFilter, minPrice, maxPrice } = req.query;

  page = parseInt(page) || 1;
  itemsPerPage = parseInt(itemsPerPage) || 12;
  sortOrder = sortOrder === 'asc' ? 1 : -1;

  let filters = {};
  if (categoryFilter) filters.category = categoryFilter;
  if (locationFilter) filters.location = locationFilter;
  if (minPrice) filters.price = { $gte: parseFloat(minPrice) };
  if (maxPrice) filters.price = { ...filters.price, $lte: parseFloat(maxPrice) };

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

router.route('/Restaurants', async (req, res) => {
  const restaurants = await Restaurant.find({});
  const images = await Image.find()
  res.render('Restaurants', { restaurants, images, cities })
});

router.route('/:id').get(async (req, res) => {
  const id = new ObjectId(req.params.id);

  console.log("In"); // Ensure this line is executed

  const restaurant = await Restaurant.findById(id);
  const images = await Image.find({ "ImageID": restaurant.imageID });
  if (!restaurant) {
    console.log("In");
    res.status(404).json({ message: 'Restaurant not found' });
  } else {
    res.json({ restaurant, images });
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
    status: 'pending approval', // added status field
    owner
  });

  try {
    await newRestaurant.save();
    res.json(newRestaurant);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Upload image
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await uploadImage(req.file);
    const newImage = new Image({
      ImageID: req.body.imageID,
      link: result.Location,
    });
    await newImage.save();
    res.send({ imageUrl: result.Location });
  } catch (error) {
    res.status(500).send(error);
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

module.exports = router;
