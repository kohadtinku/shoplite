const router = require('express').Router();
const c = require('../controllers/categoryController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validate, idParam, categoryRules } = require('../middleware/validators');

router.get('/', c.list);
router.get('/:id', idParam(), validate, c.getOne);
router.post('/', authenticate, authorizeAdmin, categoryRules, validate, c.create);
router.put('/:id', authenticate, authorizeAdmin, idParam(), categoryRules, validate, c.update);
router.delete('/:id', authenticate, authorizeAdmin, idParam(), validate, c.remove);

module.exports = router;
