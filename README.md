# ShopLite — Simple E-Commerce Management System

A small, interview-ready **React + Express + MySQL** project built to **learn MySQL practically**:
relational design, constraints, joins, aggregates, transactions, Sequelize ORM (models, associations,
migrations, seeders), JWT auth and REST APIs.

> New here? Read **[docs/LEARNING_GUIDE.md](docs/LEARNING_GUIDE.md)** — it walks through the project in 8 phases
> (What / Why / MySQL concept / Sequelize concept / Code / SQL equivalent / Interview questions).

## Features
- Register / login with **JWT + bcrypt**, role-based access (`customer`, `admin`)
- Categories, products (search, filter, sort, pagination), stock management with low-stock alerts
- Orders created inside a **MySQL transaction** (stock check → order → items → stock reduction → payment, all-or-nothing)
- Price snapshot in `order_items.price`, cancel restores stock, simulated payments
- Admin dashboard (KPIs, recent orders, low stock, reports written in raw SQL)
- 30+ annotated MySQL practice queries (joins, GROUP BY/HAVING, subqueries, CTE, window functions, EXPLAIN)

## Tech stack
| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, JavaScript, MUI, Axios, React Router |
| Backend | Node.js, Express, express-validator, JWT, bcrypt, dotenv, cors, nodemon |
| Database | MySQL 8+, Sequelize ORM + sequelize-cli |

## Architecture
```
React (Vite :5173) --/api--> Express (:5000) --> Sequelize --> MySQL
                              routes -> middleware (auth, validators) -> controllers -> services -> models
```
```
shoplite/
├── client/            React app (pages, layouts, context, services, routes)
├── server/
│   ├── config/        config.js (CLI + app settings), database.js (Sequelize instance)
│   ├── models/        7 models + index.js (associations)
│   ├── migrations/    7 migrations (schema, constraints, indexes)
│   ├── seeders/       users, categories, products, stock, orders+items+payments
│   ├── controllers/   request handlers
│   ├── services/      orderService.js  <- the transaction logic
│   ├── middleware/    auth, validators, errorHandler
│   ├── routes/        Express routers
│   ├── sql/           practice-queries.sql
│   └── utils/         ApiError, response helpers, JWT helpers, seed data
├── docs/LEARNING_GUIDE.md
├── .env.example
└── README.md
```

## Database design (ER diagram)
```mermaid
erDiagram
    USERS      ||--o{ ORDERS      : places
    CATEGORIES ||--o{ PRODUCTS    : contains
    PRODUCTS   ||--|| PRODUCT_STOCK : has
    ORDERS     ||--o{ ORDER_ITEMS : includes
    PRODUCTS   ||--o{ ORDER_ITEMS : "sold as"
    ORDERS     ||--|| PAYMENTS    : "paid by"

    USERS { int id PK  string email UK  string password  enum role }
    CATEGORIES { int id PK  string name UK }
    PRODUCTS { int id PK  int category_id FK  decimal price  string sku UK  bool is_active }
    PRODUCT_STOCK { int id PK  int product_id FK_UK  int quantity  int reserved_quantity  int reorder_level }
    ORDERS { int id PK  int user_id FK  string order_number UK  decimal total_amount  enum status }
    ORDER_ITEMS { int id PK  int order_id FK  int product_id FK  int quantity  decimal price  decimal subtotal }
    PAYMENTS { int id PK  int order_id FK_UK  string payment_reference UK  decimal amount  enum payment_status }
```

### Relationships (Sequelize)
| Relationship | Definition | FK rule |
|---|---|---|
| User 1—N Order | `User.hasMany(Order)` / `Order.belongsTo(User)` | RESTRICT |
| Category 1—N Product | `Category.hasMany(Product)` | RESTRICT |
| Product 1—1 ProductStock | `Product.hasOne(ProductStock)` | CASCADE |
| Order 1—N OrderItem | `Order.hasMany(OrderItem)` | CASCADE |
| Product 1—N OrderItem | `Product.hasMany(OrderItem)` | RESTRICT |
| Order 1—1 Payment | `Order.hasOne(Payment)` | CASCADE |

## Installation

### 1. Prerequisites
Node.js 18+, MySQL 8+ (8.0.16+ so `CHECK` constraints are enforced).

### 2. MySQL setup
```sql
CREATE DATABASE shoplite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
(or `cd server && npx sequelize-cli db:create`)

### 3. Environment variables
```bash
cp .env.example .env      # then edit DB_PASSWORD and JWT_SECRET
```
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shoplite
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d
DB_LOGGING=false     # true = print every SQL statement Sequelize runs
```

### 4. Install, migrate, seed, run
```bash
cd server
npm install
npx sequelize-cli db:migrate        # create all tables
npx sequelize-cli db:seed:all       # load sample data
npm run dev                         # API on http://localhost:5000

# new terminal
cd client
npm install
npm run dev                         # UI on http://localhost:5173
```

### Migration & seeder commands
```bash
npx sequelize-cli db:migrate                 # apply pending migrations
npx sequelize-cli db:migrate:status          # which migrations ran
npx sequelize-cli db:migrate:undo            # revert the LAST migration (runs its down())
npx sequelize-cli db:migrate:undo:all        # revert everything
npx sequelize-cli db:seed:all                # run all seeders
npx sequelize-cli db:seed:undo:all           # remove seeded data
npm run db:reset                             # undo all + migrate + seed (fresh start)
```

### Demo accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@shoplite.com | Admin@123 |
| Customer | rahul@shoplite.com | Customer@123 |
| Customer | priya@shoplite.com | Customer@123 |
| Customer (no orders) | amit@shoplite.com | Customer@123 |

## API documentation
All responses: `{ "success": true, "message": "...", "data": ... }` or `{ "success": false, "message": "...", "errors": [] }`.
Send the token as `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | /api/auth/register | public | creates a `customer` |
| POST | /api/auth/login | public | returns `{ user, token }` |
| GET | /api/auth/me | user | |
| GET | /api/users | admin | `?search=&role=&page=&limit=` |
| PUT | /api/users/me | user | update name / phone |
| GET | /api/categories, /api/categories/:id | public | list includes `product_count` |
| POST / PUT / DELETE | /api/categories(/:id) | admin | delete blocked if products exist |
| GET | /api/products | public | `page, limit, search, category_id, min_price, max_price, sort(id\|name\|price\|created_at), order(ASC\|DESC)` |
| GET | /api/products/:id | public | |
| POST / PUT / DELETE | /api/products(/:id) | admin | create also creates the stock row; delete = soft delete if ever ordered |
| GET | /api/stock, /api/stock/low-stock | admin | |
| PUT | /api/stock/:productId | admin | `{ change: +/-n }` and/or `{ quantity }`, `{ reorder_level }` |
| POST | /api/orders | user | transactional order creation |
| GET | /api/orders | user/admin | customer = own orders, admin = all; `?status=&page=&limit=` |
| GET | /api/orders/:id | owner/admin | |
| PUT | /api/orders/:id/status | admin (customer may only cancel own) | |
| GET | /api/payments | admin | |
| POST | /api/payments/:orderId/pay | owner/admin | `{ amount }` must equal order total |
| GET | /api/admin/dashboard | admin | KPIs, recent orders, low stock |
| GET | /api/admin/reports | admin | top products, revenue by category, monthly revenue |

### Sample requests
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"rahul@shoplite.com","password":"Customer@123"}'

# Products: page 1, category 1, most expensive first
curl "http://localhost:5000/api/products?page=1&limit=10&category_id=1&sort=price&order=DESC"

# Place an order (prices are NEVER sent by the client)
curl -X POST http://localhost:5000/api/orders -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":13,"quantity":2}],"shipping_address":"12 MG Road, Sangli","payment_method":"UPI"}'

# Demonstrate ROLLBACK: payment "fails" -> order, items and stock change are all undone
curl -X POST http://localhost:5000/api/orders -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"items":[{"product_id":13,"quantity":2}],"shipping_address":"12 MG Road","payment_method":"CARD","simulate_payment_failure":true}'

# Admin: add 20 units to product 3
curl -X PUT http://localhost:5000/api/stock/3 -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" -d '{"change":20}'
```

### Business rules implemented
Inactive products can't be ordered · quantity ≤ available stock · stock never negative (validation **and** `UNSIGNED` column) ·
unique SKU / category name / email / order number · order total = sum of items (verified inside the transaction) ·
payment amount = order total · cancelling restores stock · delivered orders can't be cancelled ·
only admin manages products/categories/stock · customers see only their own orders · admins see all.

## SQL practice queries
`server/sql/practice-queries.sql` — 23 core + 8 advanced queries (CTE, window functions, correlated subqueries, EXISTS) +
index/EXPLAIN exercises + manual transaction/locking practice. Every query is commented in plain language.
```bash
mysql -u root -p shoplite < server/sql/practice-queries.sql
```

## Screenshots
_Add your own screenshots here (`docs/screenshots/`): login, products, cart/checkout, orders, admin dashboard, stock._

## Future improvements
Real payment gateway (Razorpay/Stripe) · product image upload · refresh tokens · order-status email notifications ·
reserved_quantity workflow for unpaid orders · automated tests (Jest + Supertest) · Docker Compose · Swagger docs ·
full-text search index · soft-deleted users · rate limiting & Helmet.
