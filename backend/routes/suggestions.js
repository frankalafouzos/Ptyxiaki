require('dotenv').config({ path: '../.env' });
const express = require('express');
const { OpenAI } = require('openai');
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
const ClosedDate = require('../models/ClosedDates.model');
const { Types: { ObjectId } } = require('mongoose');
const { uploadImage, deleteImage } = require('../functions/s3-utils');
const { use } = require('./restaurant');


// Initialize the OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure your .env file contains the API key
});


router.post('/', async (req, res) => {
    const restaurants = await Restaurant.find();
    // const summarizedRestaurants = restaurants.map(r => ({
    //     id: r._id,
    //     category: r.category,
    //     location: r.location,
    //     price: r.price,
    //     visitCounter: r.visitCounter,
    // }));
    const summarizedRestaurants = restaurants
    .map(r => [r._id, r.price]) // Only keep Restaurant ID and Price
    .sort((a, b) => b[1] - a[1]) // Sort by price if needed
    .slice(0, 50); // Top 50 restaurants




    // return res.json({ restaurants });
    const userBookings = await Booking.find({ userid: req.body.userId });

    // Aggregate bookings by restaurant ID
    const aggregatedBookings = await userBookings.reduce((acc, booking) => {
        acc[booking.restaurantid] = (acc[booking.restaurantid] || 0) + 1;
        return acc;
    }, {});
    const aggregatedBookingArray = Object.entries(aggregatedBookings).slice(0, 50); // Top 50 booked restaurants

    // return res.json({ aggregatedBookings });

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant that recommends restaurants based on user bookings." },
                {
                    role: "user",
                    content: `Here is a list of restaurants:\n${JSON.stringify(summarizedRestaurants, null, 2)}\n\n` +
                        `Here is the user's booking history:\n${JSON.stringify(aggregatedBookingArray, null, 2)}\n\n` +
                        `Provide restaurant IDs only that match the preferences.`,
                },
            ]
        });

        // Parse the AI response to extract restaurant IDs
        const suggestedIds = response.choices[0].message.content
            .match(/\d+/g) // Extract numeric IDs from the response
            .map(Number); // Convert to an array of integers

        // Filter restaurant list to include only matching IDs
        const filteredRestaurants = restaurantList.filter(restaurant => suggestedIds.includes(restaurant.id));

        // Respond with the filtered restaurant IDs
        res.json({ restaurantIds: filteredRestaurants.map(r => r.id) });
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to fetch restaurant recommendations" });
    }


});

module.exports = router;