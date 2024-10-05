const router = require("express").Router();
let User = require("../models/users.model");
let Restaurant = require("../models/restaurant.model");
let Owner = require("../models/restaurantOwner.model");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");

router.route("/changeRole").post(async(req, res) => {
    try {
      const email = req.body.email;
      console.log("Email: "+email);
      const user = await User.findOne({ email: email });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }  
      if (user.admin !== true) {
        return res.status(403).json({ error: 'Not an Admin!' });
      }
      user.admin = false;
      await user.save();
      res.status(200).json("Role changed to User!");
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }  
  });  


  
router.route("/editpassword").post(async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  console.log("Email: "+email)
  try {
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const result = user.isValidPassword(currentPassword)
    
    if(!result){
      throw Error('Current password is incorrect');
    }
    
    user.password = newPassword;
    
    await user.save();
    
    res.status(200).json("Password edited!");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



router.route("/profile").post(async(req, res) => {
  try {
    const email = req.body.email;
    console.log("Email: "+email);
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }  
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }  
});  


router.route("/editprofile").post(async (req, res) => {
  const { firstname, lastname, email, location } = req.body;

  try {
    const user = await User.findOne({ email : email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log("In")
    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.location = location;

    console.log("User: "+JSON.stringify(user))
    await user.save();
    res.json("User edited!");
  } catch (error) {
    console.log("Error: "+error)
    res.status(400).json({ error: error });
  }
});

router.route("/delete-restaurant/:id").post(async (req, res) => {
  const RestaurantID = req.params.id
  try {
    const restaurant = await Restaurant.findOne({ id: RestaurantID });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    await restaurant.deleteOne();
    console.log("Restaurant deleted!")
    let user = await User.findOne({ restaurantsIds: restaurantId }).exec();
    user.restaurantsIds.pull(restaurantId);
    await user.save();

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


  module.exports = router;