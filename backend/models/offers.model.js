const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    conditions: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  });

module.exports = mongoose.model('Offer', offerSchema);

