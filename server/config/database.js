const { Sequelize } = require('sequelize');
const configs = require('./config');

const env = process.env.NODE_ENV || 'development';
const { database, username, password, ...options } = configs[env];

// One shared Sequelize instance = one connection pool for the whole app.
const sequelize = new Sequelize(database, username, password, {
  ...options,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

module.exports = sequelize;
