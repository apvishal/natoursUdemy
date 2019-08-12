const AppError = require('./../Utils/AppError');

const handleCastErrorDB = (error) => {
  // error code 400 for bad request..
  return new AppError(`Invalid ${error.path} : ${error.value}`, 400);
};

const handleDupliateFieldErrorDB = (error) => {
  const originalValue = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  return new AppError(`${originalValue} already exists in the database`, 400);
};

const handleValidationErrorDB = (error) => {
  return new AppError(`Invalid Data: ${Object.values(error.errors).map(elem => elem.message).join('. ')}`,400);
};
const sendErrorDev = (err, res) => {
  res
    .status(err.statusCode)
    .json({ status: err.status, error: err, message: err.message, stack: err.stack });
};

const handleJWTError = () => {
  return new AppError('You are not logged in, please log in!', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your session expired, please log in again!', 401);
};
const sendErrorProd = (err, res) => {
  if (err.isOperationalError) {
    // this is a trusted error, and one that we can send to the client...
    res.status(err.statusCode).json({ status: err.status, message: err.message });
  } else {
    // this is a progamming or unknown error, we dont want the client to see this...
    // debug for now...
    console.log ('ERROR:', err);
    res.status(500).json({status: 'error', message: 'something went very wrong!'});
  }
};

module.exports = (err, req, res, next) => {
  // error handling middleware...
  // debug
  console.log('GLOBAL ERROR HANDLER');
  err.statusCode = err.statusCode || 500; // 500 is an internal server error...
  err.status = err.status || 'err';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDupliateFieldErrorDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
