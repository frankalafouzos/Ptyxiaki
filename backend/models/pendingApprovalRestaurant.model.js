const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pendingApprovalRestaurantSchema = new Schema({
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
  ApplicationCategory: String, // Either Edit or Add (If Edit, when approved the changes will be passed in the existing one)(If Add a new restaurant will be created.)
  ExistingRestaurantId: String,
  status: { type: String, default: 'pending approval' }, // added status field
  owner: { type: Schema.Types.ObjectId, ref: 'Owner' }
});

module.exports = mongoose.model('pendingApprovalRestaurant', pendingApprovalRestaurantSchema);


//Notes for logic
// When a restaurant is added the restaurant is added the pending approval restaurants that only the admin can see and edit.
// If he approves it a restaurant will be created in the restaurants collection and the pending one will be deleted. 
// The images, capacities and everything but the actual restaurant will be in the real collections.
// If a request for an edit comes in the application is passed as a Edit in the category and the Existing Restaurant id 
// is filled with the id of the restaurant the owner wants to edit. When the application is approved the restaurant info are being 
// replaced with the editted ones.The edit application has all the info of the actual restaurant for the imageID etc. 
// For things that the user does not have access to.
