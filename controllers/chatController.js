const Message = require("../models/messageModel");
const Course = require("../models/courseModel");
const catchAsync = require("../utils/catchAsync");

exports.getCourseMessages = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  // Verify user is enrolled in the course
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      status: "fail",
      message: "Course not found",
    });
  }

  // Get messages for the course
  const messages = await Message.find({ courseId })
    .populate("sender", "name")
    .sort("timestamp");

  res.status(200).json({
    status: "success",
    data: {
      messages,
    },
  });
});
