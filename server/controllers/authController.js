const bcrypt = require('bcrypt');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { success, asyncHandler } = require('../utils/response');
const { signToken } = require('../utils/token');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const existing = await User.findOne({ where: { email } });
  if (existing) throw ApiError.conflict('Email already registered');

  const hash = await bcrypt.hash(password, 10); // 10 salt rounds
  // role is NEVER taken from the request body (prevents privilege escalation) -> DB default 'customer'
  const user = await User.create({ name, email, password: hash, phone });
  const safe = await User.findByPk(user.id);
  return success(res, { user: safe, token: signToken(safe) }, 'Registration successful', 201);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.scope('withPassword').findOne({ where: { email } });
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw ApiError.unauthorized('Invalid email or password'); // same message for both cases
  const safe = await User.findByPk(user.id);
  return success(res, { user: safe, token: signToken(safe) }, 'Login successful');
});

exports.me = asyncHandler(async (req, res) => success(res, { user: req.user }, 'Current user'));
