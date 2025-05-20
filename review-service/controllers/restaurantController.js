import hotelReviewService from '../services/restaurantService.js';

/**
 * Create a new review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createReview = async (req, res) => {
  try {
    const { userId, restaurantId, review, rating } = req.body;

    // Basic validation
    if (!userId || !restaurantId || !review || !rating) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const newReview = await hotelReviewService.createReview(req.body);
    res.status(201).json({
      success: true,
      data: newReview,
      message: 'Review created successfully'
    });
  } catch (error) {
    // Handle duplicate review error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this restaurant'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create review'
    });
  }
};

/**
 * Get all reviews
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder === 'asc' ? 1 : -1
    };

    const reviews = await hotelReviewService.getAllReviews({}, options);

    res.status(200).json({
      success: true,
      data: reviews,
      page: options.page,
      limit: options.limit,
      message: 'Reviews retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve reviews'
    });
  }
};

/**
 * Get a review by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await hotelReviewService.getReviewById(id);

    res.status(200).json({
      success: true,
      data: review,
      message: 'Review retrieved successfully'
    });
  } catch (error) {
    res.status(error.message === 'Review not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to retrieve review'
    });
  }
};

/**
 * Get reviews by restaurant ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReviewsByRestaurantId = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder === 'asc' ? 1 : -1
    };

    const reviews = await hotelReviewService.getReviewsByRestaurantId(restaurantId, options);

    res.status(200).json({
      success: true,
      data: reviews,
      page: options.page,
      limit: options.limit,
      message: 'Restaurant reviews retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve restaurant reviews'
    });
  }
};

/**
 * Update a review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    // Only allow updating rating and review text
    const updateData = { rating, review };

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const updatedReview = await hotelReviewService.updateReview(id, updateData);

    res.status(200).json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    res.status(error.message === 'Review not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to update review'
    });
  }
};

/**
 * Delete a review
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    await hotelReviewService.deleteReview(id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(error.message === 'Review not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to delete review'
    });
  }
};

/**
 * Get average rating for a restaurant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAverageRating = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const averageRating = await hotelReviewService.getAverageRating(restaurantId);

    res.status(200).json({
      success: true,
      data: { restaurantId, averageRating },
      message: 'Average rating retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve average rating'
    });
  }
};

export default {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByRestaurantId,
  updateReview,
  deleteReview,
  getAverageRating
};