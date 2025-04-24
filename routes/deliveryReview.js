const express = require('express');
const router = express.Router();
const deliveryReviewController = require('../controllers/deliveryReviewController.js');

// Create a new delivery review
router.post('/', deliveryReviewController.createDeliveryReview);

// Get all delivery reviews
router.get('/', deliveryReviewController.getAllDeliveryReviews);

// Get a specific delivery review by ID
router.get('/:id', deliveryReviewController.getDeliveryReviewById);

// Get reviews by user ID
router.get('/user/:userId', deliveryReviewController.getReviewsByUser);

// Get reviews by food ID
router.get('/food/:foodId/reviews', deliveryReviewController.getReviewsByFood);

// Get average rating for a specific food
router.get('/food/:foodId/rating', deliveryReviewController.getFoodAverageRating);

// Get all foods with their average ratings
router.get('/foods/ratings', deliveryReviewController.getAllFoodsWithRatings);

// Update a delivery review
router.put('/:id', deliveryReviewController.updateDeliveryReview);

// Delete a delivery review
router.delete('/:id', deliveryReviewController.deleteDeliveryReview);

module.exports = router;