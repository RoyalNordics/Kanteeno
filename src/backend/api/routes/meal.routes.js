const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const mealController = require('../controllers/meal.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

// @route   GET api/meals
// @desc    Get all meals
// @access  Private
router.get('/', auth, mealController.getAllMeals);

// @route   GET api/meals/:id
// @desc    Get meal by ID
// @access  Private
router.get('/:id', auth, mealController.getMealById);

// @route   POST api/meals
// @desc    Create a new meal
// @access  Private/Chef
router.post(
  '/',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('ingredients', 'Ingredients are required').isArray(),
      check('nutritionalInfo', 'Nutritional info is required').not().isEmpty(),
      check('mealType', 'Meal type is required').not().isEmpty()
    ]
  ],
  mealController.createMeal
);

// @route   PUT api/meals/:id
// @desc    Update meal
// @access  Private/Chef
router.put(
  '/:id',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('name', 'Name is required').optional(),
      check('description', 'Description is required').optional(),
      check('ingredients', 'Ingredients are required').optional().isArray(),
      check('nutritionalInfo', 'Nutritional info is required').optional(),
      check('mealType', 'Meal type is required').optional()
    ]
  ],
  mealController.updateMeal
);

// @route   DELETE api/meals/:id
// @desc    Delete meal
// @access  Private/Chef
router.delete('/:id', [auth, checkRole(['admin', 'chef'])], mealController.deleteMeal);

// @route   GET api/meals/types
// @desc    Get all meal types
// @access  Private
router.get('/types', auth, mealController.getMealTypes);

// @route   GET api/meals/popular
// @desc    Get popular meals
// @access  Private/Chef
router.get('/popular', [auth, checkRole(['admin', 'chef'])], mealController.getPopularMeals);

// @route   POST api/meals/:id/feedback
// @desc    Add feedback to a meal
// @access  Private
router.post(
  '/:id/feedback',
  [
    auth,
    [
      check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
      check('comment', 'Comment is required').optional()
    ]
  ],
  mealController.addMealFeedback
);

// @route   GET api/meals/:id/feedback
// @desc    Get feedback for a meal
// @access  Private/Chef
router.get(
  '/:id/feedback',
  [auth, checkRole(['admin', 'chef'])],
  mealController.getMealFeedback
);

// @route   GET api/meals/search
// @desc    Search meals
// @access  Private
router.get('/search', auth, mealController.searchMeals);

// @route   GET api/meals/allergies
// @desc    Get meals filtered by allergies
// @access  Private
router.get('/allergies', auth, mealController.getMealsByAllergies);

module.exports = router;
