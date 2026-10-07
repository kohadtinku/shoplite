const router = require('express').Router();
const c = require('../controllers/paymentController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validate, idParam, paymentRules } = require('../middleware/validators');

router.get('/', authenticate, authorizeAdmin, c.list);
router.post('/:orderId/pay', authenticate, idParam('orderId'), paymentRules, validate, c.pay);

module.exports = router;
