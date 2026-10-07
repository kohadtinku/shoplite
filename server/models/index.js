const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User')(sequelize, DataTypes);
const Category = require('./Category')(sequelize, DataTypes);
const Product = require('./Product')(sequelize, DataTypes);
const ProductStock = require('./ProductStock')(sequelize, DataTypes);
const Order = require('./Order')(sequelize, DataTypes);
const OrderItem = require('./OrderItem')(sequelize, DataTypes);
const Payment = require('./Payment')(sequelize, DataTypes);

/*
 * ASSOCIATIONS
 *  hasMany / hasOne  -> FK lives on the OTHER table (the "many" / child side)
 *  belongsTo         -> FK lives on THIS table
 * Always define both directions so you can include() from either side.
 *
 *  onDelete RESTRICT : block deleting a parent that still has children
 *  onDelete CASCADE  : delete the children together with the parent
 *  onUpdate CASCADE  : if a parent PK changes, update the child FK
 */

// User 1 --- N Orders
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category 1 --- N Products
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Product 1 --- 1 ProductStock
Product.hasOne(ProductStock, { foreignKey: 'product_id', as: 'stock', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
ProductStock.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Order 1 --- N OrderItems
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Product 1 --- N OrderItems  (RESTRICT: a product that was ever sold cannot be hard-deleted)
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Order 1 --- 1 Payment
Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

module.exports = { sequelize, User, Category, Product, ProductStock, Order, OrderItem, Payment };
