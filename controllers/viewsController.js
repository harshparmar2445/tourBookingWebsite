const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');


exports.getOverview = catchAsync(async (req, res, next) => {
  //1) get tour data from collectiion
  const tours = await Tour.find();
  //2) build the template
  //3) render the template with the data from 1)

  res.status(200).render('overview', {
    title: 'all tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1)get data from the DB by given slug (inclusing reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  if(!tour){
    return next(new AppError('There is no tour with that name.', 404))
  }

  //2) build template
  //3) render the template with the data from 1)

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});


exports.getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'Log in' });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', { title: 'Your account' });
}

exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  //2) Find tours with returned ids
  const tourIds = bookings.map((booking) => booking.tour);
  const tours = await Tour.find({ _id: { $in: tourIds } });
  //3) Render the template
  res.status(200).render('overview', { title: 'My tours', tours });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    { new: true, runValidators: true }
  );
  res
    .status(200)
    .render('account', { title: 'Your account', user: updatedUser });
});