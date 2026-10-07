module.exports = (sequelize, DataTypes) =>
  sequelize.define('ProductStock', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    reserved_quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    reorder_level: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 10 },
    // available_stock = quantity - reserved_quantity (computed in JS, not stored)
    available_stock: {
      type: DataTypes.VIRTUAL,
      get() { return Number(this.getDataValue('quantity')) - Number(this.getDataValue('reserved_quantity')); },
    },
  }, { tableName: 'product_stock', createdAt: false, updatedAt: 'updated_at' });
