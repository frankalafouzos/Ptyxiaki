const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
    name: String,
    price: Number,
    category: String,
    location: String,
    imageID: String,
    phone: String,
    email: String,
    description: String,
    tables: Number,
    seatsPerTable: Number,
    Bookingduration: Number,
    openHour: Number, //in minutes of the day
    closeHour: Number //in miiutes of the day
})


module.exports = mongoose.model('Restaurant', RestaurantSchema);