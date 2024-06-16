const mongoose = require('mongoose');
const Restaurant = require('./models/restaurant.model');
const Image = require('./models/images.model');
const RestaurantCapacity = require('./models/restaurantCapacity.model');
const Owner = require('./models/restaurantOwner.model');
const { deleteImage } = require('./functions/s3-utils');
require('dotenv').config();

// Ensure that the MONGO_URI is loaded correctly
if (!process.env.ATLAS_URI) {
  console.error('Error: ATLAS_URI is not defined in the environment variables.');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to the database');

  try {
    // Step 1: Find all "Test" restaurants
    const testRestaurants = await Restaurant.find({ name: /Test/i });

    for (const restaurant of testRestaurants) {
      const { _id, imageID } = restaurant;

      // Step 2: Delete related images from S3 and the database
      const images = await Image.find({ ImageID: imageID });
      for (const image of images) {
        await deleteImage(image.Key);
        await Image.findByIdAndDelete(image._id);
      }

      // Step 3: Delete related capacities from the database
      await RestaurantCapacity.findOneAndDelete({ restaurantid: _id });

      // Step 4: Remove restaurant IDs from owner records
      const owners = await Owner.find({ restaurantsIds: _id });
      for (const owner of owners) {
        owner.restaurantsIds = owner.restaurantsIds.filter(id => !id.equals(_id));
        await owner.save();
      }

      // Step 5: Delete the "Test" restaurants from the database
      await Restaurant.findByIdAndDelete(_id);

      console.log(`Deleted Test restaurant: ${restaurant.name}`);
    }

    console.log('Cleanup complete');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    db.close();
  }
});
