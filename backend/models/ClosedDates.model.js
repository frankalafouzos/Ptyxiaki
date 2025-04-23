const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClosedDateSchema = new Schema({
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  date: {
    type: Date,
    required: true,
    // Ensure uniqueness if you want only one record of closure per date
    // unique: true,
  },
  reason: {
    type: String,
    default: 'Closed'
  }
}, { timestamps: true });

module.exports = mongoose.model('ClosedDate', ClosedDateSchema);
