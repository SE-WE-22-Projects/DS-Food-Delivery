const mongoose = require('mongoose');
const DeliveryReview = require('../models/delivery_review.js');

// Create a new delivery review
exports.createDeliveryReview = async (req, res) => {
  try {
    const { userId, orderId, foodId, rating, review, deliveryTime, isOnTime } = req.body;

    // Validate required fields
    if (!userId || !orderId || !foodId || !rating || !review) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Create new delivery review
    const newDeliveryReview = new DeliveryReview({
      userId,
      orderId,
      foodId,
      rating,
      review,
      deliveryTime,
      isOnTime
    });

    // Save review to database
    const savedReview = await newDeliveryReview.save();
    
    res.status(201).json({
      success: true,
      data: savedReview
    });
  } catch (error) {
    // Handle duplicate review error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this order'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating delivery review',
      error: error.message
    });
  }
};

// Get all delivery reviews
exports.getAllDeliveryReviews = async (req, res) => {
  try {
    const reviews = await DeliveryReview.find()
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery reviews',
      error: error.message
    });
  }
};

// Get a single delivery review by ID
exports.getDeliveryReviewById = async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const review = await DeliveryReview.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Delivery review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching delivery review',
      error: error.message
    });
  }
};

// Update a delivery review
exports.updateDeliveryReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, review, deliveryTime, isOnTime } = req.body;
    
    // Validate rating range if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Find and update the review
    const updatedReview = await DeliveryReview.findByIdAndUpdate(
      reviewId,
      { 
        rating, 
        review,
        deliveryTime,
        isOnTime,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: 'Delivery review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating delivery review',
      error: error.message
    });
  }
};

// Delete a delivery review
exports.deleteDeliveryReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const deletedReview = await DeliveryReview.findByIdAndDelete(reviewId);
    
    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: 'Delivery review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Delivery review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting delivery review',
      error: error.message
    });
  }
};

// Get reviews by user ID
exports.getReviewsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const reviews = await DeliveryReview.find({ userId })
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

// Get reviews by food ID
exports.getReviewsByFood = async (req, res) => {
  try {
    const foodId = req.params.foodId;
    
    const reviews = await DeliveryReview.find({ foodId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food reviews',
      error: error.message
    });
  }
};

// Get average rating for a food item
exports.getFoodAverageRating = async (req, res) => {
  try {
    const foodId = req.params.foodId;
    
    const result = await DeliveryReview.aggregate([
      { $match: { foodId: mongoose.Types.ObjectId(foodId) } },
      { 
        $group: { 
          _id: '$foodId', 
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        } 
      }
    ]);
    
    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        foodId: foodId,
        averageRating: 0,
        totalReviews: 0
      });
    }
    
    res.status(200).json({
      success: true,
      foodId: foodId,
      averageRating: parseFloat(result[0].averageRating.toFixed(1)),
      totalReviews: result[0].totalReviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating food average rating',
      error: error.message
    });
  }
};

// Get all foods with their average ratings
exports.getAllFoodsWithRatings = async (req, res) => {
  try {
    const result = await DeliveryReview.aggregate([
      { 
        $group: { 
          _id: '$foodId', 
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        } 
      },
      { $sort: { averageRating: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      count: result.length,
      data: result.map(item => ({
        foodId: item._id,
        averageRating: parseFloat(item.averageRating.toFixed(1)),
        totalReviews: item.totalReviews
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food ratings',
      error: error.message
    });
  }
};