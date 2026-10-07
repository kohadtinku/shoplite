const { Op } = require('sequelize');
const { User } = require('../models');
const { success, asyncHandler, getPagination, buildPagination } = require('../utils/response');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.search) {
    where[Op.or] = [{ name: { [Op.like]: `%${req.query.search}%` } }, { email: { [Op.like]: `%${req.query.search}%` } }];
  }
  if (req.query.role) where.role = req.query.role;
  const { rows, count } = await User.findAndCountAll({ where, limit, offset, order: [['created_at', 'DESC']] });
  return success(res, { users: rows, pagination: buildPagination(page, limit, count) });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  await req.user.update({ ...(name !== undefined && { name }), ...(phone !== undefined && { phone }) });
  return success(res, { user: req.user }, 'Profile updated');
});
