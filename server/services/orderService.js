const { sequelize, User, Product, ProductStock, Order, OrderItem, Payment } = require('../models');
const ApiError = require('../utils/ApiError');
const { round2 } = require('../utils/response');

/*
 * WHY TRANSACTIONS?
 * Creating an order touches several tables (orders, order_items, product_stock, payments).
 * They must succeed or fail AS ONE UNIT (atomicity). If stock is reduced but the payment insert
 * fails, we'd lose inventory with no order. A transaction lets us ROLLBACK everything.
 *
 *   BEGIN;  ...all statements...  COMMIT;   -- or ROLLBACK; on any error
 *
 * We also use row locks (SELECT ... FOR UPDATE) so two customers can't buy the last item simultaneously.
 */

const generateOrderNumber = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `SL-${ymd}-${Math.floor(100000 + Math.random() * 900000)}`;
};
const generatePaymentRef = () => `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const fullOrderInclude = [
  { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
  { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'image'] }] },
  { model: Payment, as: 'payment' },
];

const getOrderById = (id, options = {}) =>
  Order.findByPk(id, { include: fullOrderInclude, order: [[{ model: OrderItem, as: 'items' }, 'id', 'ASC']], ...options });

async function createOrder(userId, { items, shipping_address, payment_method, simulate_payment_failure }) {
  const t = await sequelize.transaction(); // BEGIN
  try {
    // 1. Validate user
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) throw ApiError.notFound('User not found');

    // Merge duplicate product lines (same product twice => sum quantities)
    const wanted = new Map();
    items.forEach((i) => wanted.set(i.product_id, (wanted.get(i.product_id) || 0) + i.quantity));
    const productIds = [...wanted.keys()].sort((a, b) => a - b); // fixed lock order avoids deadlocks

    // 2. Validate products
    const products = await Product.findAll({ where: { id: productIds }, transaction: t });
    if (products.length !== productIds.length) throw ApiError.notFound('One or more products do not exist');
    const inactive = products.find((p) => !p.is_active);
    if (inactive) throw ApiError.badRequest(`Product "${inactive.name}" is not available`);

    // 3. Check stock - lock stock rows:  SELECT * FROM product_stock WHERE product_id IN (...) FOR UPDATE
    const stocks = await ProductStock.findAll({
      where: { product_id: productIds }, order: [['product_id', 'ASC']], transaction: t, lock: t.LOCK.UPDATE,
    });
    const stockByProduct = new Map(stocks.map((s) => [s.product_id, s]));
    const productById = new Map(products.map((p) => [p.id, p]));

    const lines = [];
    for (const pid of productIds) {
      const qty = wanted.get(pid);
      const product = productById.get(pid);
      const stock = stockByProduct.get(pid);
      if (!stock || stock.available_stock < qty) {
        throw ApiError.conflict(`Insufficient stock for "${product.name}". Available: ${stock ? stock.available_stock : 0}, requested: ${qty}`);
      }
      // 4. Calculate subtotal using the CURRENT price; it is copied into order_items.price (snapshot)
      const price = Number(product.price);
      lines.push({ product_id: pid, quantity: qty, price, subtotal: round2(price * qty), stock });
    }

    // 5. Calculate total
    const total = round2(lines.reduce((s, l) => s + l.subtotal, 0));

    // Payment simulation (no real gateway)
    const paid = payment_method !== 'COD';
    if (paid && String(simulate_payment_failure) === 'true') {
      throw new ApiError(402, 'Payment failed (simulated). Order rolled back and stock was not changed.');
    }

    // 6. Create order
    const order = await Order.create({
      user_id: userId, order_number: generateOrderNumber(), total_amount: total,
      status: paid ? 'confirmed' : 'pending', shipping_address,
    }, { transaction: t });

    // 7. Create order_items
    await OrderItem.bulkCreate(lines.map((l) => ({
      order_id: order.id, product_id: l.product_id, quantity: l.quantity, price: l.price, subtotal: l.subtotal,
    })), { transaction: t });

    // 8. Reduce stock (UPDATE product_stock SET quantity = quantity - ? WHERE product_id = ?)
    for (const l of lines) {
      await l.stock.update({ quantity: l.stock.quantity - l.quantity }, { transaction: t });
    }

    // Business rule 8: order total must equal sum of items
    const [{ sum }] = await OrderItem.findAll({
      where: { order_id: order.id }, attributes: [[sequelize.fn('SUM', sequelize.col('subtotal')), 'sum']], raw: true, transaction: t,
    });
    if (round2(sum) !== total) throw new Error('Order total does not match items total');

    // 9. Create payment record (business rule 9: amount === order total)
    await Payment.create({
      order_id: order.id, payment_reference: generatePaymentRef(), amount: total, payment_method,
      payment_status: paid ? 'paid' : 'pending', paid_at: paid ? new Date() : null,
    }, { transaction: t });

    await t.commit(); // COMMIT
    return getOrderById(order.id);
  } catch (err) {
    await t.rollback(); // ROLLBACK - stock, order, items, payment all undone
    throw err;
  }
}

const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

async function updateStatus(orderId, newStatus, actor) {
  const t = await sequelize.transaction();
  try {
    // Lock the order row so two requests can't change the same order at once
    const order = await Order.findByPk(orderId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order) throw ApiError.notFound('Order not found');
    order.items = await OrderItem.findAll({ where: { order_id: order.id }, transaction: t });
    order.payment = await Payment.findOne({ where: { order_id: order.id }, transaction: t });

    const isAdmin = actor.role === 'admin';
    if (!isAdmin) {
      if (order.user_id !== actor.id) throw ApiError.notFound('Order not found'); // don't reveal others' orders
      if (newStatus !== 'cancelled') throw ApiError.forbidden('Customers can only cancel their own orders');
    }

    if (order.status === 'delivered' && newStatus === 'cancelled') throw ApiError.conflict('Delivered orders cannot be cancelled');
    if (order.status === 'cancelled') throw ApiError.conflict('Cancelled orders cannot be changed');
    if (!TRANSITIONS[order.status].includes(newStatus)) {
      throw ApiError.conflict(`Cannot change status from "${order.status}" to "${newStatus}"`);
    }

    if (newStatus === 'cancelled') {
      // Business rule 10: cancelled orders restore stock
      const ids = order.items.map((i) => i.product_id).sort((a, b) => a - b);
      const stocks = await ProductStock.findAll({ where: { product_id: ids }, order: [['product_id', 'ASC']], transaction: t, lock: t.LOCK.UPDATE });
      for (const item of order.items) {
        const s = stocks.find((x) => x.product_id === item.product_id);
        if (s) await s.update({ quantity: s.quantity + item.quantity }, { transaction: t });
      }
      if (order.payment) {
        await order.payment.update({ payment_status: order.payment.payment_status === 'paid' ? 'refunded' : 'failed' }, { transaction: t });
      }
    }

    if (newStatus === 'delivered' && order.payment && order.payment.payment_status === 'pending') {
      await order.payment.update({ payment_status: 'paid', paid_at: new Date() }, { transaction: t }); // COD collected
    }

    await order.update({ status: newStatus }, { transaction: t });
    await t.commit();
    return getOrderById(orderId);
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

module.exports = { createOrder, updateStatus, getOrderById, fullOrderInclude };
