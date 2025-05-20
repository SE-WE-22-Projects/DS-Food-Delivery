import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  driverId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries on driver ratings
ratingSchema.index({ driverId: 1 });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;