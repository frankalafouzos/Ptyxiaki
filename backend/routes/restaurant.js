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

router.route('/add').post((req, res) => {
    const name = req.body.name
    const price = req.body.price
    const category = req.body.category
    const location = req.body.location
    const imageID = req.body.imageID
    const phone = req.body.phone
    const email = req.body.email
    const description = req.body.description
    

    const newRestaurant = new Restaurant({
      name,
      price,
      category,
      location,
      imageID,
      phone,
      email,
      description
    });

    newRestaurant.save()
        .then(() => res.json('Restaurant added!'))
        .catch(err => res.status(400).json ('Error: '+ err));
});

module.exports = router;