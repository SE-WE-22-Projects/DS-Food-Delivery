require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const resturantReviewRoutes = require('./routes/resturantRoute');
const driverReviewRoutes = require('./routes/driverRoute');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/review', resturantReviewRoutes);
app.use('/api/driver', driverReviewRoutes);





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