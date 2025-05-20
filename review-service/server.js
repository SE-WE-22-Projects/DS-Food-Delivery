import "dotenv"
import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';


import restaurantReviewRoutes from './routes/restaurantRoute.js';
import driverReviewRoutes from './routes/driverRoute.js';


const app = express();

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use('/api/review', restaurantReviewRoutes);
app.use('/api/driver', driverReviewRoutes);





// MongoDB Connection
connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));

export default app;