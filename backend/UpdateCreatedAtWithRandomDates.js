const mongoose = require("mongoose")
const express = require("express");
const Schema = mongoose.Schema;

require("dotenv").config();

const RestaurantSchema = new Schema({
    name: String,
    price: Number,
    category: String,
    location: String,
    imageID: String,
    phone: String,
    email: String,
    description: String,
    Bookingduration: Number,
    openHour: Number, // in minutes of the day
    closeHour: Number, // in minutes of the day
    status: {
      type: String,
      default: 'Pending Approval'
    }, // Possible values: 'Pending Approval', 'Approved', 'Rejected', "Deleted", "Hidden"
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Owner'
    },
    hide: {
      type: Boolean,
      default: false
    },
    visitCounter: {
      type: Number,
      default: 0
    }
  }, { timestamps: { createdAt: 'createdAt' } });

  let Restaurant = mongoose.model('Restaurant', RestaurantSchema)



async function updateRandomTimestamps() {
    try {
        
        const app = express();
        const port = process.env.PORT || 5000;

        const uri = process.env.ATLAS_URI;
        console.log("URI for Atlas:  "+uri)
        mongoose.connect(uri, { useNewUrlParser: true});
        const connection = mongoose.connection;
        connection.once('open', () => {
        console.log("MongoDB database connection established successfully");
        }) 
        const restaurants = await Restaurant.find();

        for (const restaurant of restaurants) {
            const randomDays = Math.floor(Math.random() * 365); // Random number of days in the past (0-365)
            const randomHours = Math.floor(Math.random() * 24); // Random number of hours (0-23)
            const randomMinutes = Math.floor(Math.random() * 60); // Random number of minutes (0-59)

            const randomCreatedAt = new Date();
            randomCreatedAt.setDate(randomCreatedAt.getDate() - randomDays);
            randomCreatedAt.setHours(randomCreatedAt.getHours() - randomHours);
            randomCreatedAt.setMinutes(randomCreatedAt.getMinutes() - randomMinutes);

            // Update the document with random createdAt and updatedAt
            restaurant.crearedAt = randomCreatedAt;
            restaurant.updatedAt = randomCreatedAt;

            await Restaurant.updateOne(
              { _id: restaurant._id },
              { $set: { createdAt: randomCreatedAt, updatedAt: randomCreatedAt } }, // Update both timestamps manually
              { overwrite: true, timestamps: false } // Prevent automatic updating of timestamps
            );

        }

        console.log('Timestamps updated successfully!');
    }catch (error) {
        console.error('Error updating timestamps:', error);
    }
}

updateRandomTimestamps().catch(console.error);
