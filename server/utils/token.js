const jwt = require('jsonwebtoken');

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');

module.exports = { signToken, verifyToken };
