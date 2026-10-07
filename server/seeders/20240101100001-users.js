'use strict';
const bcrypt = require('bcrypt');
const { users } = require('../utils/seedData');

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const rows = await Promise.all(users.map(async (u) => ({
      id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role,
      password: await bcrypt.hash(u.plain, 10), // hashed, never stored as plain text
      created_at: now, updated_at: now,
    })));
    await queryInterface.bulkInsert('users', rows);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
