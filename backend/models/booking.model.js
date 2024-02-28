const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    userid: String,
    restaurantid: String,
    date: String,
    time: String,
    partySize: String,
    phone: String,
    duration: String,
    numberOfGuests: Number,

})


module.exports = mongoose.model('Booking', BookingSchema);