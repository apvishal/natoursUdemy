const Tour = require ('./../model/tourModel');
const catchAsync = require ('./../Utils/catchAsync');
const AppError = require('./../Utils/AppError');

    
exports.getOverview = catchAsync( async (req, res) => {

    // get all of the tour data...
    const tours = await Tour.find();

    // render the page...
    res.status(200).render('overview', {
        tours,
        title: "All Tours"
    });
});

exports.getTour = catchAsync ( async (req, res, next) => {
    const tour = await Tour.findOne( { slug: req.params.slug } );

    if (!tour) {
        return next(new AppError('There is no tour with that name...', 404));
    }

    res.status(200).render('tour', {
        tour,
        title: tour.name
    });
});

exports.getLogin = (req, res) => {
    res.status(200).render('login', {
        title: 'Log in'
    });
};

exports.accountInfo= (req, res) => {
    res.status(200).render('account', {
        title: 'Account Overview'
    });
};