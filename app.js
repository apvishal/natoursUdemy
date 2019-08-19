// first express js app with udemy

const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./Utils/AppError');
const globalErrorHandler = require('./controller/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongooseSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');

// instance of express...
const app = express();

// set the security headers...
app.use(helmet());

// app.use() enables you to use middleware functions...express.json is a middleware...
// these are body parsers...
app.use(express.json({ limit: '10kb' }));

// data sanitize against query injections... such as (email: {$gt: ""})
app.use(mongooseSanitize()); // calls a function and returns a function...  this will filter out all operators used by mongodb ( $ . )

app.use(xssClean()); // cleans any user input from html with javascript code... it will convert html symbols...
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuanitity',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
); // prevent parameter pollution...

// whjitout whitelist if we had: ?sort=duration&sort=price)  it will only use the last sort...

// to serve static files...
app.use(express.static(`${__dirname}/public`));

// use for debugging in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('using morgan for development mode');
  app.use(morgan('dev'));
}

// limit the number of requests from the same IP
const limter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests!  try again in an hour...'
});

// use it on /api...
app.use('/api', limter);

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
// example of a middleware
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
app.use('/api/v1/reviews', reviewRouter);

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
