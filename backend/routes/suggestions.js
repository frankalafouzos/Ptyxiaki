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
    try {
        // Fetch user bookings
        const userBookings = await Booking.find({ userid: req.body.userId }).lean();

        // Aggregate bookings and fetch restaurant details
        const bookingWithRestaurants = await Promise.all(
            userBookings.map(async (booking) => {
                const restaurant = await Restaurant.findById(booking.restaurantid).lean();
                return {
                    booking,
                    restaurant,
                };
            })
        );

        // Filter out any bookings where restaurant data is not found
        const validBookings = bookingWithRestaurants.filter(entry => entry.restaurant);

        // Summarize restaurants for OpenAI
        const summarizedRestaurants = validBookings.map(entry => [
            entry.restaurant._id.toString(),
            entry.restaurant.price,
        ]);

        // Limit restaurants to the first 100
        const limitedSummarizedRestaurants = summarizedRestaurants
            .sort((a, b) => b[1] - a[1]) // Sort by price
            .slice(0, 100);

        // Aggregate bookings for OpenAI input
        const aggregatedBookings = validBookings.reduce((acc, entry) => {
            const { restaurantid } = entry.booking;
            acc[restaurantid] = (acc[restaurantid] || 0) + 1;
            return acc;
        }, {});

        const aggregatedBookingArray = Object.entries(aggregatedBookings).slice(0, 50);

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant that recommends new restaurants based on user bookings. Firstly I need the answer as fast as possible! Important Note: I need only the restaurant ids in a json! Keep in mind I pass to you the first 150 restaurants. Find the patterns between the restaurants the user has already made a booking based on all of the info you get and bring back your suggestions." },
                {
                    role: "user",
                    content: `Restaurants are represented as [Restaurant ID, Price].\n` +
                             `Bookings are represented as [Restaurant ID, Booking Count].\n` +
                             `Restaurants:\n${JSON.stringify(limitedSummarizedRestaurants)}\n` +
                             `Bookings:\n${JSON.stringify(aggregatedBookingArray)}\n` +
                             `Provide only the restaurant IDs as a JSON array. Example: ["id1", "id2", "id3"]`,
                },
            ],
        });

        // Parse GPT response
        const gptResponse = response.choices[0].message.content;
        console.log("GPT-4 Response Content:", gptResponse);

        let suggestedIds;
        const match = gptResponse.match(/\[.*?\]/s); // Match the first JSON-like array
        if (match) {
            suggestedIds = JSON.parse(match[0]);
        } else {
            throw new Error("No JSON array found in GPT response");
        }

        console.log("Extracted Suggested IDs:", suggestedIds);

        // Fetch suggested restaurants details
        const suggestedRestaurants = await Promise.all(
            suggestedIds.map(async id => {
                const restaurant = await Restaurant.findById(id).lean();
                const images = await Image.find({ ImageID: restaurant?.imageID }).lean();
                return { restaurant, images };
            })
        );

        const validSuggestedRestaurants = suggestedRestaurants.filter(r => r.restaurant);

        // Respond with the enriched bookings and suggestions
        res.json({
            suggestions: validSuggestedRestaurants,
        });
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to fetch restaurant recommendations" });
    }
});


module.exports = router;