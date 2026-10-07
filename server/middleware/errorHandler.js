const notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });

// Central error handler: never leaks raw database errors to the client.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message;
  let errors = err.errors;

  switch (err.name) {
    case 'SequelizeUniqueConstraintError':
      status = 409;
      message = `Duplicate value: ${(err.errors || []).map((e) => e.path).join(', ')} already exists`;
      errors = undefined;
      break;
    case 'SequelizeValidationError':
      status = 400;
      message = 'Validation failed';
      errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
      break;
    case 'SequelizeForeignKeyConstraintError':
      status = 409;
      message = 'Operation violates a relationship (referenced or missing related record)';
      errors = undefined;
      break;
    default:
  }

  if (status >= 500 && !err.isOperational) {
    console.error('[ERROR]', err); // full detail only in server logs
    message = 'Internal server error';
    errors = undefined;
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  res.status(status).json(body);
};

module.exports = { notFound, errorHandler };
