const HotelReview = require('../models/resturantReview');

/**
 * Create a new hotel review
 * @param {Object} reviewData - The review data
 * @returns {Promise<Object>} Created review
 */
const createReview = async (reviewData) => {
  try {
    const newReview = new HotelReview(reviewData);
    return await newReview.save();
  } catch (error) {
    throw error;
  }
};

/**
 * Get all reviews
 * @param {Object} filter - Optional filter criteria
 * @param {Object} options - Optional query options (pagination, sorting)
 * @returns {Promise<Array>} Array of reviews
 */
const getAllReviews = async (filter = {}, options = {}) => {
  try {
    const { limit = 10, page = 1, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    
    return await HotelReview.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name')
      .exec();
  } catch (error) {
    throw error;
  }
};

/**
 * Get a review by ID
 * @param {String} reviewId - The review ID
 * @returns {Promise<Object>} The review document
 */
const getReviewById = async (reviewId) => {
  try {
    const review = await HotelReview.findById(reviewId)
      .populate('userId', 'name')
      .exec();
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    return review;
  } catch (error) {
    throw error;
  }
};

/**
 * Get reviews by restaurant ID
 * @param {String} restaurantId - The restaurant ID
 * @param {Object} options - Optional query options
 * @returns {Promise<Array>} Array of reviews for the restaurant
 */
const getReviewsByRestaurantId = async (restaurantId, options = {}) => {
  try {
    const { limit = 10, page = 1, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    
    return await HotelReview.find({ restaurantId })
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name')
      .exec();
  } catch (error) {
    throw error;
  }
};

/**
 * Update a review
 * @param {String} reviewId - The review ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated review
 */
const updateReview = async (reviewId, updateData) => {
  try {
    const review = await HotelReview.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    return review;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a review
 * @param {String} reviewId - The review ID
 * @returns {Promise<Object>} Deleted review
 */
const deleteReview = async (reviewId) => {
  try {
    const review = await HotelReview.findByIdAndDelete(reviewId);
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    return review;
  } catch (error) {
    throw error;
  }
};

/**
 * Get average rating for a restaurant
 * @param {String} restaurantId - The restaurant ID
 * @returns {Promise<Number>} Average rating
 */
const getAverageRating = async (restaurantId) => {
  try {
    const result = await HotelReview.aggregate([
      { $match: { restaurantId: mongoose.Types.ObjectId(restaurantId) } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);
    
    return result.length > 0 ? result[0].averageRating : 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByRestaurantId,
  updateReview,
  deleteReview,
  getAverageRating
};