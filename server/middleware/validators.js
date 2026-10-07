const { body, param, validationResult } = require('express-validator');

// Runs after the rule chains; returns the consistent error format.
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: result.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

const idParam = (name = 'id') => param(name).isInt({ min: 1 }).withMessage(`${name} must be a positive integer`).toInt();

const PAYMENT_METHODS = ['COD', 'UPI', 'CARD', 'NET_BANKING'];
const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ nullable: true, checkFalsy: true }).matches(/^[0-9+\-\s]{7,20}$/).withMessage('Invalid phone number'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const profileRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional({ nullable: true, checkFalsy: true }).matches(/^[0-9+\-\s]{7,20}$/).withMessage('Invalid phone number'),
];

const categoryRules = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 100 }),
  body('description').optional({ nullable: true }).isString(),
];

const productRules = (isUpdate = false) => {
  const opt = (chain) => (isUpdate ? chain.optional() : chain);
  return [
    opt(body('category_id')).isInt({ min: 1 }).withMessage('category_id must be a valid id').toInt(),
    opt(body('name')).trim().notEmpty().withMessage('Product name is required'),
    opt(body('price')).isFloat({ gt: 0 }).withMessage('Price must be greater than 0').toFloat(),
    opt(body('sku')).trim().notEmpty().withMessage('SKU is required'),
    body('description').optional({ nullable: true }).isString(),
    body('image').optional({ nullable: true, checkFalsy: true }).isString(),
    body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
    body('initial_stock').optional().isInt({ min: 0 }).withMessage('initial_stock must be >= 0').toInt(),
    body('reorder_level').optional().isInt({ min: 0 }).withMessage('reorder_level must be >= 0').toInt(),
  ];
};

const stockRules = [
  body('change').optional().isInt().withMessage('change must be an integer (use negative to decrease)').toInt(),
  body('quantity').optional().isInt({ min: 0 }).withMessage('quantity must be >= 0').toInt(),
  body('reorder_level').optional().isInt({ min: 0 }).withMessage('reorder_level must be >= 0').toInt(),
  body().custom((v) => {
    if (v.change === undefined && v.quantity === undefined && v.reorder_level === undefined) {
      throw new Error('Provide at least one of: change, quantity, reorder_level');
    }
    return true;
  }),
];

const orderRules = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('Each item needs a valid product_id').toInt(),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item quantity must be at least 1').toInt(),
  body('shipping_address').trim().isLength({ min: 5 }).withMessage('Shipping address is required'),
  body('payment_method').isIn(PAYMENT_METHODS).withMessage(`payment_method must be one of ${PAYMENT_METHODS.join(', ')}`),
  body('simulate_payment_failure').optional().isBoolean(),
];

const orderStatusRules = [
  body('status').isIn(ORDER_STATUSES).withMessage(`status must be one of ${ORDER_STATUSES.join(', ')}`),
];

const paymentRules = [
  body('amount').isFloat({ gt: 0 }).withMessage('Payment amount must be greater than 0').toFloat(),
];

module.exports = {
  validate, idParam, registerRules, loginRules, profileRules, categoryRules,
  productRules, stockRules, orderRules, orderStatusRules, paymentRules,
};
