const express = require('express');
const Restaurant = require('../models/restaurant.model');
const BookingRating = require('../models/bookingRating.model'); // Adjust the path as needed

const router = express.Router();

// Import the Restaurant model (adjust the path as needed)

// Route: Get all ratings for a specific restaurant
router.get('/:restaurantId/ratings', async (req, res) => {
    try {
        console.log('Fetching ratings for restaurant:', req.params.restaurantId);
        const Ratings = await BookingRating.find({ restaurantId: req.params.restaurantId })
            .populate('userId')
            .populate('restaurantId');
        if (!Ratings) {
            return res.status(404).json({ message: 'No ratings found for this restaurant' });
        }
        console.log('Ratings:', Ratings);
        const ratingsNumbers = Ratings.map(rating => rating.rating);
        const average = ratingsNumbers.reduce((a, b) => a + b, 0) / ratingsNumbers.length;
        console.log('Ratings numbers:', ratingsNumbers);
        res.json({ ratings: Ratings, average });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;