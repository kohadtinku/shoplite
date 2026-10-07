'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_stock', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      product_id: {
        type: Sequelize.INTEGER.UNSIGNED, allowNull: false, unique: true, // UNIQUE FK => 1:1 relationship
        references: { model: 'products', key: 'id' },
        onDelete: 'CASCADE', onUpdate: 'CASCADE',
      },
      // UNSIGNED => the database itself refuses negative stock
      quantity: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      reserved_quantity: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      reorder_level: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 10 },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    }, { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    await queryInterface.sequelize.query(
      'ALTER TABLE product_stock ADD CONSTRAINT chk_stock_reserved CHECK (reserved_quantity <= quantity)'
    );
  },
  async down(queryInterface) {
    await queryInterface.dropTable('product_stock');
  },
};
