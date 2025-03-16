const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');
const authMiddleware = require('../middlewares/auth');

/**
 * @route   GET /api/recommendations
 * @desc    Get personalized recommendations for the authenticated user
 * @access  Private
 */
router.get('/', authMiddleware, recommendationController.getRecommendations);

/**
 * @route   GET /api/recommendations/trending
 * @desc    Get trending meals
 * @access  Public
 */
router.get('/trending', recommendationController.getTrending);

module.exports = router;
