const { Op } = require('sequelize');
const { sequelize, Product, Category, ProductStock, OrderItem } = require('../models');
const ApiError = require('../utils/ApiError');
const { success, asyncHandler, getPagination, buildPagination } = require('../utils/response');

const SORTABLE = ['id', 'name', 'price', 'created_at'];
const productInclude = [
  { model: Category, as: 'category', attributes: ['id', 'name'] },
  { model: ProductStock, as: 'stock', attributes: ['quantity', 'reserved_quantity', 'reorder_level', 'available_stock'] },
];

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const { search, category_id, min_price, max_price } = req.query;
  const sort = SORTABLE.includes(req.query.sort) ? req.query.sort : 'created_at';
  const order = String(req.query.order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const where = {};
  // Customers/guests only see active products. Admin can see all.
  if (!(req.user && req.user.role === 'admin' && req.query.include_inactive === 'true')) where.is_active = true;
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
      { sku: { [Op.like]: `%${search}%` } },
    ];
  }
  if (category_id) where.category_id = Number(category_id);
  if (min_price || max_price) {
    where.price = {};
    if (min_price) where.price[Op.gte] = Number(min_price);
    if (max_price) where.price[Op.lte] = Number(max_price);
  }

  // SELECT p.*, c.name FROM products p JOIN categories c ... WHERE ... ORDER BY price DESC LIMIT 10 OFFSET 0
  const { rows, count } = await Product.findAndCountAll({
    where, include: productInclude, order: [[sort, order], ['id', 'ASC']], limit, offset,
  });
  return success(res, { products: rows, pagination: buildPagination(page, limit, count) });
});

exports.getOne = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id, { include: productInclude });
  if (!product || (!product.is_active && !(req.user && req.user.role === 'admin'))) throw ApiError.notFound('Product not found');
  return success(res, product);
});

exports.create = asyncHandler(async (req, res) => {
  const { category_id, name, description, price, sku, image, is_active, initial_stock = 0, reorder_level = 10 } = req.body;
  const category = await Category.findByPk(category_id);
  if (!category) throw ApiError.badRequest('Category does not exist');

  // Product + its stock row are created together in ONE transaction (managed transaction: auto commit/rollback)
  const product = await sequelize.transaction(async (t) => {
    const p = await Product.create({ category_id, name, description, price, sku, image, is_active }, { transaction: t });
    await ProductStock.create({ product_id: p.id, quantity: initial_stock, reserved_quantity: 0, reorder_level }, { transaction: t });
    return p;
  });
  const full = await Product.findByPk(product.id, { include: productInclude });
  return success(res, full, 'Product created successfully', 201);
});

exports.update = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  const fields = ['category_id', 'name', 'description', 'price', 'sku', 'image', 'is_active'];
  const updates = {};
  fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (updates.category_id && !(await Category.findByPk(updates.category_id))) throw ApiError.badRequest('Category does not exist');
  // NOTE: changing price never changes old order_items.price (price snapshot)
  await product.update(updates);
  const full = await Product.findByPk(product.id, { include: productInclude });
  return success(res, full, 'Product updated successfully');
});

exports.remove = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  const sold = await OrderItem.count({ where: { product_id: product.id } });
  if (sold > 0) {
    // History must be preserved -> soft delete (deactivate) instead of DELETE
    await product.update({ is_active: false });
    return success(res, null, 'Product has order history, so it was deactivated instead of deleted');
  }
  await product.destroy(); // product_stock row removed automatically (ON DELETE CASCADE)
  return success(res, null, 'Product deleted successfully');
});
