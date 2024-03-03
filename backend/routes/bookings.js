const router = require("express").Router();
let Booking = require("../models/booking.model");
let restaurantCapacity = require("../models/restaurantCapacity.model");

router.route("/").get((req, res) => {
  Booking.find()
  .then((bookings) => res.json(bookings))
  .catch((err) => res.status(400).json("Error: " + err));
});    

router.route("/checkAvailability/:id").get((req, res) => {
  restaurantCapacity.find({restaurant: req.params.id})
  Booking.find({restaurantid: req.params.id})

});    


module.exports = router;
