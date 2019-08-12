const Tour = require('./../model/tourModel');
const APIFeatures = require('./../Utils/apiFeatures');
const catchAsync = require('./../Utils/catchAsync');
const AppError = require('./../Utils/AppError');

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

exports.getAllTours = catchAsync(async (req, res, next) => {
  // query will have everything after '?' in the URL...
  console.log(req.query);

  // allocate instance of the APIFeatures class...essentially, this is BUILDING THE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // EXECUTING THE QUERY
  const tourResults = await features.query;

  res.status(200).json({
    status: 'success',
    results: tourResults.length,
    data: { tours: tourResults }
  });
});

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
exports.uploadTour = catchAsync(async (req, res, next) => {
  // display the request body...
  //console.log(req.body);

  // use create to create an instance AND save to data base at once...
  // returns a promise...
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});
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

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(
      new AppError(`no such tour with id ${req.params.id} exists...`, 404)
    );
  }
  // status code will be 204 for deletion...
  res
    .status(204)
    .json({ status: 'success', data: { deleted: req.params.id * 1 } });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    // run the validators defined in the Tour model...
    runValidators: true
  });
  if (!newTour) {
    return next(
      new AppError(`so such tour with id ${req.params.id} exists...`, 404)
    );
  }
  res.status(200).json({ status: 'success', data: { tour: newTour } });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // findById is the same as findOne({_id: req.params.id})
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(
      new AppError(`no such tour with id ${req.params.id} exists...`, 404)
    );
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

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
