const router = require('express').Router();
const c = require('../controllers/productController');
const { authenticate, optionalAuth, authorizeAdmin } = require('../middleware/auth');
const { validate, idParam, productRules } = require('../middleware/validators');

router.get('/', optionalAuth, c.list);
router.get('/:id', optionalAuth, idParam(), validate, c.getOne);
router.post('/', authenticate, authorizeAdmin, productRules(false), validate, c.create);
router.put('/:id', authenticate, authorizeAdmin, idParam(), productRules(true), validate, c.update);
router.delete('/:id', authenticate, authorizeAdmin, idParam(), validate, c.remove);

module.exports = router;
