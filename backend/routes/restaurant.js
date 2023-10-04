const router = require("express").Router();
let Restaurant = require('../models/restaurant.model');


router.route('/').get((req, res) => {
    Restaurant.find()
        .then(Restaurants => res.json(Restaurants))
        .catch(err => res.status(400).json ('Error: '+ err));
});

// New route for fetching a single Restaurant by ID
router.route('/:id', async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found' });
    } else {
      res.json(restaurant);
    }
  });

// router.route('/add').post((req, res) => {
//     const title = req.body.title;
//     const location = req.body.location;
//     const duration = Number(req.body.duration);
//     const date = Date.parse(req.body.date);

//     const newBooking = new Booking({
//         title,
//         location,
//         duration,
//         date,
//     });

//     newBooking.save()
//         .then(() => res.json('Restaurant added!'))
//         .catch(err => res.status(400).json ('Error: '+ err));
// });

module.exports = router;