const express = require('express');
const hotelReviewController = require('../controllers/restaurantController');
const router = express.Router();

// Create a new review
router.post('/', hotelReviewController.createReview);

// Get all reviews
router.get('/', hotelReviewController.getAllReviews);

// Get a specific review by ID
router.get('/:id', hotelReviewController.getReviewById);

// Get reviews by restaurant ID
router.get('/restaurant/:restaurantId', hotelReviewController.getReviewsByRestaurantId);

// Get average rating for a restaurant
router.get('/restaurant/:restaurantId/rating', hotelReviewController.getAverageRating);

// Update a review
router.put('/:id', hotelReviewController.updateReview);

// Delete a review
router.delete('/:id', hotelReviewController.deleteReview);

module.exports = router;