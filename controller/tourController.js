const Tour = require('./../model/tourModel');
const APIFeatures = require('./../Utils/apiFeatures');
const catchAsync = require('./../Utils/catchAsync');
const AppError = require('./../Utils/AppError');
const factory = require('./handlerFactory');

// callback functions...

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      // must use the same variables created in the object above...
      $sort: { avgPrice: 1 }
    },
    {
      $match: { _id: { $ne: 'EASY' } }
    }
  ]);
  res.status(200).json({ status: 'success', data: { stats } });
});

exports.aliasTopTours = (req, res, next) => {
  // modify the request body so that the next middle ware can use it when
  // querying the db
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = '5'; // because we only want the top 5...
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // query will have everything after '?' in the URL...
//   console.log(req.query);

//   // allocate instance of the APIFeatures class...essentially, this is BUILDING THE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   // EXECUTING THE QUERY
//   const tourResults = await features.query;

//   res.status(200).json({
//     status: 'success',
//     results: tourResults.length,
//     data: { tours: tourResults }
//   });
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   // display the request body...
//   //console.log(req.body);
//   // use create to create an instance AND save to data base at once...
//   // returns a promise...
//   const newTour = await Tour.create(req.body);

//   if (!newTour) {
//     return next(new Error('no such tour exists...', 404));
//   }
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// });

// try without a try/catch block...
// exports.uploadTour = catchAsync(async (req, res, next) => {
//   // display the request body...
//   //console.log(req.body);

//   // use create to create an instance AND save to data base at once...
//   // returns a promise...
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// });

exports.uploadTour = factory.createOne(Tour);

// exports.uploadTour = async (req, res) => {
//   // display the request body...
//   //console.log(req.body);

//   try {
//     // use create to create an instance AND save to data base at once...
//     // returns a promise...
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour
//       }
//     });
//   } catch (err) {
//     console.log(err);

//     res.status(400).json({
//       status: 'failure',
//       dbMessage: err,
//       message: 'invalid data!'
//     });
//   }
// };

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(
//       new AppError(`no such tour with id ${req.params.id} exists...`, 404)
//     );
//   }
//   // status code will be 204 for deletion...
//   res
//     .status(204)
//     .json({ status: 'success', data: { deleted: req.params.id * 1 } });
// });


exports.updateTour = factory.updateOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     // run the validators defined in the Tour model...
//     runValidators: true
//   });
//   if (!newTour) {
//     return next(
//       new AppError(`so such tour with id ${req.params.id} exists...`, 404)
//     );
//   }
//   res.status(200).json({ status: 'success', data: { tour: newTour } });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // findById is the same as findOne({_id: req.params.id})
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(
//       new AppError(`no such tour with id ${req.params.id} exists...`, 404)
//     );
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// });

exports.getTour = factory.getOne(Tour, {path: 'reviews'});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTours: -1 }
    }
  ]);
  res.status(200).json({ status: 'success', data: { plan } });
});


exports.toursWithin = catchAsync(async (req, res, next) => {
  // console.log(`*****${req.params}*****`);
  // res.status(201).json({
  //   body: req.params
  // });

  // get the params
  const {distance, latlon, unit} = req.params;

  const [lat, lon] = latlon.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  console.log(`${lat} ${lon} ${radius} ${distance}`);

  if (!lat || !lon) {
    next(new AppError("need to provide a lat and long as a comma separated string...", 400));
  }

  // find the tour within the range specified by the user
  const tours = await Tour.find( { startLocation: { $geoWithin: { $centerSphere: [[lon, lat], radius] } } } );

  if (tours) {
    res.status(201).json({
      status: 'success',
      numTours: tours.length,
      data: {
        tourList: tours
      }
    });
  }
});

exports.getDistances = catchAsync(async (req,res,next) => {
  console.log(req.params);

  // parse the data
  const {center, unit} = req.params;
  const [lat, lon] = center.split(',');

  // error checking on lat and lon...
  if (!lat || !lon) {
    // the lat lon is not corectly provided...
    next (new AppError('latlon must be a comma separated string...', 400));
  }
  // need to add a multipler to convert from kilometers to mi...
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // need to update the mi multiplier...

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lon * 1, lat * 1] // * 1 to convert it to a number...
        },
        spherical: true,
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {     // populate means only show these fields...
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      info: distances
    }
  });

});