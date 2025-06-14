const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    userid: String,
    restaurantid: String,
    date: Date,
    startingTime: Number, // in minutes of the day
    endingTime: Number,   // in minutes of the day
    partySize: Number,
    phone: String,
    duration: Number,     // in minutes
    tableCapacity: Number,
    offerId: {
        type: Schema.Types.ObjectId,
        ref: 'Offer',
        required: false
    }
});

module.exports = mongoose.model('Booking', BookingSchema);