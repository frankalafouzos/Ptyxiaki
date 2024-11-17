// routes locations.js
const express = require('express');
const router = express.Router();
const locations = require('../listOfCities.js'); // Update with the actual path

// Endpoint to get the list of locations
router.get('/', (req, res) => {
    res.json(locations);
});

module.exports = router;
