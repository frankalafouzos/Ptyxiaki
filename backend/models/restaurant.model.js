const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RestaurantSchema = new Schema({
    name: String,
    price: String,
    category: String,
    location: String,
    imageID: String,
    phone: String,
    email: String,
    description: String
})


module.exports = mongoose.model('Restaurant', RestaurantSchema);