const DriverReview = require('../models/driver_review.js');

// Create a new driver review
exports.createDriverReview = async (req, res) => {
  try {
    const { userId, driverId, rating, review } = req.body;

    // Validate required fields
    if (!userId || !driverId || !rating || !review) {
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

    // Create new driver review
    const newDriverReview = new DriverReview({
      userId,
      driverId,
      rating,
      review
    });

    // Save review to database
    const savedReview = await newDriverReview.save();
    
    res.status(201).json({
      success: true,
      data: savedReview
    });
  } catch (error) {
    // Handle duplicate review error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this driver'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating driver review',
      error: error.message
    });
  }
};

// Get all driver reviews
exports.getAllDriverReviews = async (req, res) => {
  try {
    const reviews = await DriverReview.find()
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching driver reviews',
      error: error.message
    });
  }
};

// Get reviews by driver ID
exports.getReviewsByDriver = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    
    const reviews = await DriverReview.find({ driverId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching driver reviews',
      error: error.message
    });
  }
};

// Get a single driver review by ID
exports.getDriverReviewById = async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const review = await DriverReview.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Driver review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching driver review',
      error: error.message
    });
  }
};

// Update a driver review
exports.updateDriverReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, review } = req.body;
    
    // Validate rating range if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Find and update the review
    const updatedReview = await DriverReview.findByIdAndUpdate(
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
        message: 'Driver review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating driver review',
      error: error.message
    });
  }
};

// Delete a driver review
exports.deleteDriverReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    const deletedReview = await DriverReview.findByIdAndDelete(reviewId);
    
    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: 'Driver review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Driver review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting driver review',
      error: error.message
    });
  }
};

// Get reviews by user ID
exports.getReviewsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const reviews = await DriverReview.find({ userId })
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

// Get average rating for a driver
exports.getDriverAverageRating = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    
    const result = await DriverReview.aggregate([
      { $match: { driverId: mongoose.Types.ObjectId(driverId) } },
      { 
        $group: { 
          _id: '$driverId', 
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        } 
      }
    ]);
    
    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        averageRating: 0,
        totalReviews: 0
      });
    }
    
    res.status(200).json({
      success: true,
      averageRating: parseFloat(result[0].averageRating.toFixed(1)),
      totalReviews: result[0].totalReviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating driver average rating',
      error: error.message
    });
  }
};