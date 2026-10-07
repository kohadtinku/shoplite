// Consistent API response format
const success = (res, data = null, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const getPagination = (query, defaultLimit = 10) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaultLimit, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
};

const buildPagination = (page, limit, total) => ({
  page, limit, total, totalPages: Math.ceil(total / limit) || 1,
});

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

module.exports = { success, asyncHandler, getPagination, buildPagination, round2 };
