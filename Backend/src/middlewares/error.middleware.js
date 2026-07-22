import { ApiError } from "../utils/ApiError.js";

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = err.errors || [];

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid access token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Access token expired";
  }

  if (err.name === "SyntaxError" && err.status === 400 && "body" in err) {
    statusCode = 401;
    message = "Invalid JSON body";
  }

  if (err.name === "MulterError") {
    statusCode = 401;
    message = err.message;
  }

  if (err.code === "P2002") {
    statusCode = 409;
    message = "Duplicate field value";
  }

  if (err.code === "P2025") {
    statusCode = 404;
    message = "Resource not found";
  }

  return res.status(statusCode).json({
    statusCode,
    success: false,
    message,
    errors,
  });
};

export { errorHandler, notFound };
