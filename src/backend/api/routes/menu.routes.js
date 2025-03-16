const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const menuController = require('../controllers/menu.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

// @route   GET api/menus
// @desc    Get all menus
// @access  Private
router.get('/', auth, menuController.getAllMenus);

// @route   GET api/menus/current
// @desc    Get current week's menu
// @access  Private
router.get('/current', auth, menuController.getCurrentMenu);

// @route   GET api/menus/:id
// @desc    Get menu by ID
// @access  Private
router.get('/:id', auth, menuController.getMenuById);

// @route   POST api/menus
// @desc    Create a new menu
// @access  Private/Chef
router.post(
  '/',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('week', 'Week is required').not().isEmpty(),
      check('year', 'Year is required').not().isEmpty(),
      check('businessUnitId', 'Business unit ID is required').not().isEmpty()
    ]
  ],
  menuController.createMenu
);

// @route   PUT api/menus/:id
// @desc    Update menu
// @access  Private/Chef
router.put(
  '/:id',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('week', 'Week is required').optional(),
      check('year', 'Year is required').optional(),
      check('status', 'Status is required').optional()
    ]
  ],
  menuController.updateMenu
);

// @route   DELETE api/menus/:id
// @desc    Delete menu
// @access  Private/Admin
router.delete('/:id', [auth, checkRole(['admin'])], menuController.deleteMenu);

// @route   POST api/menus/:id/items
// @desc    Add menu item to menu
// @access  Private/Chef
router.post(
  '/:id/items',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('day', 'Day is required').not().isEmpty(),
      check('mealType', 'Meal type is required').not().isEmpty()
    ]
  ],
  menuController.addMenuItem
);

// @route   PUT api/menus/:id/items/:itemId
// @desc    Update menu item
// @access  Private/Chef
router.put(
  '/:id/items/:itemId',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('name', 'Name is required').optional(),
      check('description', 'Description is required').optional(),
      check('day', 'Day is required').optional(),
      check('mealType', 'Meal type is required').optional()
    ]
  ],
  menuController.updateMenuItem
);

// @route   DELETE api/menus/:id/items/:itemId
// @desc    Delete menu item
// @access  Private/Chef
router.delete(
  '/:id/items/:itemId',
  [auth, checkRole(['admin', 'chef'])],
  menuController.deleteMenuItem
);

// @route   POST api/menus/generate
// @desc    Generate menu using AI
// @access  Private/Chef
router.post(
  '/generate',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('week', 'Week is required').not().isEmpty(),
      check('year', 'Year is required').not().isEmpty(),
      check('businessUnitId', 'Business unit ID is required').not().isEmpty()
    ]
  ],
  menuController.generateMenu
);

// @route   GET api/menus/:id/feedback
// @desc    Get feedback for a menu
// @access  Private/Chef
router.get(
  '/:id/feedback',
  [auth, checkRole(['admin', 'chef'])],
  menuController.getMenuFeedback
);

module.exports = router;
