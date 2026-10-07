const { sequelize, ProductStock, Product, Category } = require('../models');
const ApiError = require('../utils/ApiError');
const { success, asyncHandler } = require('../utils/response');

const include = [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'price', 'is_active'], include: [{ model: Category, as: 'category', attributes: ['name'] }] }];

exports.list = asyncHandler(async (req, res) => {
  const stock = await ProductStock.findAll({ include, order: [['product_id', 'ASC']] });
  return success(res, stock);
});

// SELECT ... FROM product_stock WHERE (quantity - reserved_quantity) <= reorder_level
exports.lowStock = asyncHandler(async (req, res) => {
  const stock = await ProductStock.findAll({
    where: sequelize.literal('(`ProductStock`.`quantity` - `ProductStock`.`reserved_quantity`) <= `ProductStock`.`reorder_level`'),
    include, order: [['quantity', 'ASC']],
  });
  return success(res, stock);
});

exports.update = asyncHandler(async (req, res) => {
  const { change, quantity, reorder_level } = req.body;
  const updated = await sequelize.transaction(async (t) => {
    const stock = await ProductStock.findOne({ where: { product_id: req.params.productId }, transaction: t, lock: t.LOCK.UPDATE });
    if (!stock) throw ApiError.notFound('Stock record not found');

    let newQty = stock.quantity;
    if (quantity !== undefined) newQty = quantity;            // absolute value
    if (change !== undefined) newQty = stock.quantity + change; // relative +/-
    if (newQty < 0) throw ApiError.badRequest('Stock cannot become negative');
    if (newQty < stock.reserved_quantity) throw ApiError.badRequest('Stock cannot be lower than reserved quantity');

    await stock.update({ quantity: newQty, ...(reorder_level !== undefined && { reorder_level }) }, { transaction: t });
    return stock;
  });
  return success(res, updated, 'Stock updated successfully');
});
