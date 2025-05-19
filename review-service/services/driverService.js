const Rating = require('../models/driverReview');

class RatingService {
  // Create a new rating
  static async createRating(ratingData) {
    try {
      const rating = new Rating(ratingData);
      await rating.save();
      return rating;
    } catch (error) {
      throw error;
    }
  }

  // Get all ratings for a driver
  static async getRatingsByDriver(driverId) {
    try {
      return await Rating.find({ driverId });
    } catch (error) {
      throw error;
    }
  }

  // Get average rating for a driver
  static async getAverageRating(driverId) {
    try {
      const result = await Rating.aggregate([
        { $match: { driverId } },
        { $group: { _id: null, averageRating: { $avg: "$rating" } } }
      ]);

      if (result.length > 0) {
        return { averageRating: parseFloat(result[0].averageRating.toFixed(2)) };
      }
      return { averageRating: 0 };
    } catch (error) {
      throw error;
    }
  }

  // Check if user has already rated an order
  static async hasUserRatedOrder(userId, orderId) {
    try {
      const rating = await Rating.findOne({ userId, orderId });
      return !!rating;
    } catch (error) {
      throw error;
    }
  }

  // Get rating by ID
  static async getRatingById(ratingId) {
    try {
      return await Rating.findById(ratingId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RatingService;