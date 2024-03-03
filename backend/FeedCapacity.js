require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('./models/restaurant.model'); // Assuming this is the correct path
const RestaurantCapacity = require('./models/restaurantCapacity.model'); // Adjust path as necessary

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
    seedCapacities();
});

async function seedCapacities() {
    try {
        // Fetch all restaurants
        const restaurants = await Restaurant.find({});
        for (const restaurant of restaurants) {
            // Here, you would define your logic to determine the number of tables of each size
            // For demonstration, we'll assign random numbers for tables of different sizes
            const tablesForTwo = Math.floor(Math.random() * 5) + 1; // Random number between 1 and 5
            const tablesForFour = Math.floor(Math.random() * 5) + 1; // Random number between 1 and 5
            const tablesForSix = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3
            const tablesForEight = Math.floor(Math.random() * 2) + 1; // Random number between 1 and 2

            // Check if a capacity entry already exists for the restaurant to avoid duplicates
            const existingCapacity = await RestaurantCapacity.findOne({ restaurant: restaurant._id });
            if (!existingCapacity) {
                const newCapacity = new RestaurantCapacity({
                    restaurant: restaurant._id,
                    tablesForTwo,
                    tablesForFour,
                    tablesForSix,
                    tablesForEight
                });
                await newCapacity.save();
            } else {
                console.log(`Capacity already set for restaurant ${restaurant.name}`);
            }
        }
        console.log("Capacities seeded successfully!");
    } catch (error) {
        console.error("Error seeding capacities:", error);
    } finally {
        // Close the database connection when done
        mongoose.connection.close();
    }
}

// Optionally, you might want to add a process to handle any unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
    mongoose.connection.close();
});
