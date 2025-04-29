const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
ratingSchema.index({ food: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
