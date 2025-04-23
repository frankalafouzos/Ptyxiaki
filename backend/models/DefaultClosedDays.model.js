const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DefaultClosedDaySchema = new Schema({
  restaurant: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  // If you want the option to “turn on/off” that closure:
  isClosed: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('DefaultClosedDay', DefaultClosedDaySchema);
