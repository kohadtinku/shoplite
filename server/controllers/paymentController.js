const { sequelize, Payment, Order, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { success, asyncHandler, getPagination, buildPagination, round2 } = require('../utils/response');

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const where = {};
  if (req.query.status) where.payment_status = req.query.status;
  const { rows, count } = await Payment.findAndCountAll({
    where, limit, offset, order: [['created_at', 'DESC']],
    include: [{ model: Order, as: 'order', attributes: ['id', 'order_number', 'status'], include: [{ model: User, as: 'user', attributes: ['name'] }] }],
  });
  return success(res, { payments: rows, pagination: buildPagination(page, limit, count) });
});

// Simulated payment for a pending payment (e.g. COD collected, or "pay later")
exports.pay = asyncHandler(async (req, res) => {
  const result = await sequelize.transaction(async (t) => {
    const order = await Order.findByPk(req.params.orderId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order || (req.user.role !== 'admin' && order.user_id !== req.user.id)) throw ApiError.notFound('Order not found');
    const payment = await Payment.findOne({ where: { order_id: order.id }, transaction: t, lock: t.LOCK.UPDATE });
    if (!payment) throw ApiError.notFound('Payment not found');
    if (order.status === 'cancelled') throw ApiError.conflict('Cannot pay for a cancelled order');
    if (payment.payment_status !== 'pending') throw ApiError.conflict(`Payment is already ${payment.payment_status}`);
    // Rule 9: payment amount must equal the order total
    if (round2(req.body.amount) !== round2(order.total_amount)) throw ApiError.badRequest(`Payment amount must equal order total (${order.total_amount})`);

    await payment.update({ payment_status: 'paid', paid_at: new Date() }, { transaction: t });
    if (order.status === 'pending') await order.update({ status: 'confirmed' }, { transaction: t });
    return payment;
  });
  return success(res, result, 'Payment recorded successfully');
});
