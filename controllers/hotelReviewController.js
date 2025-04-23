const Review = require('../models/hotel_review.js');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { userId, hotelId, rating, review } = req.body;

    // Validate required fields
    if (!userId || !hotelId || !rating || !review) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Create new review
    const newReview = new Review({
      userId,
      hotelId,
      rating,
      review
    });

    // Save review to database
    const savedReview = await newReview.save();
    
    res.status(201).json({
      success: true,
      data: savedReview
    });
  } catch (error) {
    // Handle duplicate review error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this hotel'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// Get reviews by hotel ID
exports.getReviewsByHotel = async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    
    const reviews = await Review.find({ hotelId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hotel reviews',
      error: error.message
    });
  }
};

// Get a single review by ID
exports.getReviewById = async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, review } = req.body;
    
    // Find and update the review
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { 
        rating, 
        review,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    
    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// Get reviews by user ID
exports.getReviewsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user reviews',
      error: error.message
    });
  }
};