const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PendingEditsSchema = new Schema({
  restaurantId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Restaurant', 
    required: true 
  },
  ownerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Owner', 
    required: true 
  },
  changes: { 
    type: Object, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending approval', 'approved', 'rejected', 'Past changes'], 
    default: 'pending approval' 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

module.exports = mongoose.model('PendingEdits', PendingEditsSchema);