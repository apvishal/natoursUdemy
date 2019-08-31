const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const catchAsync = require('./../Utils/catchAsync');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    lowercase: true, // converts the string to a lowercase automatically...
    validate: [validator.isEmail, 'please provide a valid email...']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'guide-lead', 'guide'],
    default: 'user'
  },
  active: {
    type: Boolean,
    select: false,
    default: true
  },
  password: {
    type: String,
    required: [true, 'a password is required'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'must confirm password!'],
    validate: {
      validator: function(elem) {
        return elem === this.password;
      },
      message: 'passwords do not match!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpiration: Date
});

// // middleware before saving to the database...
// userSchema.pre('save', async function(next) {
//   // check if the massword was modified first...
//   if (!this.isModified('password')) return next();

//   // we want to encrypt the password before saving it to the database...
//   this.password = await bcrypt.hash(this.password, 12);
//   // we dont need to actually store the passwordConfirm...
//   this.passwordConfirm = undefined;
//   next();
// });

// // when we change our password...
// userSchema.pre('save', function() {
//   // move to next middleware if the password was not modified or if this is a new document...
//   if (!this.isModified('password') || this.isNew) next();

//   // the password was changed, and this is not a new document...
//   this.passwordChangedAt = Date.now() - 1000; // hack because sometimes saving to the database takes longer than granting a jsonwebtoken (which happens after this middleware is performed...)

//   next();
// });

userSchema.pre(/^find/, function() {
  this.find({ active: { $ne: false } });
});

// add a method to the schema, which is assessible outside of here as well...
userSchema.methods.isCorrectPassword = async (candidate, pw) => {
  // return true or false, .compare will return a promise, so use await...
  return await bcrypt.compare(candidate, pw);
};

// check if the password has changed since the last logon...
userSchema.methods.isChangedPassword = function(tokenTimeStamp) {
  // check if passwordChangedAt exists... (it only exists if the user has ever changed the password in the past...)
  if (this.passwordChangedAt) {
    const changedPWTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // the user has changed the password before...
    if (tokenTimeStamp < changedPWTimeStamp) {
      console.log(tokenTimeStamp, changedPWTimeStamp);
      return true;
    }
  }

  // the password was never changed...
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  // create a token using crypto
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpiration = Date.now() + 10 * 60 * 1000; // 600 seconds, convert to milliseconds...
  console.log(
    { resetToken },
    this.passwordResetToken,
    this.passwordResetTokenExpiration
  );
  return resetToken;
};
// create a model from the schema
const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
