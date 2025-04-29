// routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const {
  createRating,
  getFoodRatings,
  getRating,
  updateRating,
  deleteRating
} = require('../controllers/ratingsController');

// Create rating
router.post('/', createRating);

// Get all ratings for a food
router.get('/food/:foodId', getFoodRatings);

// Get single rating
router.get('/:id', getRating);

// Update rating
router.put('/:id', updateRating);

// Delete rating
router.delete('/:id', deleteRating);

module.exports = router;