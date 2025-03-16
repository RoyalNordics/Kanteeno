const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const reportController = require('../controllers/report.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

// @route   GET api/reports/dashboard
// @desc    Get dashboard data
// @access  Private/Admin or Chef
router.get(
  '/dashboard',
  [auth, checkRole(['admin', 'chef'])],
  reportController.getDashboardData
);

// @route   GET api/reports/food-waste
// @desc    Get food waste reports
// @access  Private/Admin or Chef
router.get(
  '/food-waste',
  [auth, checkRole(['admin', 'chef'])],
  reportController.getFoodWasteReports
);

// @route   POST api/reports/food-waste
// @desc    Record food waste
// @access  Private/Chef
router.post(
  '/food-waste',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('businessUnitId', 'Business unit ID is required').not().isEmpty(),
      check('date', 'Date is required').isISO8601(),
      check('mealType', 'Meal type is required').not().isEmpty(),
      check('quantity', 'Quantity is required').isNumeric(),
      check('unit', 'Unit is required').not().isEmpty(),
      check('reason', 'Reason is required').not().isEmpty()
    ]
  ],
  reportController.recordFoodWaste
);

// @route   GET api/reports/sustainability
// @desc    Get sustainability reports
// @access  Private/Admin or Chef
router.get(
  '/sustainability',
  [auth, checkRole(['admin', 'chef'])],
  reportController.getSustainabilityReports
);

// @route   GET api/reports/financial
// @desc    Get financial reports
// @access  Private/Admin
router.get('/financial', [auth, checkRole(['admin'])], reportController.getFinancialReports);

// @route   GET api/reports/user-activity
// @desc    Get user activity reports
// @access  Private/Admin
router.get(
  '/user-activity',
  [auth, checkRole(['admin'])],
  reportController.getUserActivityReports
);

// @route   GET api/reports/meal-popularity
// @desc    Get meal popularity reports
// @access  Private/Admin or Chef
router.get(
  '/meal-popularity',
  [auth, checkRole(['admin', 'chef'])],
  reportController.getMealPopularityReports
);

// @route   GET api/reports/supplier-performance
// @desc    Get supplier performance reports
// @access  Private/Admin
router.get(
  '/supplier-performance',
  [auth, checkRole(['admin'])],
  reportController.getSupplierPerformanceReports
);

// @route   GET api/reports/co2
// @desc    Get CO2 emission reports
// @access  Private/Admin or Chef
router.get('/co2', [auth, checkRole(['admin', 'chef'])], reportController.getCO2Reports);

// @route   GET api/reports/business-unit/:businessUnitId
// @desc    Get reports for a specific business unit
// @access  Private/Admin or Chef
router.get(
  '/business-unit/:businessUnitId',
  [auth, checkRole(['admin', 'chef'])],
  reportController.getBusinessUnitReports
);

// @route   GET api/reports/benchmarking
// @desc    Get benchmarking reports comparing business units
// @access  Private/Admin
router.get(
  '/benchmarking',
  [auth, checkRole(['admin'])],
  reportController.getBenchmarkingReports
);

// @route   GET api/reports/export/:reportType
// @desc    Export report data as CSV
// @access  Private/Admin or Chef
router.get(
  '/export/:reportType',
  [auth, checkRole(['admin', 'chef'])],
  reportController.exportReportData
);

// @route   GET api/reports/kpi
// @desc    Get KPI reports
// @access  Private/Admin
router.get('/kpi', [auth, checkRole(['admin'])], reportController.getKPIReports);

module.exports = router;
