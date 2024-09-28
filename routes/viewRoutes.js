const express = require('express');
const viewsContorller = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsContorller.getOverview
);

router.get('/tour/:slug', authController.isLoggedIn, viewsContorller.getTour);
router.get('/login', authController.isLoggedIn, viewsContorller.getLoginForm);
router.get('/me', authController.protect, viewsContorller.getAccount);
router.get('/my-tours', authController.protect, viewsContorller.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsContorller.updateUserData
);

module.exports = router;
