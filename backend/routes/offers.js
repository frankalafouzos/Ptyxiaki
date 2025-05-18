const router = require("express").Router();
const mongoose = require("mongoose");
let User = require("../models/users.model");
let Restaurant = require("../models/restaurant.model");
let Owner = require("../models/restaurantOwner.model");
let Offer = require("../models/offers.model");
const Image = require('../models/images.model');
const { Types: { ObjectId } } = require('mongoose');


// /admins

router.route("/create").post(async (req, res) => {
  try {
    let { ownerId, restaurantId, title, description, discountType, discountValue, startDate, endDate } = req.body;
    console.log("Restaurant ID: " + restaurantId);
    const restaurant = await Restaurant.findOne({ _id: restaurantId });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Check if the restaurant is approved
    if (restaurant.status !== 'Approved') {
      return res.status(403).json({ error: 'Restaurant is not approved' });
    }
    // Check if the restaurant is not deleted
    if (restaurant.status === 'Deleted') {
      return res.status(403).json({ error: 'Restaurant is deleted' });
    }
    // Check if the restaurant is not hidden


    if (restaurant.status === 'Hidden') {
      return res.status(403).json({ error: 'Restaurant is hidden' });
    }
    
    const newOffer = new Offer({
      ownerId,
      restaurantId,
      title,
      description,
      discountType,
      discountValue,
      startDate,
      endDate,
    });

    await newOffer.save();

    res.status(201).json({ message: 'Offer created successfully', offer: newOffer });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get all active offers for customers, with restaurant name
router.get('/active', async (req, res) => {
  try {
    // Find all active offers and populate restaurant name
    const offers = await Offer.find({ isActive: true })
      .populate({
        path: 'restaurantId',
        select: 'name status',
      });

    // Only include offers from restaurants that are not deleted/hidden
    const filteredOffers = offers.filter(offer =>
      offer.restaurantId &&
      offer.restaurantId.status === 'Approved'
    ).map(offer => ({
      ...offer.toObject(),
      restaurantName: offer.restaurantId.name,
    }));

    res.status(200).json(filteredOffers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});




const OWNER_ID = '66508dd2beccdefca6bd8141'; // Owner ID to associate offers with

async function populateOffers() {
    try {
        // await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        // console.log('Connected to the database.');

        const offers = Array.from({ length: 10 }).map(() => ({
            ownerId: OWNER_ID,
            restaurantId: new mongoose.Types.ObjectId(), // Replace with actual restaurant IDs if available
            title: `Offer ${Math.random().toString(36).substring(7)}`,
            description: 'This is a random offer description.',
            discountType: Math.random() > 0.5 ? 'percentage' : 'fixed',
            discountValue: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 1 : Math.floor(Math.random() * 20) + 1, // Random discount value
            startDate: new Date(),
            endDate: new Date(Date.now() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000), // Random end date within 10 days
            isActive: true,
        }));

        await Offer.insertMany(offers);
        console.log('Offers have been populated successfully.');

        mongoose.connection.close();
    } catch (error) {
        console.error('Error populating offers:', error);
        mongoose.connection.close();
    }
}

router.route("/populate").post(async (req, res) => {
    try {
        await populateOffers();
        res.status(200).json({ message: "Offers populated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to populate offers" });
    }
});

// Add this route before module.exports
const Booking = require("../models/booking.model");

router.route("/delete/:offerId").delete(async (req, res) => {
  try {
    const { offerId } = req.params;
    const { ownerId } = req.body;
    
    // Find the offer
    const offer = await Offer.findById(offerId);
    
    // Security check 1: Check if offer exists
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    // Security check 2: Verify ownership
    if (offer.ownerId.toString() !== ownerId) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this offer' });
    }
    
    // Check if the offer is being used in any bookings
    const bookingsWithOffer = await Booking.find({ offerId: offerId });
    
    if (bookingsWithOffer && bookingsWithOffer.length > 0) {
      // The offer is being used by customers, soft delete (hide) it instead
      await Offer.findByIdAndUpdate(offerId, {
        isActive: false,
        hiddenAt: new Date(),
        hiddenReason: 'Owner requested deletion but offer is in use by customers'
      });
      
      return res.status(200).json({ 
        message: 'Offer has been hidden because it is currently in use by customers',
        status: 'hidden' 
      });
    } else {
      // No bookings use this offer, safe to delete
      await Offer.findByIdAndDelete(offerId);
      
      return res.status(200).json({ 
        message: 'Offer successfully deleted',
        status: 'deleted' 
      });
    }
    
  } catch (error) {
    console.error('Error deleting offer:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.route("/:ownerId").get(async (req, res) => {
  
  try {
    const { ownerId } = req.params;
    const offers = await Offer.find({ ownerId });

    console.log("Offers: ", offers);
    
    if (!offers.length) {
      return res.status(200).json({ error: 'No offers found for this owner' });
    }

    const offersByRestaurant = offers.reduce((acc, offer) => {
        if (!acc[offer.restaurantId]) {
            acc[offer.restaurantId] = [];
        }
        acc[offer.restaurantId].push(offer);
        return acc;
    }, {});

    const bundledOffers = Object.keys(offersByRestaurant).map(restaurantId => ({
        restaurantId,
        offers: offersByRestaurant[restaurantId],
    }));

    res.status(200).json(bundledOffers);

    // res.status(200).json(offers); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;