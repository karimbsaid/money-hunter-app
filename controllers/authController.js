const User = require("../models/userModel");
const { promisify } = require("util");
const Course = require("../models/courseModel");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const catchAsync = require("./../utils/catchAsync");
const { use } = require("../app");
const AppError = require("../utils/appError");
// exports.hashPassword = async (req, res, next) => {
//   req.body.password = await bcrypt.hash(req.body.password, 10);
//   req.body.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);
//   next();
// };

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }
  if (!token) return next(new AppError("please login to get access on", 401));

  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
  const freshUser = await User.findById(decoded.id);
  const isPasswordChangedAfterJwt = freshUser.changePasswordAfter(decoded.iat);
  if (isPasswordChangedAfterJwt) {
    return next(new AppError("user recently changed password", 401));
  }
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError("you are not autorized to perform this action", 403));
    }
    next();
  };
};

exports.signin = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  console.log(name);

  const user = await User.create(req.body);
  const token = generateToken(user._id);
  res.status(201).json({
    info: "success",
    data: {
      token,
    },
  });
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("please provide email and password", 400));
  // Explicitly select password because it's excluded by default
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // If password is correct, proceed with login
  const token = generateToken(user._id);

  res.status(200).json({ message: "Login successful", token });
});
exports.restrictToCourseOwner = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId || req.params.id);

  if (!course) {
    return next(new AppError("No course found with that ID", 404));
  }

  // Allow if user is admin or is the course creator
  if (req.user.role === "admin" || course.teacher.toString() === req.user.id) {
    req.course = course; // Attach course to request for potential future use
    return next();
  }

  return next(
    new AppError("You do not have permission to perform this action", 403)
  );
});
