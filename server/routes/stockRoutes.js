const router = require('express').Router();
const c = require('../controllers/stockController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validate, idParam, stockRules } = require('../middleware/validators');

router.use(authenticate, authorizeAdmin);
router.get('/', c.list);
router.get('/low-stock', c.lowStock); // must be defined before /:productId style routes
router.put('/:productId', idParam('productId'), stockRules, validate, c.update);

module.exports = router;
