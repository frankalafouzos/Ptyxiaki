const router = require("express").Router();
let User = require("../models/users.model");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const jwt = require("jsonwebtoken");

router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});

//Log in
router.post('/login', async (req, res) => {
  try {
    const { email, password} = req.body;
    // console.log(req.body)
    // Check if user exists
    const existingUser = await User.findOne({ email });
    let jwtToken=""
    if(existingUser){
      const result = await existingUser.isValidPassword(password)
      console.log(result)
      
      if (!result){
        console.log("error")
        throw Error("Not authenticated")
      }
      console.log(existingUser._id, existingUser.email)
      
      let id = existingUser._id
      const jwtToken = jwt.sign(
        {
          id: id, 
          email: existingUser.email,
          exp: Math.floor(Date.now() / 1000) + (60 * 60) // Sets the expiration time to 1 hour from now
        },
        process.env.JWT_SECRET
      );
      res.status(200).json({ message: 'User logged in successfully.', token: jwtToken });
    }else{
      throw Error("Email does not correspond to a user!")
    }
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { firstname, lastname, email, password, location} = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    // Create a new user
    const newUser = new User({ firstname, lastname, email, password, location });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user.' });
  }
});

router.route("/editprofile").post(async (req, res) => {
  const { username, password, firstname, lastname, email, location } = req.body;

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.firstname = firstname;
    user.lastname = lastname;
    user.email = email;
    user.location = location;

    // Update the password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }

    await user.save();
    res.json("User edited!");
  } catch (error) {
    res.status(400).json({ error: 'Error updating user' });
  }
});


router.route("/check").post(async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email });
  if (user) {
    const result = await bcrypt.compare(password, user.password);
    if (result && user.admin==true) {
      res.json("Admin info correct!");
    }else if(result){
      res.json("User info correct!");
    }
    else {
      res.json("Authentication failed.");
    }
  } else {
    res.json("Authentication failed.");
  }
});

router.route("/userprofile").post(async(req, res) => {
  try {
    const email = req.body.email;
    console.log("Email: "+email);
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(user)
    res.status(200).json({ message: 'User retrieved successfully.', user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.route("/:username").post(async(req, res) => {
  try {
    const {username} = req.params;
    console.log("username: "+username);
    const user = await User.findOne({ username: username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.route("/edit").post(async (req, res) => {
  const { firstname, lastname, username, password, email } = req.body;
  console.log("First Name"+firstname)
  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.firstname = firstname;
    user.lastname = lastname;
    user.username = username;

    // Update the password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }

    await user.save();
    res.json("User edited!");
  } catch (error) {
    res.status(400).json({ error: 'Error updating user' });
  }
});

router.route("/delete").delete(async(req, res) => {
  try {
    const username = req.body.username;
    console.log('Username: '+username)
    const user = await User.findOneAndDelete({ username: username });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json("Deleted");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});








module.exports = router;
