const router = require("express").Router();
let User = require("../models/users.model");
const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");

router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/add").post(async (req, res) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const username = nanoid(10);
  const password = req.body.password;
  const email = req.body.email;

  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
     return res.json("Email already exists.")
  }
  

  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = new User({
    firstname: firstname,
    lastname: lastname,
    username: username,
    password: hashedPassword,
    email: email,
    admin:false
  });
  
  await newUser
    .save()
    .then(() => {
        res.json("User added!")    
    })
    .catch((err) => res.status(400).json("Error: " + err));
});


router.route("/editprofile").post(async (req, res) => {
  const { firstname, lastname, username, password, email } = req.body;

  try {
    const user = await User.findOne({ email: email });

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
    
    res.json(user);
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
