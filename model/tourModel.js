const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

// create a new tour schema...
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'a name is required!'],
      unique: true,
      // BUILT-IN VALIDATORS...
      maxlength: [40, 'name must be less than or equal to 40 chars...'],
      minlength: [10, 'name must be atleast 10 chars...'],
      // validate: [ validator.isAlpha, 'Name must have chars only..']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'a duration is required']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a max group size is required...']
    },
    difficulty: {
      type: String,
      required: [true, 'a difficulty is required...'],
      enum: {
        values: ['difficult', 'medium', 'easy'],
        message: 'invalid difficuly type... (must be difficult, medium, or easy'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'minimum average is 1'],
      max: [5, 'maximum average is 5']
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'a price is required!']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // the problem with this approach is: 'this' will point to the current document when creating new items, 
          // NOT when updating old items...
          return val < this.price;
        },
        message: 'the price discount {VALUE} must be less than the price of this item...'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'a summary is required...']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'a cover image is required...']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secret: {
      type: Boolean,
      default: false
    }
  },
  {
    // these are the options...
    // when we display as a JSON, show the virtual properties (same for objects, as specified below...)
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  // we use function() instead of () => because we need access to 'this' keyword
  return this.duration / 7;
});

// add to the tourSchema a middleware BEFORE saving a document (using the .pre() with the save option...)
// NOTE this only works for .save() and .create(), not .insertMany()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function() {
//   console.log(this);
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc.slug);
//   next();
// });

// MIDDLEWARE FOR QUERIES...
tourSchema.pre(/find/, function(next) {
  // 'this' is our query object...
  // we can check how long it takes to run the operation...
  this.startTime = Date.now();

  this.find({ secret: { $ne: true } });
  next();
});

tourSchema.post(/find/, function(doc, next) {
  // console.log (doc);
  console.group(`elapsed time: ${Date.now() - this.startTime} milliseconds`);
  next();
});

// MIDDLEWARE FOR AGGREGATION
tourSchema.pre('aggregate', function(next) {
  // this points to the aggregation object...
  // unshift will append to the beginning of the array...
  this.pipeline().unshift({ $match: { secret: { $ne: true } } });

  console.log(this.pipeline());
  next();
});

// create a model using the schema created above... (first arg is a name of the mode, second is the schema we want to use...)
module.exports = mongoose.model('Tour', tourSchema);
