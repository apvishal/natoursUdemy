class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.statusCode = code;
    this.status = `${code}`.startsWith('4') ? 'Failure' : 'Error';
    this.isOperationalError = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
