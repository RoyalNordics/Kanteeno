const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const forecastController = require('../controllers/forecast.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

// @route   GET api/forecasts
// @desc    Get all forecasts
// @access  Private/Admin or Chef
router.get('/', [auth, checkRole(['admin', 'chef'])], forecastController.getAllForecasts);

// @route   GET api/forecasts/:id
// @desc    Get forecast by ID
// @access  Private/Admin or Chef
router.get('/:id', [auth, checkRole(['admin', 'chef'])], forecastController.getForecastById);

// @route   POST api/forecasts
// @desc    Generate a new forecast
// @access  Private/Chef
router.post(
  '/',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('businessUnitId', 'Business unit ID is required').not().isEmpty(),
      check('startDate', 'Start date is required').isISO8601(),
      check('endDate', 'End date is required').isISO8601(),
      check('mealTypes', 'Meal types are required').optional().isArray()
    ]
  ],
  forecastController.generateForecast
);

// @route   PUT api/forecasts/:id
// @desc    Update forecast
// @access  Private/Chef
router.put(
  '/:id',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('adjustments', 'Adjustments are required').isArray(),
      check('adjustments.*.day', 'Day is required for each adjustment').isISO8601(),
      check('adjustments.*.mealType', 'Meal type is required for each adjustment').not().isEmpty(),
      check('adjustments.*.quantity', 'Quantity is required for each adjustment').isNumeric()
    ]
  ],
  forecastController.updateForecast
);

// @route   DELETE api/forecasts/:id
// @desc    Delete forecast
// @access  Private/Admin
router.delete('/:id', [auth, checkRole(['admin'])], forecastController.deleteForecast);

// @route   GET api/forecasts/business-unit/:businessUnitId
// @desc    Get forecasts by business unit
// @access  Private/Admin or Chef
router.get(
  '/business-unit/:businessUnitId',
  [auth, checkRole(['admin', 'chef'])],
  forecastController.getForecastsByBusinessUnit
);

// @route   GET api/forecasts/current
// @desc    Get current forecast
// @access  Private/Chef
router.get('/current', [auth, checkRole(['admin', 'chef'])], forecastController.getCurrentForecast);

// @route   GET api/forecasts/accuracy
// @desc    Get forecast accuracy metrics
// @access  Private/Admin or Chef
router.get(
  '/accuracy',
  [auth, checkRole(['admin', 'chef'])],
  forecastController.getForecastAccuracy
);

// @route   POST api/forecasts/train
// @desc    Train forecast model with new data
// @access  Private/Admin
router.post(
  '/train',
  [
    auth,
    checkRole(['admin']),
    [
      check('businessUnitId', 'Business unit ID is required').not().isEmpty(),
      check('startDate', 'Start date is required').isISO8601(),
      check('endDate', 'End date is required').isISO8601()
    ]
  ],
  forecastController.trainForecastModel
);

// @route   GET api/forecasts/factors
// @desc    Get external factors affecting forecasts
// @access  Private/Admin or Chef
router.get(
  '/factors',
  [auth, checkRole(['admin', 'chef'])],
  forecastController.getExternalFactors
);

// @route   POST api/forecasts/factors
// @desc    Add external factor
// @access  Private/Admin or Chef
router.post(
  '/factors',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('date', 'Date is required').isISO8601(),
      check('impact', 'Impact is required').isNumeric(),
      check('description', 'Description is required').not().isEmpty(),
      check('businessUnitId', 'Business unit ID is required').not().isEmpty()
    ]
  ],
  forecastController.addExternalFactor
);

// @route   GET api/forecasts/comparison
// @desc    Compare forecast with actual consumption
// @access  Private/Admin or Chef
router.get(
  '/comparison',
  [auth, checkRole(['admin', 'chef'])],
  forecastController.compareForecastWithActual
);

module.exports = router;
