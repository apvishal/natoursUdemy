const mongoose = require('mongoose');
const Review = require('./../model/reviewModel');
const catchAsync = require('./../Utils/catchAsync');
const AppError = require ('./../Utils/AppError');

exports.getAllReviews = catchAsync(async (req,res,next) => {
    const reviews = await Review.find();
    res.status(200).json({status: 'success', data: {length: reviews.length, reviews}});
});

exports.createReview = catchAsync(async (req,res,next) => {
    // allow nested routing... if these values done exist, grab them from the request parameters
    if (!req.body.tour) req.body.tour = req.params.tourID;
    if (!req.body.user) req.body.user = req.user._id;
    
    const newReview = await Review.create(req.body);
    res.status(201).json({status: 'success', data: { newReview}});
});

exports.getReviews = catchAsync(async (req,res,next) => {
    const review = await Review.findById(req.params.id);
    res.status(200).json({status: 'success', data: {review}});
});