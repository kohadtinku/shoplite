-- =====================================================================
--  ShopLite  |  MySQL practice queries  (MySQL 8+)
--  Run:  mysql -u root -p shoplite < server/sql/practice-queries.sql
--  Or copy one query at a time into MySQL Workbench / the mysql shell.
--
--  TABLES:  users, categories, products, product_stock,
--           orders, order_items, payments
-- =====================================================================
USE shoplite;

-- =====================================================================
--  PART 1 - CORE QUERIES
-- =====================================================================

-- 01. TOTAL REVENUE  (aggregate: SUM + WHERE)
-- Adds up total_amount of delivered orders only. Cancelled/pending orders are not "earned" money.
SELECT SUM(total_amount) AS total_revenue
FROM orders
WHERE status = 'delivered';

-- 02. TOP 5 PRODUCTS BY SALES  (JOIN + GROUP BY + SUM + ORDER BY + LIMIT)
-- order_items has one row per product per order. Group them by product, add up the quantity,
-- sort the biggest first and keep 5 rows. Cancelled orders are excluded.
SELECT p.id, p.name,
       SUM(oi.quantity) AS units_sold,
       SUM(oi.subtotal) AS revenue
FROM order_items oi
INNER JOIN orders   o ON o.id = oi.order_id
INNER JOIN products p ON p.id = oi.product_id
WHERE o.status <> 'cancelled'
GROUP BY p.id, p.name
ORDER BY units_sold DESC
LIMIT 5;

-- 03. TOTAL ORDERS BY CUSTOMER  (INNER JOIN + GROUP BY + COUNT)
-- INNER JOIN keeps only customers who HAVE orders.
SELECT u.id, u.name, COUNT(o.id) AS total_orders
FROM users u
INNER JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name
ORDER BY total_orders DESC;

-- 04. REVENUE BY CATEGORY  (3-table JOIN + GROUP BY + SUM)
-- order_items -> products -> categories. We walk the foreign keys to reach the category name.
SELECT c.name AS category, SUM(oi.subtotal) AS revenue
FROM order_items oi
INNER JOIN orders     o ON o.id = oi.order_id
INNER JOIN products   p ON p.id = oi.product_id
INNER JOIN categories c ON c.id = p.category_id
WHERE o.status <> 'cancelled'
GROUP BY c.id, c.name
ORDER BY revenue DESC;

-- 05. PRODUCTS BELOW REORDER LEVEL  (WHERE with a computed column)
-- available_stock = quantity - reserved_quantity
SELECT p.id, p.name,
       s.quantity, s.reserved_quantity,
       (s.quantity - s.reserved_quantity) AS available_stock,
       s.reorder_level
FROM product_stock s
INNER JOIN products p ON p.id = s.product_id
WHERE s.quantity - s.reserved_quantity <= s.reorder_level
ORDER BY available_stock;

-- 06. AVERAGE ORDER VALUE  (AVG)
SELECT ROUND(AVG(total_amount), 2) AS avg_order_value
FROM orders
WHERE status <> 'cancelled';

-- 07. HIGHEST-VALUE CUSTOMER  (GROUP BY + ORDER BY + LIMIT 1)
SELECT u.id, u.name, SUM(o.total_amount) AS lifetime_value
FROM users u
INNER JOIN orders o ON o.user_id = u.id
WHERE o.status <> 'cancelled'
GROUP BY u.id, u.name
ORDER BY lifetime_value DESC
LIMIT 1;

-- 08. ORDERS IN THE CURRENT MONTH  (date functions)
-- YEAR()/MONTH() are easy to read. The second version is faster on big tables because it
-- can use the index on created_at (a "sargable" condition - no function wrapped around the column).
SELECT id, order_number, total_amount, status, created_at
FROM orders
WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE());

SELECT id, order_number, total_amount, status, created_at
FROM orders
WHERE created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
  AND created_at <  DATE_FORMAT(CURDATE(), '%Y-%m-01') + INTERVAL 1 MONTH;

-- 09. MONTHLY REVENUE  (YEAR + MONTH + GROUP BY)
SELECT YEAR(created_at)  AS year,
       MONTH(created_at) AS month,
       COUNT(*)          AS orders,
       SUM(total_amount) AS revenue
FROM orders
WHERE status <> 'cancelled'
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY year, month;

-- 10. CUSTOMERS WHO NEVER PLACED AN ORDER  (LEFT JOIN ... IS NULL)
-- LEFT JOIN keeps ALL users; users without orders get NULL in the order columns.
SELECT u.id, u.name, u.email
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.role = 'customer' AND o.id IS NULL;

-- 11. PRODUCTS NEVER ORDERED  (LEFT JOIN ... IS NULL)
SELECT p.id, p.name, p.price
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
WHERE oi.id IS NULL;

-- 12. SECOND-HIGHEST PRODUCT PRICE  (subquery)
-- Inner query finds the max; outer query finds the max among the prices BELOW it.
SELECT MAX(price) AS second_highest_price
FROM products
WHERE price < (SELECT MAX(price) FROM products);

-- 13. PRODUCTS PRICED ABOVE AVERAGE  (AVG + subquery)
SELECT id, name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products)
ORDER BY price DESC;

-- 14. REVENUE BY PAYMENT METHOD  (GROUP BY on an ENUM column)
SELECT payment_method, COUNT(*) AS payments, SUM(amount) AS total_paid
FROM payments
WHERE payment_status = 'paid'
GROUP BY payment_method
ORDER BY total_paid DESC;

-- 15. CANCELLED VS COMPLETED ORDERS  (CASE + COUNT + GROUP BY)
-- CASE is like if/else inside SQL. Here it buckets many statuses into three groups.
SELECT CASE
         WHEN status = 'delivered' THEN 'completed'
         WHEN status = 'cancelled' THEN 'cancelled'
         ELSE 'in progress'
       END AS order_group,
       COUNT(*) AS total
FROM orders
GROUP BY order_group;

-- 16. REPEAT BIG SPENDERS  (HAVING)
-- WHERE filters ROWS before grouping; HAVING filters GROUPS after aggregation.
SELECT u.name, COUNT(o.id) AS orders, SUM(o.total_amount) AS spent
FROM users u
INNER JOIN orders o ON o.user_id = u.id
WHERE o.status <> 'cancelled'
GROUP BY u.id, u.name
HAVING COUNT(o.id) >= 2 AND SUM(o.total_amount) > 10000;

-- 17. MIN / MAX / AVG PRICE PER CATEGORY  (aggregates per group)
SELECT c.name AS category,
       COUNT(p.id)          AS products,
       MIN(p.price)         AS cheapest,
       MAX(p.price)         AS most_expensive,
       ROUND(AVG(p.price),2) AS avg_price
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name;

-- 18. ORDER DETAILS  (4-table INNER JOIN)
SELECT o.order_number, u.name AS customer, p.name AS product,
       oi.quantity, oi.price AS price_at_purchase, oi.subtotal, o.status
FROM orders o
INNER JOIN users u        ON u.id = o.user_id
INNER JOIN order_items oi ON oi.order_id = o.id
INNER JOIN products p     ON p.id = oi.product_id
ORDER BY o.created_at DESC, o.id;

-- 19. PRICE SNAPSHOT CHECK  (order_items.price vs current products.price)
-- Shows why we copy the price: if a product price changes later, old orders stay correct.
SELECT oi.order_id, p.name, oi.price AS paid_price, p.price AS current_price,
       (p.price - oi.price) AS difference
FROM order_items oi
INNER JOIN products p ON p.id = oi.product_id;

-- 20. DATA-INTEGRITY CHECK: order total must equal the sum of its items (business rule 8)
-- Should return ZERO rows. Any row returned = corrupted data.
SELECT o.id, o.total_amount, SUM(oi.subtotal) AS items_total
FROM orders o
INNER JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.total_amount
HAVING o.total_amount <> SUM(oi.subtotal);

-- 21. DATA-INTEGRITY CHECK: payment amount must equal order total (business rule 9)
SELECT o.id, o.total_amount, pay.amount
FROM orders o
INNER JOIN payments pay ON pay.order_id = o.id
WHERE o.total_amount <> pay.amount;

-- 22. ORDERS FROM THE LAST 30 DAYS  (DATE_SUB / INTERVAL)
SELECT id, order_number, created_at, DATEDIFF(NOW(), created_at) AS days_ago
FROM orders
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY created_at DESC;

-- 23. ORDER STATUS DISTRIBUTION WITH PERCENTAGE  (subquery in SELECT)
SELECT status,
       COUNT(*) AS total,
       ROUND(COUNT(*) * 100 / (SELECT COUNT(*) FROM orders), 1) AS percentage
FROM orders
GROUP BY status
ORDER BY total DESC;

-- =====================================================================
--  PART 2 - ADVANCED QUERIES
-- =====================================================================

-- A1. SUBQUERY IN FROM (derived table): customers who spent MORE than the average customer
-- Step 1 (inner): total spend per customer.  Step 2 (outer): compare with the average of those totals.
SELECT t.name, t.spent
FROM (
  SELECT u.name, SUM(o.total_amount) AS spent
  FROM users u
  INNER JOIN orders o ON o.user_id = u.id
  WHERE o.status <> 'cancelled'
  GROUP BY u.id, u.name
) AS t
WHERE t.spent > (
  SELECT AVG(spent) FROM (
    SELECT SUM(total_amount) AS spent FROM orders WHERE status <> 'cancelled' GROUP BY user_id
  ) AS x
);

-- A2. CORRELATED SUBQUERY: products priced above THEIR OWN category's average
-- The inner query refers to p1.category_id from the outer query, so it re-runs for each outer row.
SELECT p1.id, p1.name, p1.price, p1.category_id
FROM products p1
WHERE p1.price > (
  SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id
)
ORDER BY p1.category_id, p1.price DESC;

-- A3. CTE + WINDOW FUNCTION (LAG): month-over-month revenue growth
-- WITH ... AS (...) defines a named temporary result (CTE) that reads like a step in a recipe.
-- LAG() looks at the previous row's value, ordered by month.
WITH monthly AS (
  SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, SUM(total_amount) AS revenue
  FROM orders
  WHERE status <> 'cancelled'
  GROUP BY DATE_FORMAT(created_at, '%Y-%m')
)
SELECT ym, revenue,
       LAG(revenue) OVER (ORDER BY ym) AS previous_month,
       ROUND((revenue - LAG(revenue) OVER (ORDER BY ym)) * 100 / LAG(revenue) OVER (ORDER BY ym), 1) AS growth_pct
FROM monthly;

-- A4. RANKING: best-selling products inside each category  (RANK + PARTITION BY)
-- PARTITION BY restarts the ranking for every category. RANK() gives ties the same rank.
WITH product_sales AS (
  SELECT p.id, p.name, c.name AS category, SUM(oi.subtotal) AS revenue
  FROM order_items oi
  INNER JOIN orders o     ON o.id = oi.order_id
  INNER JOIN products p   ON p.id = oi.product_id
  INNER JOIN categories c ON c.id = p.category_id
  WHERE o.status <> 'cancelled'
  GROUP BY p.id, p.name, c.name
)
SELECT category, name, revenue,
       RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rank_in_category
FROM product_sales
ORDER BY category, rank_in_category;

-- A5. RUNNING TOTAL OF REVENUE  (SUM() OVER)
SELECT id, order_number, DATE(created_at) AS order_date, total_amount,
       SUM(total_amount) OVER (ORDER BY created_at, id) AS running_revenue
FROM orders
WHERE status <> 'cancelled';

-- A6. LATEST ORDER PER CUSTOMER  (ROW_NUMBER)
-- ROW_NUMBER numbers each customer's orders newest-first; we keep number 1.
SELECT *
FROM (
  SELECT o.id, o.order_number, u.name AS customer, o.total_amount, o.created_at,
         ROW_NUMBER() OVER (PARTITION BY o.user_id ORDER BY o.created_at DESC) AS rn
  FROM orders o
  INNER JOIN users u ON u.id = o.user_id
) ranked
WHERE rn = 1;

-- A7. EXISTS: customers who bought something from the 'Books' category
-- EXISTS stops at the first match, so it is often faster than IN / JOIN + DISTINCT.
SELECT u.id, u.name
FROM users u
WHERE EXISTS (
  SELECT 1
  FROM orders o
  INNER JOIN order_items oi ON oi.order_id = o.id
  INNER JOIN products p     ON p.id = oi.product_id
  INNER JOIN categories c   ON c.id = p.category_id
  WHERE o.user_id = u.id AND c.name = 'Books'
);

-- A8. DENSE_RANK: top-3 most expensive products per category
SELECT * FROM (
  SELECT c.name AS category, p.name, p.price,
         DENSE_RANK() OVER (PARTITION BY p.category_id ORDER BY p.price DESC) AS price_rank
  FROM products p
  INNER JOIN categories c ON c.id = p.category_id
) t
WHERE price_rank <= 3;

-- =====================================================================
--  PART 3 - INDEXES & EXPLAIN
-- =====================================================================

-- Our migrations already created indexes on: products(category_id), products(name), products(price),
-- orders(user_id), orders(status), orders(created_at), order_items(order_id), order_items(product_id).
SHOW INDEX FROM orders;

-- EXPLAIN shows how MySQL will run a query. Look at the columns:
--   type = ref / range (good)   type = ALL (full table scan - bad on big tables)
--   key  = which index is used  rows = estimated rows examined
EXPLAIN SELECT * FROM orders WHERE user_id = 2;
EXPLAIN SELECT * FROM orders WHERE YEAR(created_at) = 2026;                 -- function on column: index NOT used
EXPLAIN SELECT * FROM orders WHERE created_at >= '2026-01-01';              -- sargable: index used
EXPLAIN SELECT * FROM products WHERE name LIKE 'Node%';                     -- prefix LIKE can use the index
EXPLAIN SELECT * FROM products WHERE name LIKE '%Node%';                    -- leading wildcard: full scan

-- Composite index example (try it): speeds up "orders of a customer by status, newest first"
-- CREATE INDEX idx_orders_user_status_created ON orders (user_id, status, created_at);
-- DROP INDEX idx_orders_user_status_created ON orders;

-- =====================================================================
--  PART 4 - TRANSACTION PRACTICE (run these manually in the mysql shell)
-- =====================================================================
-- START TRANSACTION;
--   UPDATE product_stock SET quantity = quantity - 3 WHERE product_id = 1;
--   SELECT product_id, quantity FROM product_stock WHERE product_id = 1;   -- see the change (only you)
-- ROLLBACK;                                                                -- undo it
-- SELECT product_id, quantity FROM product_stock WHERE product_id = 1;     -- back to the old value
--
-- Row locking (open two mysql windows):
--   Window 1:  START TRANSACTION; SELECT * FROM product_stock WHERE product_id = 1 FOR UPDATE;
--   Window 2:  UPDATE product_stock SET quantity = quantity - 1 WHERE product_id = 1;   -- WAITS until window 1 COMMITs
