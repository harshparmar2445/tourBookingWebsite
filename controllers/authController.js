const crypto = require('crypto');
const {promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Email = require("./../utils/email");
 
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN 
    });
}

const createSendToken = (user,statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    
    //remove the password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data: {
            user
        }
    });
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    const url = `${req.protocol}://${req.get("host")}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success'});
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  //2) varification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) check if user still exists
  const currntUser = await User.findById(decoded.id);
  if (!currntUser) {
    return next(
      new AppError('the User belonging to this token no longer existes', 401)
    );
  }
  //4) check if userchangedpassword after toekn was issued
  if (currntUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  //grant access to protected route
  req.user = currntUser;
  res.locals.user = currntUser
  next();
});

//only for renderd pages there will be no errors
exports.isLoggedIn = async (req, res, next) => {
  // 1) verify token
  if (req.cookies.jwt) {
    try {

      //2) varification of token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
  
      //3) check if user still exists
      const currntUser = await User.findById(decoded.id);
      if (!currntUser) {
        return next();
      }
      //4) check if userchangedpassword after toekn was issued
      if (currntUser.changePasswordAfter(decoded.iat)) {
        return next();
      }
      //THERE IS A LOGGED IN USER
      res.locals.user = currntUser
      return next();
    }catch(err) {
      return next();
    }
    }
  next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to access this route', 403));
        }
        next();
    } 
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1) get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('No user found with that email', 404));
    }
    //2) genrate randome token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    //3) send it ro users email
    try {
        const resetURL = `${req.protocol}://${req.get(
          'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status:'success',
            message: 'Token sent to email!'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending email. Try again later.', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) get user based on token
    const haeshdToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: haeshdToken,
      passwordResetTokenExpiration: { $gt: Date.now() },
    });

    //2) if token has not expired and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiration = undefined;
    await user.save();
    //3) update changedPasswordAt property for user in usermodel
    //4) log the use in, send JWT 
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1)get the user from collection
    const user = await User.findById(req.user.id).select("+password")

    //2) cheach if POSTed currnt password is correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Incorrect current password', 401));
    };

    //3) if yes update the password
    user.password = req.body.password;
    user.passwordConfirmation = req.body.passwordConfirmation;
    await user.save();
    //4)log the user in send JWT
    createSendToken(user, 200, res);
});