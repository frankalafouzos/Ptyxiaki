require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const Restaurants = require('./models/restaurant.model');
const Image = require('./models/images.model');
const cities = require('./listOfCities');
const { categories, descriptions, names } = require('./names');
const crypto = require('crypto');

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

const seedDB = async () => {
  try {
    await Restaurants.deleteMany({});
    await Image.deleteMany({});
    for (let name of names) {
      let randomCity = Math.floor(Math.random() * cities.length); // Assuming cities is an array
      let id = crypto.randomUUID();
      let randomCategory = Math.floor(Math.random() * categories.length); // Assuming categories is an array
      let AveragePrice = Math.floor(Math.random() * 100) + 1;

      let phoneNumber = Math.floor(Math.random() * 9000000) + 1000000;
      let emailString = name.replace(/\s+/g, '').toLowerCase();
      const restaurant = new Restaurants({
        name: name,
        price: AveragePrice,
        category: categories[randomCategory],
        location: cities[randomCity],
        imageID: id,
        phone: `210${phoneNumber}`,
        email: `${emailString}@gmail.com`,
        description: descriptions[randomCategory],
        Bookingduration: 30, // Example: 30 minutes booking duration
        openHour: '09:00', // Example: opens at 9 AM
        closeHour: '22:00' // Example: closes at 10 PM
      });

      let numberOfPhotos = Math.floor(Math.random() * 6);
      for (let number = 0; number <= numberOfPhotos; number++) {
        let photo = Math.floor(Math.random() * 31) + 1;
        const image = new Image({
          ImageID: id,
          link: `../imgs/photo${photo}.avif`
        });
        await image.save();
      }

      await restaurant.save();
    }
    console.log("Data added!!");
  } catch (error) {
    console.error("Error adding data:", error);
  }
};

seedDB();
