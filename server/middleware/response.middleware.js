// middleware/response.middleware.js (ES Modules version)

/**
 * Response middleware to standardize API responses
 *
 * Adds the following methods to the response object:
 * - res.success(data, message, statusCode)
 * - res.error(message, statusCode, errors)
 */
export const responseMiddleware = (req, res, next) => {
  // Success response method
  res.success = function (data = null, message = "Success", statusCode = 200) {
    return this.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  };

  // Error response method
  res.error = function (
    message = "Error occurred",
    statusCode = 500,
    errors = null
  ) {
    return this.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  };

  next();
};

// Error handler middleware that uses the res.error method
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  const errors = err.errors || null;

  return res.error(message, statusCode, errors);
};

// Custom error class for API errors
export class ApiError extends Error {
  constructor(message, statusCode = 400, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
