const Course = require("../models/courseModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.enrollInCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user.id; // Assuming you have auth middleware setting req.user

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  // Check if user is already enrolled
  const isEnrolled = course.studentsEnrolled.includes(userId);
  if (isEnrolled) {
    return res.status(400).json({
      status: "fail",
      message: "You are already enrolled in this course",
    });
  }

  // Update course and user documents
  await Promise.all([
    Course.findByIdAndUpdate(
      courseId,
      { $push: { studentsEnrolled: userId } },
      { new: true }
    ),
    User.findByIdAndUpdate(
      userId,
      { $push: { enrolledCourses: courseId } },
      { new: true }
    ),
  ]);

  res.status(200).json({
    status: "success",
    message: "Successfully enrolled in the course",
  });
});

// Optional: Get enrolled courses for current user
exports.getEnrolledCourses = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).populate("enrolledCourses");

  res.status(200).json({
    status: "success",
    data: {
      courses: user.enrolledCourses,
    },
  });
});
