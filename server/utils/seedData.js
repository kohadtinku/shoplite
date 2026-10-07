// Shared sample data used by seeders (kept outside /seeders so sequelize-cli doesn't run it as a seeder).
const categories = [
  { id: 1, name: 'Electronics', description: 'Phones, laptops and gadgets' },
  { id: 2, name: 'Fashion', description: 'Clothing, footwear and accessories' },
  { id: 3, name: 'Home & Kitchen', description: 'Appliances and home essentials' },
  { id: 4, name: 'Books', description: 'Technical books and novels' },
  { id: 5, name: 'Sports', description: 'Fitness and outdoor gear' },
];

// [id, category_id, name, price, sku, quantity, reorder_level, is_active]
const products = [
  [1, 1, 'iPhone 15 128GB', 69999, 'ELE-IPH-15', 25, 5, true],
  [2, 1, 'Samsung Galaxy S24', 59999, 'ELE-SAM-S24', 18, 5, true],
  [3, 1, 'Sony WH-1000XM5 Headphones', 26999, 'ELE-SNY-XM5', 4, 5, true],   // low stock
  [4, 1, 'Dell Inspiron 15 Laptop', 54999, 'ELE-DEL-INS15', 12, 3, true],
  [5, 2, 'Levi\'s 511 Slim Jeans', 2999, 'FAS-LEV-511', 80, 15, true],
  [6, 2, 'Nike Air Max Sneakers', 8999, 'FAS-NIK-AM', 9, 10, true],          // low stock
  [7, 2, 'Allen Solly Formal Shirt', 1799, 'FAS-ALS-SH', 60, 10, true],
  [8, 2, 'Fastrack Analog Watch', 2499, 'FAS-FST-WT', 30, 8, true],
  [9, 3, 'Prestige Induction Cooktop', 3499, 'HOM-PRS-IC', 40, 10, true],
  [10, 3, 'Philips Air Fryer', 7999, 'HOM-PHL-AF', 22, 6, true],
  [11, 3, 'Milton Thermosteel Bottle', 799, 'HOM-MLT-BT', 150, 25, true],
  [12, 3, 'Bajaj Mixer Grinder', 4299, 'HOM-BJJ-MG', 3, 8, true],             // low stock
  [13, 4, 'Learning MySQL (Book)', 899, 'BOK-MYSQL', 70, 10, true],
  [14, 4, 'Node.js Design Patterns', 1299, 'BOK-NODE', 45, 10, true],
  [15, 4, 'Clean Code', 999, 'BOK-CLEAN', 55, 10, true],
  [16, 4, 'The Pragmatic Programmer', 1099, 'BOK-PRAG', 35, 10, true],
  [17, 5, 'Yonex Badminton Racket', 3299, 'SPT-YNX-RK', 28, 8, true],
  [18, 5, 'Boldfit Yoga Mat', 599, 'SPT-BLD-YM', 120, 20, true],
  [19, 5, 'Cosco Football Size 5', 999, 'SPT-CSC-FB', 7, 10, true],           // low stock
  [20, 5, 'Discontinued Cricket Bat', 4999, 'SPT-OLD-CB', 0, 5, false],        // inactive
].map(([id, category_id, name, price, sku, quantity, reorder_level, is_active]) => ({
  id, category_id, name, price, sku, quantity, reorder_level, is_active,
  description: `${name} - quality product from ShopLite.`,
  image: null,
}));

const priceOf = (id) => products.find((p) => p.id === id).price;

// users: 1 admin, 2 customers with orders, 1 customer without orders
const users = [
  { id: 1, name: 'Admin User', email: 'admin@shoplite.com', plain: 'Admin@123', phone: '9000000001', role: 'admin' },
  { id: 2, name: 'Rahul Patil', email: 'rahul@shoplite.com', plain: 'Customer@123', phone: '9000000002', role: 'customer' },
  { id: 3, name: 'Priya Deshmukh', email: 'priya@shoplite.com', plain: 'Customer@123', phone: '9000000003', role: 'customer' },
  { id: 4, name: 'Amit Kulkarni', email: 'amit@shoplite.com', plain: 'Customer@123', phone: '9000000004', role: 'customer' }, // never orders
];

// daysAgo spreads orders across several months so monthly reports look interesting
const orders = [
  { id: 1, user_id: 2, status: 'delivered', daysAgo: 75, items: [[1, 1], [5, 2]], method: 'UPI', pay: 'paid' },
  { id: 2, user_id: 2, status: 'delivered', daysAgo: 50, items: [[2, 1]], method: 'CARD', pay: 'paid' },
  { id: 3, user_id: 3, status: 'delivered', daysAgo: 40, items: [[9, 2], [13, 1]], method: 'COD', pay: 'paid' },
  { id: 4, user_id: 3, status: 'pending', daysAgo: 3, items: [[6, 1]], method: 'COD', pay: 'pending' },
  { id: 5, user_id: 2, status: 'cancelled', daysAgo: 20, items: [[3, 1]], method: 'UPI', pay: 'refunded' },
  { id: 6, user_id: 3, status: 'shipped', daysAgo: 6, items: [[14, 3]], method: 'NET_BANKING', pay: 'paid' },
  { id: 7, user_id: 2, status: 'processing', daysAgo: 2, items: [[17, 2], [10, 1]], method: 'CARD', pay: 'paid' },
  { id: 8, user_id: 3, status: 'delivered', daysAgo: 12, items: [[15, 2], [16, 1], [18, 2]], method: 'UPI', pay: 'paid' },
].map((o) => {
  const items = o.items.map(([product_id, quantity]) => {
    const price = priceOf(product_id);
    return { product_id, quantity, price, subtotal: price * quantity };
  });
  return { ...o, items, total: items.reduce((s, i) => s + i.subtotal, 0) };
});

module.exports = { categories, products, users, orders };
