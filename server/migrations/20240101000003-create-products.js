'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      category_id: {
        type: Sequelize.INTEGER.UNSIGNED, allowNull: false,
        references: { model: 'categories', key: 'id' }, // FOREIGN KEY
        onDelete: 'RESTRICT', onUpdate: 'CASCADE',
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, // DECIMAL for money, never FLOAT
      sku: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      image: { type: Sequelize.STRING(255), allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    }, { engine: 'InnoDB', charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' });

    // CHECK constraint (enforced in MySQL 8.0.16+)
    await queryInterface.sequelize.query('ALTER TABLE products ADD CONSTRAINT chk_products_price CHECK (price > 0)');

    // INDEXES for common filters / sorts
    await queryInterface.addIndex('products', ['category_id'], { name: 'idx_products_category' });
    await queryInterface.addIndex('products', ['name'], { name: 'idx_products_name' });
    await queryInterface.addIndex('products', ['price'], { name: 'idx_products_price' });
    await queryInterface.addIndex('products', ['is_active'], { name: 'idx_products_active' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('products');
  },
};
