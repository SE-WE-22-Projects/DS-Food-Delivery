import { Router } from 'express';
import controller from '../controllers/restaurantController.js';
const router = Router();

// Create a new review
router.post('/', controller.createReview);

// Get all reviews
router.get('/', controller.getAllReviews);

// Get a specific review by ID
router.get('/:id', controller.getReviewById);

// Get reviews by restaurant ID
router.get('/restaurant/:restaurantId', controller.getReviewsByRestaurantId);

// Get average rating for a restaurant
router.get('/restaurant/:restaurantId/rating', controller.getAverageRating);

// Update a review
router.put('/:id', controller.updateReview);

// Delete a review
router.delete('/:id', controller.deleteReview);

export default router;