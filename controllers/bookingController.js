const stripe = require('stripe')(process.env.STRIPE_SECRETE_KEY);
const Tour = require('./../models/tourModel');
const Booking = require("./../models/bookingModel");
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const { listenerCount } = require('../models/userModel');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour ID from the request parameters
    const tour = await Tour.findById(req.params.tourId);
    // Debugging: Log the tour object
    // console.log('Tour Data:', tour);
    console.log(req.user); // To check if the user is defined
    console.log(req.params); // To check if the params are correct
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',  // Add this line to specify the mode
        
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,

        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [//me
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                    },
                    unit_amount: tour.price * 100, // Price in cents
                },
                quantity: 1
            }
        ]
    });

     // Debugging: Log the session object to check if line_items are correctly created
     console.log('Stripe Session:', session);

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {

    //this is for testing purpose only
    const { tour, user, price } = req.query;
    
    if(!tour && !user && !price) {
        return next();
    }

    await Booking.create({
        tour: tour,
        user: user,
        price: price
    })

    res.redirect(req.originalUrl.split("?")[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);