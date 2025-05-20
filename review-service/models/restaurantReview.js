import mongoose from "mongoose";

const hotelReviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  restaurantId: {
    type: String,
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

export default HotelReview;