'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      order_id: {
        type: Sequelize.INTEGER.UNSIGNED, allowNull: false, unique: true, // UNIQUE FK => 1:1 with orders
        references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
      },
      payment_reference: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      payment_method: { type: Sequelize.ENUM('COD', 'UPI', 'CARD', 'NET_BANKING'), allowNull: false },
      payment_status: { type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'), allowNull: false, defaultValue: 'pending' },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    }, { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    await queryInterface.addIndex('payments', ['payment_status'], { name: 'idx_payments_status' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('payments');
  },
};
