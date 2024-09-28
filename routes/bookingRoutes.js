const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authContrller = require('./../controllers/authController');

const router = express.Router();

router.use(authContrller.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authContrller.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
