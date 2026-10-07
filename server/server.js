const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connection established');
    app.listen(PORT, () => console.log(`ShopLite API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Unable to connect to the database:', err.message);
    process.exit(1);
  }
})();
