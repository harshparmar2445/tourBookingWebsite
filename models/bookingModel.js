const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
                ref: 'Tour',
                required: [true, "Booking must belong to Tour!"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: [true, "Booking must belong to User!"]
    },
    price: {
        type: Number,
        required: [true, "Booking must have price!"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    paid: {
        type: Boolean,
        default: false
    }
})

bookingSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        select: 'name'
    });
    next();
 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;