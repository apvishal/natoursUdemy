const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'you must type your review']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user']
    }
  },
  {
    // these are the options...
    // when we display as a JSON, show the virtual properties (same for objects, as specified below...)
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// create an index so that a pair with user and review must be unique
// this makes it do that a user can not make more than one review for the same tour...
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function(tourID) {
  // use aggregation to calculate the average of all the ratings...
  const stats = await this.aggregate([
    {
      $match: { tour: tourID }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // console.log(stats);

  if (stats.length > 0) {
    // update the tour (with the id stored in tourID) with the new average rating...
    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourID, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5 // 4.5 is the default when there are 0 reviews...
    });
  }
};
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});

// this is how we would run a middleware for findByIdAndUpdate or findByIdAndDelete...
// we must use both the pre and post middle ware like the following...
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // use find one to get and store the current review...
  this.r = await this.findOne();
  // console.log(this.r);
  // go on to the next middleware
  next();
});
reviewSchema.post(/^findOneAnd/, async function() {
  // this.findOne will not work, because this is a POST middleware, and we will not have access to the current review already since it has already been executed...
  // thats why we what this.r from the pre middleware above...
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: '-guides name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});
const reviewModel = mongoose.model('Review', reviewSchema);

module.exports = reviewModel;
