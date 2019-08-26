const express = require('express');
const reviewController = require('./../controller/reviewController');
const authController = require('./../controller/authController');
// merge params so we can get the tour ID from the previous router...
const router = express.Router({ mergeParams: true });

// must be logged in for anything related to reviews...
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIDs,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.restrictTo('user','admin'),reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
