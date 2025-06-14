const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forcedOpenDateSchema = new Schema({
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    default: 'Forced Open'
  }
}, {
  timestamps: true
});

// Create compound index for restaurant and date
forcedOpenDateSchema.index({ restaurant: 1, date: 1 }, { unique: true });

const ForcedOpenDate = mongoose.model('ForcedOpenDate', forcedOpenDateSchema);

module.exports = ForcedOpenDate;