const catchAsync = require('./../Utils/catchAsync');
const AppError = require('./../Utils/AppError');
const APIFeatures = require('./../Utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`no document with id ${req.params.id} exists...`, 404)
      );
    }
    // status code will be 204 for deletion...
    res
      .status(204)
      .json({ status: 'success', data: { deleted: req.params.id * 1 } });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      // run the validators defined in the Tour model...
      runValidators: true
    });
    if (!doc) {
      return next(
        new AppError(`no document with id ${req.params.id} exists...`, 404)
      );
    }
    res.status(200).json({ status: 'success', data: doc });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    // display the request body...
    //console.log(req.body);

    // use create to create an instance AND save to data base at once...
    // returns a promise...
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc
    });
  });

  exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    // findById is the same as findOne({_id: req.params.id})
    // const tour = await Tour.findById(req.params.id).populate('reviews');

    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(`no document with id ${req.params.id} exists...`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

  exports.getAll = Model => catchAsync(async (req, res, next) => {
    // query will have everything after '?' in the URL...
    console.log(req.query);

    // get all for a single tour...
    let filter = {};
    if (req.params.tourID) filter = { tour: req.params.tourID };  // hack, but simple enough to just work...
  
    // allocate instance of the APIFeatures class...essentially, this is BUILDING THE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // EXECUTING THE QUERY
    // const doc = await features.query.explain();
    const doc = await features.query;
  
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { doc }
    });
  });