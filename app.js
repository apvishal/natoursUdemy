// first express js app with udemy

const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./Utils/AppError');
const globalErrorHandler = require('./controller/errorController');

// instance of express...
const app = express();

// app.use() enables you to use middleware functions...express.json is a middleware...
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === 'development') {
  console.log('using morgan for development mode');
  app.use(morgan('dev'));
}

// we can create our own middleware...
// NOTE: all middle ware functions have access to the REQ, RES, and NEXT parameters...
// NEXT refers to the next middle ware...
/*app.use((req, res, next) => {
  console.log('hello from middlware!');

  // we MUST call next(), or else we will be stuck here...
  next();
});
*/
// we can also manipulate the req body in middleware!...
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers.authorization);
  next();
});


//app.get('/api/v1/tours', getAllTours);
//app.post('/api/v1/tours', uploadTour);
//app.delete('/api/v1/tours/:id', deleteTour);
// patch for updating an item...
// put for uploading an entire new array or object...
//app.patch('/api/v1/tours/:id', updateTour);
// colon for variable args within the url...
// add '?' for optional args...
//app.get('/api/v1/tours/:id', getTour);

// if we put middle ware here, it will only be called when making a request from the
// routes BELOW this middlware, not above...
// this is because when the above routes are called, the send() function in each function
// actually end the req/res cycle...
/*app.use((req, res, next) => {
  console.log('hello from ANOTHER middleware!');
  next();
});
*/
// mount the routers to the above with the new paths specified...
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// middleware for all other urls that are not speciied above...
app.all('*', (req, res, next) => {
  // call next with an arguement (express assumes any next with an arg is an error, and will go move on until it finds the error handling middleware...

  // call the error handling middlware
  next(new AppError(`${req.originalUrl} is an invalid URL...`, 404));
});

// ERROR HANDLING MIDDLEWARE
// any middle ware that starts with err arg, express assumes it was an error...
app.use(globalErrorHandler);

module.exports = app;
