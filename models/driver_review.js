const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const driverReviewSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverId: {
    type: Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries and to prevent duplicate reviews
driverReviewSchema.index({ userId: 1, driverId: 1 }, { unique: true });

module.exports = mongoose.model('DriverReview', driverReviewSchema);