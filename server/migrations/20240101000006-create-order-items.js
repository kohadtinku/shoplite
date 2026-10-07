'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_items', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      order_id: {
        type: Sequelize.INTEGER.UNSIGNED, allowNull: false,
        references: { model: 'orders', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
      },
      product_id: {
        type: Sequelize.INTEGER.UNSIGNED, allowNull: false,
        references: { model: 'products', key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE',
      },
      quantity: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },    // snapshot of products.price
      subtotal: { type: Sequelize.DECIMAL(12, 2), allowNull: false }, // quantity * price
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    }, { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    await queryInterface.sequelize.query('ALTER TABLE order_items ADD CONSTRAINT chk_items_qty CHECK (quantity > 0)');
    await queryInterface.addIndex('order_items', ['order_id'], { name: 'idx_items_order' });
    await queryInterface.addIndex('order_items', ['product_id'], { name: 'idx_items_product' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('order_items');
  },
};
