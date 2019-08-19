const mongoose = require('mongoose');
const Review = require('./../model/reviewModel');
const catchAsync = require('./../Utils/catchAsync');
const AppError = require('./../Utils/AppError');
const factory = require('./handlerFactory');

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.tourID) filter = { tour: req.params.tourID };

//   const reviews = await Review.find(filter);
//   res
//     .status(200)
//     .json({ status: 'success', data: { length: reviews.length, reviews } });
// });


exports.setTourUserIDs = (req, res, next) => {
  // allow nested routing... if these values done exist, grab them from the request parameters
  if (!req.body.tour) req.body.tour = req.params.tourID;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// exports.createReview = catchAsync(async (req, res, next) => {
//   const newReview = await Review.create(req.body);
//   res.status(201).json({ status: 'success', data: { newReview } });
// });

exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
