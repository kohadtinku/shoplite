// Used by sequelize-cli (migrations / seeders) AND by config/database.js.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // shoplite/.env
require('dotenv').config(); // fallback: server/.env

const base = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'shoplite',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  // DECIMAL columns come back as JS numbers instead of strings
  // Cloud MySQL (Aiven, TiDB...) needs SSL: set DB_SSL=true
  dialectOptions: {
    decimalNumbers: true,
    ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: false } }),
  },
  define: { freezeTableName: true },
};

module.exports = { development: base, test: base, production: base };
