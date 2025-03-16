const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// API Routes
app.use('/api/auth', require('./api/routes/auth.routes'));
app.use('/api/users', require('./api/routes/user.routes'));
app.use('/api/menus', require('./api/routes/menu.routes'));
app.use('/api/meals', require('./api/routes/meal.routes'));
app.use('/api/suppliers', require('./api/routes/supplier.routes'));
app.use('/api/orders', require('./api/routes/order.routes'));
app.use('/api/reports', require('./api/routes/report.routes'));
app.use('/api/forecasts', require('./api/routes/forecast.routes'));
app.use('/api/recommendations', require('./api/routes/recommendation.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Kanteeno API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`);
  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Server Error' : err.message,
    },
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes
