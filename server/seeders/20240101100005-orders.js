'use strict';
// Seeds orders + order_items + payments together (they depend on each other).
const { orders } = require('../utils/seedData');

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

module.exports = {
  async up(queryInterface) {
    const orderRows = [];
    const itemRows = [];
    const paymentRows = [];

    orders.forEach((o) => {
      const created = daysAgo(o.daysAgo);
      orderRows.push({
        id: o.id, user_id: o.user_id,
        order_number: `SL-SEED-${String(o.id).padStart(4, '0')}`,
        total_amount: o.total, status: o.status,
        shipping_address: '12 MG Road, Sangli, Maharashtra 416416',
        created_at: created, updated_at: created,
      });
      o.items.forEach((i) => itemRows.push({
        order_id: o.id, product_id: i.product_id, quantity: i.quantity,
        price: i.price, subtotal: i.subtotal, created_at: created,
      }));
      paymentRows.push({
        order_id: o.id, payment_reference: `PAY-SEED-${String(o.id).padStart(4, '0')}`,
        amount: o.total, payment_method: o.method, payment_status: o.pay,
        paid_at: o.pay === 'paid' || o.pay === 'refunded' ? created : null,
        created_at: created,
      });
    });

    await queryInterface.bulkInsert('orders', orderRows);
    await queryInterface.bulkInsert('order_items', itemRows);
    await queryInterface.bulkInsert('payments', paymentRows);
  },
  async down(queryInterface) {
    // children first (FK order)
    await queryInterface.bulkDelete('payments', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
  },
};
