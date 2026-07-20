const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    statusCode,
    success: false,
    message: err.message || "Internal server error",
    errors: err.errors || [],
  });
};

export { errorHandler };
