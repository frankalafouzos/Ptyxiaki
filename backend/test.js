const express = require('express');
const Image = require('./models/images.model'); 
const Restaurant = require('./models/restaurant.model');
const { Types: { ObjectId } } = require('mongoose');
const cors = require("cors");
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser");


const app = express();
const port = process.env.PORT || 5000;

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true});
const connection = mongoose.connection;
connection.once('open', () => {
console.log("MongoDB database connection established successfully");
}) 

app.use(cookieParser());

app.use(cors());
app.use(express.json());


const getImages= (async (restaurantId)=>{
    console.log(restaurantId)
    try {
      const images = await Image.find({ "ImageID": restaurantId.toString() });
      console.log(images)
    } catch (err) {
      console.log('Error: ' + err);
    }
});

const id = new ObjectId("66795ad13d66d9251d09fc36");

const restaurant = Restaurant.findById(id);
getImages("3d269359-531a-4c21-bee1-ecb5dfc6db62")
