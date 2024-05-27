const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true});
const connection = mongoose.connection;
connection.once('open', () => {
console.log("MongoDB database connection established successfully");
}) 

app.use(cookieParser());

app.use(cors());
app.use(express.json());

const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    userid: String,
    restaurantid: String,
    date: Date,
    startingTime: Number, //in minutes of the day
    endingTime: Number, //in minutes of the day
    partySize: Number,
    phone: String,
    duration: Number, //in minutes
    tableCapacity: Number
});

const Booking = mongoose.model('Booking', BookingSchema);

const oldUserId = '65c2b146e88cd065d885b41a';
const newUserId = '6654cbc794e67433036dcaa7';

async function updateUserId() {
    try {
        const result = await Booking.updateMany(
            { userid: oldUserId },
            { $set: { userid: newUserId } }
        );

        console.log(`Modified ${result.nModified} bookings.`);
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
}

updateUserId();