const router = require("express").Router();
let Booking = require("../models/booking.model");

router.route("/").get((req, res) => {
  Booking.find()
  .then((bookings) => res.json(bookings))
  .catch((err) => res.status(400).json("Error: " + err));
});    

router.route("/checkAvailability/:id").get((req, res) => {
  Booking.find({restaurantid: req.params.id})
  .then((bookings) => res.json(bookings))
  .catch((err) => res.status(400).json("Error: " + err));
});    










module.exports = router;
