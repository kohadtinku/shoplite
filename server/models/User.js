module.exports = (sequelize, DataTypes) =>
  sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING(255), allowNull: false }, // bcrypt hash, never plain text
    phone: { type: DataTypes.STRING(20), allowNull: true },
    role: { type: DataTypes.ENUM('customer', 'admin'), allowNull: false, defaultValue: 'customer' },
  }, {
    tableName: 'users',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // By default the password hash is NOT selected. Use User.scope('withPassword') for login.
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: { withPassword: {} },
  });
