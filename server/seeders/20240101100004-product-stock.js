'use strict';
const { products } = require('../utils/seedData');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('product_stock', products.map((p) => ({
      product_id: p.id,
      quantity: p.quantity,
      reserved_quantity: p.quantity > 20 ? 2 : 0,
      reorder_level: p.reorder_level,
      updated_at: now,
    })));
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('product_stock', null, {});
  },
};
