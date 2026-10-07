'use strict';
const { categories } = require('../utils/seedData');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('categories', categories.map((c) => ({ ...c, created_at: now, updated_at: now })));
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
  },
};
