const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/token');
const { asyncHandler } = require('../utils/response');

const extract = (req) => {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
};

// Requires a valid JWT. Attaches req.user.
const authenticate = asyncHandler(async (req, res, next) => {
  const token = extract(req);
  if (!token) throw ApiError.unauthorized('Authentication token missing');
  let payload;
  try { payload = verifyToken(token); } catch { throw ApiError.unauthorized('Invalid or expired token'); }
  const user = await User.findByPk(payload.id);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  req.user = user;
  next();
});

// Token optional (public routes that behave differently for admins)
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extract(req);
  if (token) {
    try { req.user = await User.findByPk(verifyToken(token).id); } catch { /* ignore */ }
  }
  next();
});

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return next(ApiError.forbidden('Admin access required'));
  next();
};

module.exports = { authenticate, optionalAuth, authorizeAdmin };
