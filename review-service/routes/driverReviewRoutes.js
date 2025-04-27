const express = require('express');
const router = express.Router();
const driverReviewController = require('../controllers/driverReviewController.js');

// Create a new driver review
router.post('/', driverReviewController.createDriverReview);

// Get all driver reviews
router.get('/', driverReviewController.getAllDriverReviews);

// Get a specific driver review by ID
router.get('/:id', driverReviewController.getDriverReviewById);

// Get reviews by driver ID
router.get('/driver/:driverId', driverReviewController.getReviewsByDriver);

// Get reviews by user ID
router.get('/user/:userId', driverReviewController.getReviewsByUser);

// Get average rating for a driver
router.get('/driver/:driverId/rating', driverReviewController.getDriverAverageRating);

// Update a driver review
router.put('/:id', driverReviewController.updateDriverReview);

// Delete a driver review
router.delete('/:id', driverReviewController.deleteDriverReview);

module.exports = router;