const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const orderController = require('../controllers/order.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

// @route   GET api/orders
// @desc    Get all orders
// @access  Private/Admin or Chef
router.get('/', [auth, checkRole(['admin', 'chef'])], orderController.getAllOrders);

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private/Admin or Chef
router.get('/:id', [auth, checkRole(['admin', 'chef'])], orderController.getOrderById);

// @route   POST api/orders
// @desc    Create a new order
// @access  Private/Chef
router.post(
  '/',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('businessUnitId', 'Business unit ID is required').not().isEmpty(),
      check('items', 'Items are required').isArray(),
      check('items.*.productId', 'Product ID is required for each item').not().isEmpty(),
      check('items.*.quantity', 'Quantity is required for each item').isNumeric(),
      check('deliveryDate', 'Delivery date is required').isISO8601()
    ]
  ],
  orderController.createOrder
);

// @route   PUT api/orders/:id
// @desc    Update order
// @access  Private/Admin or Chef
router.put(
  '/:id',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('status', 'Status is required').optional(),
      check('items', 'Items are required').optional().isArray(),
      check('items.*.productId', 'Product ID is required for each item').optional().not().isEmpty(),
      check('items.*.quantity', 'Quantity is required for each item').optional().isNumeric(),
      check('deliveryDate', 'Delivery date is required').optional().isISO8601()
    ]
  ],
  orderController.updateOrder
);

// @route   DELETE api/orders/:id
// @desc    Cancel order
// @access  Private/Admin or Chef
router.delete('/:id', [auth, checkRole(['admin', 'chef'])], orderController.cancelOrder);

// @route   GET api/orders/business-unit/:businessUnitId
// @desc    Get orders by business unit
// @access  Private/Admin or Chef
router.get(
  '/business-unit/:businessUnitId',
  [auth, checkRole(['admin', 'chef'])],
  orderController.getOrdersByBusinessUnit
);

// @route   GET api/orders/status/:status
// @desc    Get orders by status
// @access  Private/Admin or Chef
router.get(
  '/status/:status',
  [auth, checkRole(['admin', 'chef'])],
  orderController.getOrdersByStatus
);

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin or Chef
router.put(
  '/:id/status',
  [
    auth,
    checkRole(['admin', 'chef']),
    [check('status', 'Status is required').not().isEmpty()]
  ],
  orderController.updateOrderStatus
);

// @route   POST api/orders/:id/complaint
// @desc    File a complaint for an order
// @access  Private/Chef
router.post(
  '/:id/complaint',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('reason', 'Reason is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('items', 'Items are required').optional().isArray()
    ]
  ],
  orderController.fileOrderComplaint
);

// @route   GET api/orders/complaints
// @desc    Get all order complaints
// @access  Private/Admin
router.get('/complaints', [auth, checkRole(['admin'])], orderController.getAllComplaints);

// @route   GET api/orders/upcoming-deliveries
// @desc    Get upcoming deliveries
// @access  Private/Chef
router.get(
  '/upcoming-deliveries',
  [auth, checkRole(['admin', 'chef'])],
  orderController.getUpcomingDeliveries
);

// @route   POST api/orders/generate
// @desc    Generate orders based on menu
// @access  Private/Chef
router.post(
  '/generate',
  [
    auth,
    checkRole(['admin', 'chef']),
    [
      check('menuId', 'Menu ID is required').not().isEmpty(),
      check('businessUnitId', 'Business unit ID is required').not().isEmpty()
    ]
  ],
  orderController.generateOrdersFromMenu
);

module.exports = router;
