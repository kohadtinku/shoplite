module.exports = (sequelize, DataTypes) =>
  sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, validate: { min: 1 } },
    // PRICE SNAPSHOT: copied from products.price at purchase time. Never read the live price for old orders.
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  }, { tableName: 'order_items', createdAt: 'created_at', updatedAt: false });
