const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    username: String,
    password: String,
    firstname: String,
    lastname: String,
    email: String,
    location: String,
    admin: Boolean
})


module.exports = mongoose.model('User', UsersSchema);