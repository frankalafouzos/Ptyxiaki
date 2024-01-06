const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');


const UsersSchema = new Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    email: String,
    location: String,
    admin: Boolean
})

// Hash password before saving
UsersSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password validity
UsersSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UsersSchema);
