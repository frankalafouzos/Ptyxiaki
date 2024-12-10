const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClosedDateSchema = new Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('ClosedDate', ClosedDateSchema);
