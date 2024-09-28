const express = require('express');
const reviewController = require("./../controllers/reviewController");
const authContrller = require("./../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(authContrller.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authContrller.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authContrller.restrictTo('user', 'admin'), reviewController.updateReview)
  .delete(authContrller.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;