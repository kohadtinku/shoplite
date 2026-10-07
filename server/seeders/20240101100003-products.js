'use strict';
const { products } = require('../utils/seedData');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('products', products.map((p) => ({
      id: p.id, category_id: p.category_id, name: p.name, description: p.description,
      price: p.price, sku: p.sku, image: p.image, is_active: p.is_active,
      created_at: now, updated_at: now,
    })));
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('products', null, {});
  },
};
