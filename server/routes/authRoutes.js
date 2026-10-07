const router = require('express').Router();
const c = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, registerRules, loginRules } = require('../middleware/validators');

router.post('/register', registerRules, validate, c.register);
router.post('/login', loginRules, validate, c.login);
router.get('/me', authenticate, c.me);

module.exports = router;
