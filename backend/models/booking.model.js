const e = require('express');
const mongoose = require('mongoose');
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
})


module.exports = mongoose.model('Booking', BookingSchema);