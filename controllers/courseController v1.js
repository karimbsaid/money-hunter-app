const catchAsync = require("./../utils/catchAsync");
const Course = require("../models/courseModel");
const AppError = require("../utils/appError");
exports.getAllCourse = catchAsync(async (req, res, next) => {
  const course = await Course.find().populate({
    path: "teacher",
    select: "name",
  });
  const transformedCourses = course.map((course) => {
    const courseObj = course.toObject();
    // Add number of students
    courseObj.numberOfStudents = course.studentsEnrolled.length;
    delete courseObj.studentsEnrolled;

    return courseObj;
  });
  res.status(200).json({
    status: "success",
    results: course.length,
    data: {
      course: transformedCourses,
    },
  });
});
exports.getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate({
      path: "teacher",
      select: "name",
    })
    .select("-studentsEnrolled")
    .lean(); // Use `.lean()` to return a plain JavaScript object.

  if (!course) {
    return next(new AppError("No course found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      course,
    },
  });
});

exports.createCourse = catchAsync(async (req, res, next) => {
  const { title, description, price } = req.body;
  const { _id: teacher } = req.user;

  const course = await Course.create({
    title,
    description,
    teacher,
    price,
    sections: [],
  });

  res.status(201).json({
    status: "success",
    data: {
      course: course,
    },
  });
});
exports.updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!course) {
    return next(new AppError("No course found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      course,
    },
  });
});
exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    return next(new AppError("No course found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.addSection = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { name } = req.body;

  const course = await Course.findById(courseId);
  if (!course) return next(new AppError("No secton found with that ID", 404));

  course.sections.push({ name, videos: [] });
  await course.save();

  res.status(201).json(course.sections);
});
// PATCH /api/courses/:courseId/sections/:sectionIndex
exports.updateSection = catchAsync(async (req, res, next) => {
  const { courseId, sectionIndex } = req.params;
  const { name } = req.body;

  const course = await Course.findById(courseId);
  const section = course.sections.find(
    (sec) => sec._id.toString() === sectionIndex
  );

  if (!course) return next(new AppError("No course found with that ID", 404));
  if (!section) return next(new AppError("Section not found", 404));

  section.name = name;
  await course.save();

  res.status(200).json(section);
});
// DELETE /api/courses/:courseId/sections/:sectionIndex
exports.deleteSection = catchAsync(async (req, res, next) => {
  const { courseId, sectionIndex } = req.params;

  const course = await Course.findById(courseId);

  if (!course) return next(new AppError("No course found with that ID", 404));
  const section = course.sections.find(
    (sec) => sec._id.toString() === sectionIndex
  );
  if (!section) return next(new AppError("Section not found", 404));

  course.sections.splice(sectionIndex, 1);
  await course.save();

  res.status(204).json({
    status: "success",
    message: "Video deleted successfully",
  });
});

// POST /api/courses/:courseId/sections/:sectionIndex/videos
exports.addVideo = catchAsync(async (req, res, next) => {
  const { courseId, sectionIndex } = req.params;
  const { title } = req.body;
  const url = req.url;
  //console.log(title);
  //console.log(url);
  const course = await Course.findById(courseId);
  const section = course.sections.find(
    (sec) => sec._id.toString() === sectionIndex
  );
  if (!course) return next(new AppError("No course found with that ID", 404));
  if (!section) return next(new AppError("Section not found", 404));
  section.videos.push({ title, url });
  await course.save();

  res.status(201).send("okkk");
});

// PATCH /api/courses/:courseId/sections/:sectionIndex/videos/:videoIndex
exports.updateVideo = catchAsync(async (req, res, next) => {
  const { courseId, sectionIndex, videoIndex } = req.params;
  const { title } = req.body;
  const url = req.url;
  const course = await Course.findById(courseId);
  const section = course.sections.find(
    (sec) => sec._id.toString() === sectionIndex
  );
  const video = section.videos.find((vid) => vid._id.toString() === videoIndex);
  if (!course) return next(new AppError("No course found with that ID", 404));
  if (!section) return next(new AppError("Section not found", 404));
  if (!video) return next(new AppError("Video not found", 404));
  video.title = title;
  video.url = url;

  await course.save();

  res.status(200).json("success");
});
// DELETE /api/courses/:courseId/sections/:sectionIndex/videos/:videoIndex
exports.deleteVideo = catchAsync(async (req, res, next) => {
  const { courseId, sectionIndex, videoIndex } = req.params;

  // Find the course
  const course = await Course.findById(courseId);
  if (!course) return next(new AppError("No course found with that ID", 404));

  // Find the section within the course
  const section = course.sections.find(
    (sec) => sec._id.toString() === sectionIndex
  );
  if (!section) return next(new AppError("Section not found", 404));

  // Find the video within the section
  const video = section.videos.find((vid) => vid._id.toString() === videoIndex);
  if (!video) return next(new AppError("Video not found", 404));

  // Remove the video from the section's videos array
  const videoIndexInArray = section.videos.findIndex(
    (vid) => vid._id.toString() === videoIndex
  );

  if (videoIndexInArray !== -1) {
    section.videos.splice(videoIndexInArray, 1); // Remove the video from the array
  }

  // Save the course after removing the video
  await course.save();

  // Send the response indicating success
  res.status(200).json({
    status: "success",
    message: "Video deleted successfully",
  });
});
