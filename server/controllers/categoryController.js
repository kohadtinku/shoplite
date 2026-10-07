const { Category, Product, sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const { success, asyncHandler } = require('../utils/response');

exports.list = asyncHandler(async (req, res) => {
  // LEFT JOIN + COUNT per category:
  // SELECT c.*, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON p.category_id=c.id GROUP BY c.id
  const categories = await Category.findAll({
    attributes: { include: [[sequelize.fn('COUNT', sequelize.col('products.id')), 'product_count']] },
    include: [{ model: Product, as: 'products', attributes: [], required: false }],
    group: ['Category.id'], order: [['name', 'ASC']],
  });
  return success(res, categories);
});

exports.getOne = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  return success(res, category);
});

exports.create = asyncHandler(async (req, res) => {
  const category = await Category.create({ name: req.body.name, description: req.body.description });
  return success(res, category, 'Category created successfully', 201);
});

exports.update = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  await category.update({ name: req.body.name, description: req.body.description });
  return success(res, category, 'Category updated successfully');
});

exports.remove = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  const count = await Product.count({ where: { category_id: category.id } });
  if (count > 0) throw ApiError.conflict(`Cannot delete: ${count} product(s) belong to this category`); // FK RESTRICT, friendly message
  await category.destroy();
  return success(res, null, 'Category deleted successfully');
});
