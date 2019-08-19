const express = require('express');
const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');
// merge params so we can get the tour ID from the previous router...
const router = express.Router({mergeParams: true});

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
