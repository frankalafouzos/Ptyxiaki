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

router.post('/add', async (req, res) => {
    const { name, price, category, location, phone, email, description, tables, seatsPerTable, Bookingduration, openHour, closeHour, owner, ApplicationCategory, ExistingRestaurantId } = req.body;
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
      status: 'pending approval', // added status field
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


  // Delete only the restaurant by ID
router.delete('/:id', (req, res) => {
    Restaurant.findByIdAndDelete(req.params.id)
      .then(() => res.json('Restaurant deleted.'))
      .catch(err => res.status(404).json('Error: ' + err));
  });



module.exports = router;