const router = require("express").Router();
let Owner = require("../models/restaurantOwner.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Get all owners
router.route("/").get((req, res) => {
  Owner.find()
    .then((owners) => res.json(owners))
    .catch((err) => res.status(400).json("Error: " + err));
});

// Edit password
router.route("/editpassword").post(async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  try {
    const owner = await Owner.findOne({ email });
    if (!owner) {
      return res.status(400).json({ error: 'Owner not found' });
    }

    const result = await owner.isValidPassword(currentPassword);
    if (!result) {
      throw Error('Current password is incorrect');
    }

    owner.password = newPassword;
    await owner.save();

    res.status(200).json("Password edited!");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Log in
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingOwner = await Owner.findOne({ email });
    if (existingOwner) {
      const result = await existingOwner.isValidPassword(password);
      if (!result) {
        throw Error("Invalid email or password");
      }

      const token = jwt.sign(
        {
          id: existingOwner._id,
          email: existingOwner.email,
          exp: Math.floor(Date.now() / 1000) + (60 * 60) // Sets the expiration time to 1 hour from now
        },
        process.env.JWT_SECRET
      );
      res.status(200).json({ message: 'Owner logged in successfully.', token: token });
    } else {
      throw Error("Email does not correspond to an owner!");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { firstname, lastname, email, password, location } = req.body;

    // Check if owner already exists
    const existingOwner = await Owner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    // Create a new owner
    const newOwner = new Owner({ firstname, lastname, email, password, location });
    await newOwner.save();

    res.status(201).json({ message: 'Owner created successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating owner.' });
  }
});

// Check authentication
router.post("/check", async (req, res) => {
  const { email, password } = req.body;
  const owner = await Owner.findOne({ email });
  if (owner) {
    const result = await bcrypt.compare(password, owner.password);
    if (result) {
      res.json("Owner info correct!");
    } else {
      res.json("Authentication failed.");
    }
  } else {
    res.json("Authentication failed.");
  }
});

// Get owner profile
router.post("/ownerprofile", async (req, res) => {
  try {
    const { email } = req.body;
    const owner = await Owner.findOne({ email });
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Edit owner profile
router.post("/editprofile", async (req, res) => {
  const { firstname, lastname, email, location } = req.body;
  try {
    const owner = await Owner.findOne({ email });
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    owner.firstname = firstname;
    owner.lastname = lastname;
    owner.location = location;

    await owner.save();
    res.json("Owner edited!");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete owner
router.delete("/delete", async (req, res) => {
  try {
    const { email } = req.body;
    const owner = await Owner.findOneAndDelete({ email });
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    res.json("Deleted");
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get owner by id
router.get("/getownerbyid", async (req, res) => {
  try {
    const { id } = req.query;
    const owner = await Owner.findById(id);
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    res.json(owner);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// router.get('/owner/restaurants', async (req, res) => {
//   try {
//       const ownerID = req.params.id; // Or use token to identify the owner
//       const owner = await Owner.findOne({ _id: ownerID });

//       if (!owner) {
//           return res.status(404).json({ message: 'Owner not found' });
//       }

//       const restaurantIds = owner.restaurantsIds // Assuming Restaurant has an ownerId field
//       res.json({ restaurantIds });
//   } catch (error) {
//       res.status(500).json({ message: error.message });
//   }
// });

module.exports = router;
