const router = require('express').Router();
const c = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validate, profileRules } = require('../middleware/validators');

router.get('/', authenticate, authorizeAdmin, c.list);
router.put('/me', authenticate, profileRules, validate, c.updateMe);

module.exports = router;
