const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    ImageID: { type: String, required: true },
    link: { type: String, required: true },
    order: { type: Number, required: true }
  }, {
    timestamps: true,
  });


module.exports = mongoose.model('Image', imageSchema);

