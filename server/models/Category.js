module.exports = (sequelize, DataTypes) =>
  sequelize.define('Category', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  }, { tableName: 'categories', createdAt: 'created_at', updatedAt: 'updated_at' });
