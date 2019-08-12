const express = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');
const router = express.Router();

// we can add middle ware here, which will only be added to the middle ware stack (starting from the
// middle ware items that are in app.js...) for the USERS route... (the route contained in this file...)
// this middle ware is for parameters, and will be fun when a certain parameter is found... for instance, id)

// router.param will get the normal middle ware arguments, PLUS the value of the paramter you specify, in this case: id
router.param('id', (req, res, next, val) => {
  console.log(`FOUND: ${val}`);
  // MUST ALWAYS CALL NEXT to call the next middle ware, or you will be stuck here
  next();
});
// now we will change these to use express.Router()...
// with Router() we can mount routers.  we will change the url paths
// to work with the new Routers()...

// with app.route, these are considered middle ware as well...

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:resetToken', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createNewUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
