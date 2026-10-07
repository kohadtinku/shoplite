const router = require('express').Router();
const c = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { validate, idParam, orderRules, orderStatusRules } = require('../middleware/validators');

router.use(authenticate);
router.post('/', orderRules, validate, c.create);
router.get('/', c.list);
router.get('/:id', idParam(), validate, c.getOne);
router.put('/:id/status', idParam(), orderStatusRules, validate, c.updateStatus);

module.exports = router;
