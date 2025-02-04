const router = require("express").Router();
const mongoose = require('mongoose');
const Booking = require('../models/booking.model'); // Import Booking schema
const ClosedDate = require('../models/ClosedDates.model'); // Import ClosedDate schema
const RestaurantCapacity = require('../models/restaurantCapacity.model'); // Import RestaurantCapacity schema


router.route("/:restaurantId").get( async (req, res) => {
    const { restaurantId } = req.params;
    const { startDate, endDate } = req.query;

    try {
        const bookings = await Booking.find({
            restaurantid: restaurantId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        });

        const closedDates = await ClosedDate.find({
            restaurantId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        });

        const capacityDoc = await RestaurantCapacity.findOne({ restaurantid: restaurantId });
        const totalCapacity = capacityDoc.totalCapacity();

        const calendar = {};
        bookings.forEach((booking) => {
            const day = booking.date.toISOString().split('T')[0];
            if (!calendar[day]) calendar[day] = { bookings: 0, capacity: totalCapacity };

            calendar[day].bookings += booking.partySize;
        });

        closedDates.forEach(({ date }) => {
            const day = date.toISOString().split('T')[0];
            calendar[day] = { closed: true };
        });

        res.json(calendar);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching calendar data.' });
    }
});


router.route("/close-date").post(async (req, res) => {
    const { restaurantId, date } = req.body;

    try {
        const existingBooking = await Booking.findOne({
            restaurantid: restaurantId,
            date: new Date(date),
        });

        if (existingBooking) {
            return res.status(400).json({ error: 'Cannot close a date with existing bookings.' });
        }

        const closedDate = new ClosedDate({ restaurantId, date: new Date(date) });
        await closedDate.save();

        res.status(200).json({ message: 'Date closed successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Error closing the date.' });
    }
});

router.route("/api/bookings").get( async (req, res) => {
    const { restaurantId, date } = req.body;

    try {
        const bookings = await Booking.find({
            restaurantid: restaurantId,
            date: new Date(date),
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching bookings.' });
    }
});




module.exports = router;