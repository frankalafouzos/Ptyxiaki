const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    userid: String,
    restaurantid: String,
    date: Date,
    time: String,
    partySize: String,
    phone: String,
    duration: String,
    numberOfGuests: Number,
    tableCapacity: Number
})


module.exports = mongoose.model('Booking', BookingSchema);