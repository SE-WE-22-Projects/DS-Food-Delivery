// controllers/ratingController.js
const Rating = require('../models/Rating');
const Food = require('../models/Food');

// Create a new rating
exports.createRating = async (req, res) => {
  try {
    const { foodId, rating, comment } = req.body;
    
    // Basic validation
    if (!foodId || !rating) {
      return res.status(400).json({ success: false, message: 'Food ID and rating are required' });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }


    // Check if food exists
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    // Create rating
    const newRating = await Rating.create({
      food: foodId,
      user: req.user?.id, // Optional user if you have authentication
      rating,
      comment
    });

    res.status(201).json({ success: true, data: newRating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all ratings for a specific food
exports.getFoodRatings = async (req, res) => {
  try {
    const { foodId } = req.params;
    
    const ratings = await Rating.find({ food: foodId })
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({ success: true, count: ratings.length, data: ratings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single rating by ID
exports.getRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }
    
    res.status(200).json({ success: true, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a rating
exports.updateRating = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Find and update rating
    const updatedRating = await Rating.findByIdAndUpdate(
      req.params.id,
      { rating, comment },
      { new: true, runValidators: true }
    );
    
    if (!updatedRating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }
    
    res.status(200).json({ success: true, data: updatedRating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a rating
exports.deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findByIdAndDelete(req.params.id);
    
    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};