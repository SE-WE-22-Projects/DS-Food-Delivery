const mongoose = require('mongoose');

const hotelReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  review: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Compound index to ensure a user can only review a restaurant once
hotelReviewSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

const HotelReview = mongoose.model('HotelReview', hotelReviewSchema);

module.exports = HotelReview;