import RatingService from '../services/driverService.js';

class RatingController {
  static async createRating(req, res) {
    try {
      const { userId, driverId, orderId, rating } = req.body;

      // Check if user has already rated this order
      const hasRated = await RatingService.hasUserRatedOrder(userId, orderId);
      if (hasRated) {
        return res.status(400).json({ message: 'You have already rated this order' });
      }

      const newRating = await RatingService.createRating({
        userId,
        driverId,
        orderId,
        rating
      });

      res.status(201).json(newRating);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getDriverRatings(req, res) {
    try {
      const { driverId } = req.params;
      const ratings = await RatingService.getRatingsByDriver(driverId);
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getDriverAverageRating(req, res) {
    try {
      const { driverId } = req.params;
      const averageRating = await RatingService.getAverageRating(driverId);
      res.json(averageRating);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getRating(req, res) {
    try {
      const { id } = req.params;
      const rating = await RatingService.getRatingById(id);
      if (!rating) {
        return res.status(404).json({ message: 'Rating not found' });
      }
      res.json(rating);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default RatingController;