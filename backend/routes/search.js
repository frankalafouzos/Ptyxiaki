// routes/search.js
const express = require('express');
const router = express.Router();
const Restaurant = require('../models/restaurant.model');

// Increment visit count
router.get('/:id/visit', async (req, res) => {
    try {
        const restaurantId = req.params.id;
        await Restaurant.findByIdAndUpdate(
            restaurantId,
            { $inc: { visitCount: 1 } }
        );
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send("Error updating visit count");
    }
});

// Get popular restaurants
router.get('/popular', async (req, res) => {
    try {
        const popularRestaurants = await Restaurant.find()
            .sort({ visitCount: -1 })
            .limit(10);
        res.json(popularRestaurants);
    } catch (err) {
        res.status(500).send("Error fetching popular restaurants");
    }
});


router.post('/admin', async (req, res) => {
    const { query } = req.body; // This will hold the search term entered by the user
    const regex = new RegExp(query, 'i'); // Create a case-insensitive regular expression

    try {
        const restaurants = await Restaurant.find({
            $or: [
                { name: { $regex: regex } }, // Search by restaurant name
                { category: { $regex: regex } }, // Search by category
                { location: { $regex: regex } }, // Search by location
            ]
        });

        // Optionally limit results or paginate them
        res.status(200).json({ success: true, restaurants });
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;






















































// app.get('/', (req, res) => {
//     const searchTerm = req.query.name;
//     Event.find({ name: { $regex: searchTerm, $options: 'i' } })
//         .then(events => {
//             res.json(events);
//         })
//         .catch(err => {
//             console.error(err);
//             res.status(500).json({ message: 'Server error' });
//         });
// });

