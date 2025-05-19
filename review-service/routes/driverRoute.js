const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/driverController');

// Create a new rating
router.post('/', RatingController.createRating);

// Get all ratings for a driver
router.get('/driver/:driverId', RatingController.getDriverRatings);

// Get average rating for a driver
router.get('/driver/:driverId/average', RatingController.getDriverAverageRating);

// Get a specific rating by ID
router.get('/:id', RatingController.getRating);

module.exports = router;