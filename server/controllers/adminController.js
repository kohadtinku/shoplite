const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');
const { success, asyncHandler } = require('../utils/response');

const q = (sql, replacements) => sequelize.query(sql, { type: QueryTypes.SELECT, replacements });

/* Dashboard: written in RAW SQL on purpose so you can see exactly what MySQL runs. */
exports.dashboard = asyncHandler(async (req, res) => {
  const [kpis] = await q(`
    SELECT
      (SELECT COUNT(*) FROM users)                                              AS total_users,
      (SELECT COUNT(*) FROM products)                                           AS total_products,
      (SELECT COUNT(*) FROM orders)                                             AS total_orders,
      (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'delivered') AS total_revenue,
      (SELECT COUNT(*) FROM orders WHERE status = 'pending')                    AS pending_orders,
      (SELECT COUNT(*) FROM product_stock WHERE quantity - reserved_quantity <= reorder_level) AS low_stock_products
  `);

  const recentOrders = await q(`
    SELECT o.id, o.order_number, u.name AS customer, o.total_amount, o.status, o.created_at
    FROM orders o
    INNER JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
    LIMIT 5
  `);

  const lowStock = await q(`
    SELECT p.id AS product_id, p.name AS product, (s.quantity - s.reserved_quantity) AS current_stock, s.reorder_level
    FROM product_stock s
    INNER JOIN products p ON p.id = s.product_id
    WHERE s.quantity - s.reserved_quantity <= s.reorder_level
    ORDER BY current_stock ASC
  `);

  return success(res, { kpis, recentOrders, lowStock });
});

exports.reports = asyncHandler(async (req, res) => {
  // Top 5 products by units sold (JOIN + GROUP BY + SUM + ORDER BY + LIMIT)
  const topProducts = await q(`
    SELECT p.id, p.name, SUM(oi.quantity) AS units_sold, SUM(oi.subtotal) AS revenue
    FROM order_items oi
    INNER JOIN orders o   ON o.id = oi.order_id
    INNER JOIN products p ON p.id = oi.product_id
    WHERE o.status <> 'cancelled'
    GROUP BY p.id, p.name
    ORDER BY units_sold DESC
    LIMIT 5
  `);

  // Revenue by category
  const revenueByCategory = await q(`
    SELECT c.name AS category, SUM(oi.subtotal) AS revenue
    FROM order_items oi
    INNER JOIN orders o     ON o.id = oi.order_id
    INNER JOIN products p   ON p.id = oi.product_id
    INNER JOIN categories c ON c.id = p.category_id
    WHERE o.status <> 'cancelled'
    GROUP BY c.id, c.name
    ORDER BY revenue DESC
  `);

  // Monthly revenue (YEAR/MONTH date functions)
  const monthlyRevenue = await q(`
    SELECT YEAR(created_at) AS year, MONTH(created_at) AS month, COUNT(*) AS orders, SUM(total_amount) AS revenue
    FROM orders
    WHERE status <> 'cancelled'
    GROUP BY YEAR(created_at), MONTH(created_at)
    ORDER BY year, month
  `);

  // Orders by status (CASE-free GROUP BY)
  const ordersByStatus = await q(`SELECT status, COUNT(*) AS total FROM orders GROUP BY status`);

  return success(res, { topProducts, revenueByCategory, monthlyRevenue, ordersByStatus });
});
