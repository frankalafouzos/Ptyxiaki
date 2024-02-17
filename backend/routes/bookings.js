const router = require("express").Router();
let Booking = require("../models/booking.model");

router.route("/").get((req, res) => {
  Booking.find()
  .then((users) => res.json(users))
  .catch((err) => res.status(400).json("Error: " + err));
});    





module.exports = router;
