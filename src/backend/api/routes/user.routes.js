const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const userController = require('../controllers/user.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

// @route   GET api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', [auth, checkRole(['admin'])], userController.getAllUsers);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', [auth, checkRole(['admin'])], userController.getUserById);

// @route   PUT api/users/:id
// @desc    Update user
// @access  Private/Admin
router.put(
  '/:id',
  [
    auth,
    checkRole(['admin']),
    [
      check('name', 'Name is required').optional(),
      check('email', 'Please include a valid email').optional().isEmail(),
      check('role', 'Role is required').optional()
    ]
  ],
  userController.updateUser
);

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', [auth, checkRole(['admin'])], userController.deleteUser);

// @route   GET api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, userController.getUserProfile);

// @route   PUT api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    [
      check('name', 'Name is required').optional(),
      check('email', 'Please include a valid email').optional().isEmail(),
      check('password', 'Please enter a password with 6 or more characters').optional().isLength({ min: 6 })
    ]
  ],
  userController.updateUserProfile
);

// @route   GET api/users/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', auth, userController.getUserPreferences);

// @route   PUT api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, userController.updateUserPreferences);

module.exports = router;
