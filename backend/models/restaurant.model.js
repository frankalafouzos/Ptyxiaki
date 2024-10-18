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
});

module.exports = mongoose.model('Restaurant', RestaurantSchema);
