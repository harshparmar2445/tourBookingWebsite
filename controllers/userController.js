const multer = require("multer");
const sharp = require("sharp");
const User = require('./../models/userModel');
const catchAsync = require("./../utils/catchAsync");
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');


// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public/img/users");
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     },
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith("image")){
        cb(null, true);
    } else {
        cb(new AppError("Not an image! Please upload image only.", 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single("photo")

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
    const nweObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) nweObj[el] = obj[el];
    });
    return nweObj;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.createUser = (req, res) => {
    res.status(500).json({
        staus: 'error',
        message: 'this route is not yet defined...! please use signUp instead!',
    });
};

exports.updateMe = catchAsync(async(req, res, next) => {
    //1) create erroe if user POSTed password data
    if (req. body.password || req.body.passwordConfirm) {
        return next(new Error('Password update is not allowed, please use a separate route for that.', 400));
    }

    //2) filter out unwanted fields from request body
    const filterdBody = filterObj(req.body, "name", "email");
    if (req.file) filterdBody.photo = req.file.filename;
    //3) update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
        status:'success',
        message: 'User data updated successfully',
        data: {
            user: updatedUser
        }
    });
});

exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false});
    res.status(204).json({
        status:'success',
        message: 'User deleted successfully',
        data: null
    });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

//DO NOT UPDATE PASSWORD WITH THIS!
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

