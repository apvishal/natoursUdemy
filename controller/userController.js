const AppError = require('./../Utils/AppError');
const catchAsync = require('./../Utils/catchAsync');
const User = require('./../model/userModel');

const filterObject = (obj, ...items) => {
  const filtered = {};
  Object.keys(obj).forEach(elem => {
    if (items.includes(elem)) {
      filtered[elem] = obj[elem];
    }
  });
  return filtered;
};
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({ data: { users } });
});
exports.createNewUser = (req, res) => {
  // placeholder...
  res.status(500).json({ status: 'error', message: 'not implemented!' });
};
exports.getUser = (req, res) => {
  // placeholder...
  res.status(500).json({ status: 'error', message: 'not implemented!' });
};
exports.updateUser = (req, res) => {
  // placeholder...
  res.status(500).json({ status: 'error', message: 'not implemented!' });
};
exports.deleteUser = (req, res) => {
  // placeholder...
  res.status(500).json({ status: 'error', message: 'not implemented!' });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // make sure the user doesnt specify any passwords in the body, this is only for updating the user data
  if (req.body.newPassword || req.body.newPasswordConfirm) {
    return next(
      new AppError(
        'This is for updating yur data only.  For passwords, please use updatePassword...',
        400
      )
    );
  }

  // filter out any items that are not allowed to be changed in this middleware...
  const filteredBody = filterObject(req.body, 'name', 'email');
  // find the user by id and update...
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

exports.deleteMe = async (req, res, next) => {
  // set the user's 'active' field to false..  we do not want to actually delete the user...
  // we have the user stored from the previous 'protect' middleware...
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(200).json({ status: 'success', data: null});
};
