'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER.UNSIGNED, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE',
      },
      order_number: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      total_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
        allowNull: false, defaultValue: 'pending',
      },
      shipping_address: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    }, { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    await queryInterface.sequelize.query('ALTER TABLE orders ADD CONSTRAINT chk_orders_total CHECK (total_amount >= 0)');
    await queryInterface.addIndex('orders', ['user_id'], { name: 'idx_orders_user' });
    await queryInterface.addIndex('orders', ['status'], { name: 'idx_orders_status' });
    await queryInterface.addIndex('orders', ['created_at'], { name: 'idx_orders_created_at' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('orders');
  },
};
