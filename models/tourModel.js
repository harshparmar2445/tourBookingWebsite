const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const AppError = require('./../utils/appError');

const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'tour Name is required'],
      unique: true,
      maxlength: [40, "tour Name must be less than or equals 40 characters"],
      minlength: [10, "tour Name must be less than or equals 40 characters"]
      // validate: [validator.isAlpha, "tour Name must only contain charachters"]
    },
    slug: String,
    duration : {
      type: Number,
      required: [true, 'tour Duration is required']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Max Group Size is required']
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be either easy, medium, or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min:[1, "ratings Average should be greater than 1"],
      max:[5, "ratings Average should be less than or equal to 5"],
      set: val => {Math.round(val * 10) / 10}


    },
    ratingsQuantity:{
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'tour Price is required']
    },
    priceDiscount : {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price
        },
        message: 'Price discount ({VALUE}) should be less than tour price'
      }
    },
    summary:{
      type: String,
      trim: true,
      required: [true, 'tour summry is required']
    },
    description:{
      type: String,
      trim: true
    },
    imageCover:{
      type: String,
      // required: [true, 'tour imageCover is required']
    },
    images:{
      type: [String]
    },
    createdAt: { 
      type: Date,
      default: Date.now,
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //GeoJSON
      type:{
        type: String,
        default: "Point",
        enum:["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations:[
      {
      type:{
      type: String,
      default: "Point",
      enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
    ],
    guides: [
      { 
        type: mongoose.Schema.ObjectId, 
        ref: 'User' 
      }
    ]
  }, 
  
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
  
// tourSchema.index({price: 1}); 
tourSchema.index({ price: 1, ratingsAverage: -1 }); 
tourSchema.index({ slug: 1 }); 
tourSchema.index({ startLocation: '2dsphere'}); 

tourSchema.virtual("durationWeeks").get(function(){
    return this.duration/7;
});

//Virtual populate
tourSchema.virtual("reviews", {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//DOCUMENT MIDDELWARE: RUN BEFOE SAVE COMMAND AND CREATE COMMAND 
tourSchema.pre("save", function(next){
  this.slug = slugify(this.name, { lower: true });
  // if (this.priceDiscount >= this.price) {
  //   return next(new AppError('Price discount should be less than tour price', 400));
  // }
  next();
});

// tourSchema.pre( "save", async function(next){
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });


// // Update Middleware to handle priceDiscount validation
// tourSchema.pre('findOneAndUpdate', function(next) {
//   const update = this.getUpdate();
//   if (update.priceDiscount && update.priceDiscount >= update.price) {
//     return next(new AppError('Price discount should be less than tour price', 400));
//   }
//   next();
// });

// tourSchema.pre('updateOne', function(next) {
//   const update = this.getUpdate();
//   if (update.priceDiscount && update.priceDiscount >= update.price) {
//     return next(new AppError('Price discount should be less than tour price', 400));
//   }
//   next();
// });

// tourSchema.pre('updateMany', function(next) {
//   const update = this.getUpdate();
//   if (update.priceDiscount && update.priceDiscount >= update.price) {
//     return next(new AppError('Price discount should be less than tour price', 400));
//   }
//   next();
// });
// tourSchema.pre("save", function(next){
//   console.log("saving the document...");
//   next();
// });
// tourSchema.post("create", function(next){
//   console.log(`New Tour created: ${this.name}`);
//   next();
// });

//QUERY MIDDELWARE

tourSchema.pre(/^find/, function(next){
  this.find({ secretTour: {$ne: true} });
  this.start = new Date();
  next();
});

tourSchema.pre(/^find/, function(next){
  this.populate({
    path:"guides",
    select: "-__v -passwordChangedAt"
  })
  next(); 
});

// tourSchema.post(/^find/, function(docs, next){
//   //console.log(docs);
//   //console.log(`Query took: ${Date.now() - this.start} ms`);
//   next();
// });

//AGGREGATE MIDDLEWARE
// tourSchema.pre("aggregate", function(next){
//   this.pipeline().unshift({ $match: { secretTour: {$ne: true} } });
//   console.log(this);
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;