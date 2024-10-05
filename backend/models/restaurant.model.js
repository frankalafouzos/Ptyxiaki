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
  Bookingduration: Number,
  openHour: Number, // in minutes of the day
  closeHour: Number, // in minutes of the day
  status: { type: String, default: 'pending approval' }, // added status field
  owner: { type: Schema.Types.ObjectId, ref: 'Owner' },
  hide: { type: Boolean, default: false }
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
