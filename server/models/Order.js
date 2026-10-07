module.exports = (sequelize, DataTypes) =>
  sequelize.define('Order', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    order_number: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    total_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
      allowNull: false, defaultValue: 'pending',
    },
    shipping_address: { type: DataTypes.TEXT, allowNull: false },
  }, { tableName: 'orders', createdAt: 'created_at', updatedAt: 'updated_at' });
