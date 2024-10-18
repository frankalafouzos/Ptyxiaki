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

