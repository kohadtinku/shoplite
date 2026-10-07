module.exports = (sequelize, DataTypes) =>
  sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
    payment_reference: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    payment_method: { type: DataTypes.ENUM('COD', 'UPI', 'CARD', 'NET_BANKING'), allowNull: false },
    payment_status: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), allowNull: false, defaultValue: 'pending' },
    paid_at: { type: DataTypes.DATE, allowNull: true },
  }, { tableName: 'payments', createdAt: 'created_at', updatedAt: false });
