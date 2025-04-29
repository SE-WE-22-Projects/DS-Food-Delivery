const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deliveryReviewSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  foodId: {
    type: Schema.Types.ObjectId,
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
  deliveryTime: {
    type: Number,  // Delivery time in minutes
    required: false
  },
  isOnTime: {
    type: Boolean,
    default: true
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
deliveryReviewSchema.index({ userId: 1, orderId: 1 }, { unique: true });

// Index for food-related queries to make average calculation faster
deliveryReviewSchema.index({ foodId: 1 });

module.exports = mongoose.model('DeliveryReview', deliveryReviewSchema);