const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const reviewController = require('./../controller/reviewController');
const reviewRouter = require('./reviewRoutes');
const router = express.Router();

// implemenetd and exported a function to validate the ID, it will be used as
// middle ware to validate IDs before actually reaching the function for processing request...
// if invalid id, middleware will return back to client...
// router.param('id', tourController.validateID);

// now we will change these to use express.Router()...
// with Router() we can mount routers.  we will change the url paths
// to work with the new Routers()...

// with app.route, these are considered middle ware as well...

// example of an alias...
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route('/tour-stats').get(tourController.getTourStats);
// for just /api/v1/tours
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.uploadTour);

// when an ID is specified...
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'guide-lead'),
    tourController.deleteTour
  );
  
router.use('/:tourID/reviews', reviewRouter);

// export the module
module.exports = router;