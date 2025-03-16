const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const supplierController = require('../controllers/supplier.controller');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

// @route   GET api/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/', auth, supplierController.getAllSuppliers);

// @route   GET api/suppliers/:id
// @desc    Get supplier by ID
// @access  Private
router.get('/:id', auth, supplierController.getSupplierById);

// @route   POST api/suppliers
// @desc    Register a new supplier
// @access  Private/Admin
router.post(
  '/',
  [
    auth,
    checkRole(['admin']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('cvr', 'CVR number is required').not().isEmpty(),
      check('address', 'Address is required').not().isEmpty(),
      check('contactPerson', 'Contact person is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('phone', 'Phone number is required').not().isEmpty()
    ]
  ],
  supplierController.createSupplier
);

// @route   PUT api/suppliers/:id
// @desc    Update supplier
// @access  Private/Admin
router.put(
  '/:id',
  [
    auth,
    checkRole(['admin']),
    [
      check('name', 'Name is required').optional(),
      check('cvr', 'CVR number is required').optional(),
      check('address', 'Address is required').optional(),
      check('contactPerson', 'Contact person is required').optional(),
      check('email', 'Please include a valid email').optional().isEmail(),
      check('phone', 'Phone number is required').optional(),
      check('status', 'Status is required').optional()
    ]
  ],
  supplierController.updateSupplier
);

// @route   DELETE api/suppliers/:id
// @desc    Delete supplier
// @access  Private/Admin
router.delete('/:id', [auth, checkRole(['admin'])], supplierController.deleteSupplier);

// @route   GET api/suppliers/:id/products
// @desc    Get all products from a supplier
// @access  Private
router.get('/:id/products', auth, supplierController.getSupplierProducts);

// @route   POST api/suppliers/:id/products
// @desc    Add a product to a supplier
// @access  Private/Admin or Supplier
router.post(
  '/:id/products',
  [
    auth,
    checkRole(['admin', 'supplier']),
    [
      check('name', 'Name is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('price', 'Price is required').isNumeric(),
      check('unit', 'Unit is required').not().isEmpty(),
      check('category', 'Category is required').not().isEmpty(),
      check('kickbackPercentage', 'Kickback percentage is required').optional().isNumeric()
    ]
  ],
  supplierController.addSupplierProduct
);

// @route   PUT api/suppliers/:id/products/:productId
// @desc    Update a supplier product
// @access  Private/Admin or Supplier
router.put(
  '/:id/products/:productId',
  [
    auth,
    checkRole(['admin', 'supplier']),
    [
      check('name', 'Name is required').optional(),
      check('description', 'Description is required').optional(),
      check('price', 'Price is required').optional().isNumeric(),
      check('unit', 'Unit is required').optional(),
      check('category', 'Category is required').optional(),
      check('kickbackPercentage', 'Kickback percentage is required').optional().isNumeric()
    ]
  ],
  supplierController.updateSupplierProduct
);

// @route   DELETE api/suppliers/:id/products/:productId
// @desc    Delete a supplier product
// @access  Private/Admin or Supplier
router.delete(
  '/:id/products/:productId',
  [auth, checkRole(['admin', 'supplier'])],
  supplierController.deleteSupplierProduct
);

// @route   GET api/suppliers/marketplace
// @desc    Get all products for marketplace
// @access  Private
router.get('/marketplace', auth, supplierController.getMarketplaceProducts);

// @route   GET api/suppliers/categories
// @desc    Get all product categories
// @access  Private
router.get('/categories', auth, supplierController.getProductCategories);

// @route   GET api/suppliers/:id/performance
// @desc    Get supplier performance metrics
// @access  Private/Admin
router.get(
  '/:id/performance',
  [auth, checkRole(['admin'])],
  supplierController.getSupplierPerformance
);

module.exports = router;
