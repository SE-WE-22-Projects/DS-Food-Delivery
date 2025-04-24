require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const foodRoutes = require('./routes/foodRoutes');
const ratingsRoutes = require('./routes/ratingsRoutes');
const hotelReviewRoutes = require('./routes/hotelReviewRoutes');
const driverReviewRoutes = require('./routes/driverReviewRoutes'); 
const deliveryReviewRoutes = require('./routes/deliveryReviewRoutes');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/foods', foodRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/hotelReviews', hotelReviewRoutes);
app.use('/api/driverReviews', driverReviewRoutes); 
app.use('/api/deliveryReviews', deliveryReviewRoutes);




// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;