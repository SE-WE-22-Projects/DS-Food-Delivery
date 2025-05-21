import { Router } from 'express';
import controller from '../controllers/driverController.js';

const router = Router();

// Create a new rating
router.post('/', controller.createRating);

// Get all ratings for a driver
router.get('/driver/:driverId', controller.getDriverRatings);

// Get average rating for a driver
router.get('/driver/:driverId/average', controller.getDriverAverageRating);

// Get a specific rating by ID
router.get('/:id', controller.getRating);

export default router;