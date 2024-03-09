const router = require("express").Router();
let Restaurant = require('../models/restaurant.model');
let Image = require('../models/images.model');
const { Types: { ObjectId } } = require('mongoose');

// router.route('/').get(async(req, res) => {
//   try {
//       const restaurants = await Restaurant.find({});
//       const images = await Image.find();

//       // Send the data as JSON
//       res.json({ restaurants, images });
//   } catch (err) {
//       // Handle any errors
//       res.status(400).json('Error: ' + err);
//   }
// });

router.route('/').get(async (req, res) => {
  let { page, itemsPerPage, sortField, sortOrder, categoryFilter, locationFilter, minPrice, maxPrice } = req.query;
  
  page = parseInt(page) || 1;
  itemsPerPage = parseInt(itemsPerPage) || 12;
  sortOrder = sortOrder === 'asc' ? 1 : -1;
  
  let filters = {};
  if (categoryFilter) filters.category = categoryFilter;
  if (locationFilter) filters.location = locationFilter;
  if (minPrice) filters.price = { $gte: parseFloat(minPrice) };
  if (maxPrice) filters.price = { ...filters.price, $lte: parseFloat(maxPrice) };

  let sort = {};
  if (sortField) sort[sortField] = sortOrder;

  try {
    const restaurants = await Restaurant.find(filters).sort(sort).skip((page - 1) * itemsPerPage).limit(itemsPerPage);
    const totalItems = await Restaurant.countDocuments(filters);
    const images = await Image.find(); 

    res.json({ restaurants, images, totalPages: Math.ceil(totalItems / itemsPerPage) });
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});





router.route('/Restaurants', async(req, res) => {
  const restaurants = await Restaurant.find({});
  const images = await Image.find()
  res.render('Restaurants', { restaurants, images, cities })

})

// New route for fetching a single Restaurant by ID
router.route('/:id').get( async (req, res) => {
  const id = new ObjectId(req.params.id);

  console.log("In"); // Ensure this line is executed

  const restaurant = await Restaurant.findById(id);
  const images = await Image.find({"ImageID": restaurant.imageID});
  if (!restaurant) {
    console.log("In");
    res.status(404).json({ message: 'Restaurant not found' });
  } else {
    res.json({restaurant, images});
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