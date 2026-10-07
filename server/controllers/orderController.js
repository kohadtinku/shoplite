const { Order, OrderItem, Product, User, Payment } = require('../models');
const ApiError = require('../utils/ApiError');
const orderService = require('../services/orderService');
const { success, asyncHandler, getPagination, buildPagination } = require('../utils/response');

exports.create = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  return success(res, order, 'Order placed successfully', 201);
});

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.user.role !== 'admin') where.user_id = req.user.id; // rule 13: customers see ONLY their orders
  if (req.query.status) where.status = req.query.status;

  const { rows, count } = await Order.findAndCountAll({
    where, limit, offset, distinct: true,
    order: [['created_at', 'DESC'], ['id', 'DESC']],
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] },
      { model: Payment, as: 'payment' },
    ],
  });
  return success(res, { orders: rows, pagination: buildPagination(page, limit, count) });
});

exports.getOne = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  if (!order || (req.user.role !== 'admin' && order.user_id !== req.user.id)) throw ApiError.notFound('Order not found');
  return success(res, order);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.params.id, req.body.status, req.user);
  return success(res, order, `Order status updated to ${req.body.status}`);
});
