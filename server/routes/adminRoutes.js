const router = require('express').Router();
const c = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.use(authenticate, authorizeAdmin);
router.get('/dashboard', c.dashboard);
router.get('/reports', c.reports);

module.exports = router;
