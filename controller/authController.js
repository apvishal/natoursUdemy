const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('./../Utils/AppError');
const User = require('./../model/userModel');
const catchAsync = require('./../Utils/catchAsync');
const sendEmail = require('./../Utils/email');
const crypto = require('crypto');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_DURATION
  });
};

const createAndSendToken = (user, statusCode, res) => {
  res.status(statusCode).json({
    status: 'success',
    token: signToken(user._id),
    data: { user }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // const createdUser = await User.create(req.body);
  const createdUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt, // THIS IS ONLY TEMPORARY...,
    role: req.body.role
  });

  // create a jwt
  createAndSendToken(createdUser, 201, res);
  // const token = signToken(createdUser._id);
  // res.status(201).json({ status: 'success', token, data: { createdUser } });
});

exports.login = catchAsync(async (req, res, next) => {
  // make sure an email and pw was provided...
  const { email, password } = req.body;
  if (!email || !password) {
    // one was missing...
    return next(new AppErr('Please provide an email and password!', 400));
  }
  // check if email and pw exists...
  const user = await User.findOne({ email: email }).select('+password');

  // check for valid email (user) and password
  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    // invalid email or password...
    // 401 is unauthroized...
    return next(new AppError('invalid email or password', 401));
  }

  // all is ok, so create the token
  createAndSendToken(user, 200, res);

  // const token = signToken(user._id);
  // // send the status and token to the client
  // res.status(200).json({ status: 'success', data: { token } });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // we have a header with a bearer...
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // we have no token...
    return next(
      new AppError(
        'you are not logged in! Must be logged in for access...',
        401
      )
    );
  }
  // we have a valid token...
  // debug
  // console.log("TOKEN", token);

  // verify if the token is valid, we need to promisify it
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // make sure the user was not deleted while the token is still valid...
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The user for this token no longer exists...', 401)
    );

  // check if user changed password...
  if (currentUser.isChangedPassword(decoded.iat))
    return next(
      new AppError('The user password has changed!  Please log in again!', 401)
    );

  // save the currentUser for future use...
  req.user = currentUser;

  // grant access...
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role))
      return next(
        new AppError('you are not authorized to perform this action!', 401)
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // check if the email exists in the database...
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('A user with this email does not exist...', 404));

  // create resetToken, save the user passwordresettoken (performed in the method below...)
  const resetToken = user.createPasswordResetToken();
  console.log('FROM AUTH', resetToken);
  await user.save({ validateBeforeSave: false });

  try {
    // create and send email to the user to reset the password...
    await sendEmail({
      to: 'someTestEmail@thisIsSoAwesome',
      subject: 'you have requested to reset your password',
      text: `This email is sent because you requested to reset your password, click on the following link to proceed:
    \n\t${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetpassword/${resetToken}\nIf you did not request a 
    password reset, disregard this email!`
    });

    res.status(200).json({ message: 'Email Sent' });
  } catch (err) {
    console.log(err.stack);

    // reset the tokens to undefined...
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiration = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'there was a problem sending the email, try again later',
        500
      )
    );
  }
});

exports.resetPassword = async (req, res, next) => {
  // look for the user by the reset token...
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  console.log({ resetToken });

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetTokenExpiration: { $gt: Date.now() }
  });
  // check if user was found...
  if (!user) return next(new AppError('Invalid or Expired token', 400));

  // set the password and passwordConfirm
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiration = undefined;
  // save the user, we want to run the validators to check out password confirmations...
  await user.save();

  // // grant a token and send the response...
  // const token = signToken(user._id);
  // send the status and token to the client
  // res.status(200).json({ status: 'success', data: { token } });
  createAndSendToken(user, 200, res);
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collections...
  const user = await User.findById(req.user._id).select('+password');
  // check if POSTed password is correct...
  if (
    !(await user.isCorrectPassword(req.body.currentPassword, user.password))
  ) {
    // the current password is incorrect
    return next(new AppError('Current Password is incorrect...', 401));
  }

  // correct currentPassword, now update password with new requested password...
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  // validate before saving...
  await user.save();

  // log user in, send token
  // grant a token and send the response...
  // const token = signToken(user._id);
  // send the status and token to the client
  // res.status(200).json({ status: 'success', data: { token } });
  createAndSendToken(user, 200, res);
});
