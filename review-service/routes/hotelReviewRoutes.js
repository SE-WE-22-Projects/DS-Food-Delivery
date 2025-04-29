const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/hotelReviewController.js');

// Create a new review
router.post('/', reviewController.createReview);

// Get all reviews
router.get('/', reviewController.getAllReviews);

// Get a specific review by ID
router.get('/:id', reviewController.getReviewById);

// Get reviews by hotel ID
router.get('/hotel/:hotelId', reviewController.getReviewsByHotel);

// Get reviews by user ID
router.get('/user/:userId', reviewController.getReviewsByUser);

// Update a review
router.put('/:id', reviewController.updateReview);

// Delete a review
router.delete('/:id', reviewController.deleteReview);

module.exports = router;