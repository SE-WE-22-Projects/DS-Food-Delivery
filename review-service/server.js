require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const ratingsRoutes = require('./routes/ratingsRoutes');
const hotelReviewRoutes = require('./routes/hotelReviewRoutes');
const driverReviewRoutes = require('./routes/driverReviewRoutes');
const deliveryReviewRoutes = require('./routes/driverReviewRoutes');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ratings', ratingsRoutes);
app.use('/api/hotel', hotelReviewRoutes);
app.use('/api/driver', driverReviewRoutes);
app.use('/api/delivery', deliveryReviewRoutes);

// MongoDB Connection
mongoose.connect(process.env.APP_DATABASE_URL)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
