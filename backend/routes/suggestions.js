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
        // 1️⃣ Fetch all user bookings
        const userBookings = await Booking.find({ userid: req.body.userId }).lean();

        if (userBookings.length === 0) {
            return res.json({ suggestions: [] }); // No bookings = No recommendations
        }

        // 2️⃣ Batch Fetch All Restaurants (Only Approved & Visible)
        const restaurantIds = userBookings.map(booking => booking.restaurantid);
        const restaurants = await Restaurant.find({ _id: { $in: restaurantIds }, hide: false, status: 'Approved' }).lean();

        if (restaurants.length === 0) {
            return res.json({ suggestions: [] }); // No active restaurants found
        }

        // 3️⃣ Create a Map for Fast Lookup
        const restaurantMap = new Map(restaurants.map(r => [r._id.toString(), r]));

        // 4️⃣ Associate Bookings with Restaurants (Filtering out missing ones)
        const validBookings = userBookings
            .map(booking => ({
                booking,
                restaurant: restaurantMap.get(booking.restaurantid.toString())
            }))
            .filter(entry => entry.restaurant); // Remove null entries

        // 5️⃣ Summarize Restaurants for OpenAI (More Features!)
        const summarizedRestaurants = validBookings.map(entry => ({
            id: entry.restaurant._id.toString(),
            price: Math.round(entry.restaurant.price / 10), // Normalize price (Less tokens)
            category: entry.restaurant.category,
            location: entry.restaurant.location,
            popularity: entry.restaurant.visitCounter, // More visited = better suggestion
            open: entry.restaurant.openHour, // Opening time (in minutes of the day)
            close: entry.restaurant.closeHour, // Closing time
            duration: entry.restaurant.Bookingduration, // Usual booking duration
        }));

        // 6️⃣ Select More Restaurants (Up to 300) Without Overloading Tokens
        const limitedSummarizedRestaurants = summarizedRestaurants
            .sort((a, b) => b.popularity - a.popularity) // Sort by most visited
            .slice(0, 300);
        const totalGPTRestaurants = await Restaurant.countDocuments({});
        console.log("Total Restaurants Sent to GPT:", totalGPTRestaurants);
        const totalRestaurants = await Restaurant.countDocuments({});
        console.log("Total Restaurants in DB:", totalRestaurants);
        


        // 7️⃣ Aggregate Bookings for OpenAI
        const aggregatedBookings = validBookings.reduce((acc, entry) => {
            const { restaurantid } = entry.booking;
            acc[restaurantid] = (acc[restaurantid] || 0) + 1; // Count number of times booked
            return acc;
        }, {});

        const aggregatedBookingArray = Object.entries(aggregatedBookings)
            .map(([id, count]) => ({ id, count }))
            .slice(0, 100); // Increased from 50 to 100

        // 8️⃣ Call OpenAI API (Optimized Input)
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Fastest & most affordable
            messages: [
                { role: "system", content: "Recommend restaurants based on user bookings. Respond only with restaurant IDs in JSON." },
                {
                    role: "user",
                    content: `Restaurants: ${JSON.stringify(limitedSummarizedRestaurants)}\n` +
                        `Bookings: ${JSON.stringify(aggregatedBookingArray)}\n` +
                        `Return only a JSON array of 8 recommended restaurant IDs with the key "recommended_ids".`,
                },
            ],
            response_format: { "type": "json_object" },
            temperature: 0.3,
            max_completion_tokens: 1000,
            top_p: 0.9
        });

        // 9️⃣ Parse OpenAI Response (Error Handling)
        let suggestedIds = [];
        try {
            const parsedResponse = JSON.parse(response.choices[0].message.content);
            if (parsedResponse && Array.isArray(parsedResponse.recommended_ids)) {
                suggestedIds = parsedResponse.recommended_ids;
            }
        } catch (error) {
            console.error("Error parsing GPT response:", error);
        }

        // 🔟 Batch Fetch Suggested Restaurants (Avoids Multiple Queries)
        const suggestedRestaurants = await Promise.all(
            suggestedIds.map(async id => {
                const restaurant = await Restaurant.findById(id).lean();
                const images = await Image.find({ ImageID: restaurant?.imageID }).lean();
                return { restaurant, images };
            })
        );
        console.log("Response:", response.choices[0].message.content);
        const validSuggestedRestaurants = suggestedRestaurants.filter(r => r.restaurant);

        // Respond with the recommended restaurants
        res.json({ suggestions: validSuggestedRestaurants });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Failed to fetch restaurant recommendations" });
    }
});

module.exports = router;
