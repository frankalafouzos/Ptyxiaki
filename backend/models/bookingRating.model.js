const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingRatingSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // Ratings from 1 to 5
    },
    feedback: {
      type: String,
      default: '', // Optional feedback from the user
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically record when the rating was created
    },
  },
  {
    timestamps: true, // Automatically create `createdAt` and `updatedAt` fields
  }
);

module.exports = mongoose.model('BookingRating', BookingRatingSchema);
