const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Course = require("../models/courseModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // console.log(file.originalname);
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
exports.uploading = [
  upload.single("video"),
  (req, res, next) => {
    // const uploadedFilePath = path.join(
    //   process.cwd(),
    //   "uploads",
    //   req.file.filename
    // );
    // console.log(uploadedFilePath);
    // const newFileName = `${req.body.name}`; // video name
    // console.log(req.file);
    // const newFilePath = path.join(process.cwd(), "uploads", newFileName);
    // console.log(newFilePath);
    // fs.rename(uploadedFilePath, newFilePath, (err) => {
    //   if (err) {
    //     console.error("Error renaming file:", err);
    //     return res.status(500).send("Error renaming file");
    //   }

    //   res.send(`File uploaded and renamed to: ${newFileName}`);
    // });
    req.url = path.join("uploads", req.file.filename);

    next();
  },
];
exports.checkVideoAccess = catchAsync(async (req, res, next) => {
  const { sectionIndex, courseId, videoIndex } = req.params;
  const course = await Course.findById(courseId);

  if (!course) {
    return next(new AppError("No course found with that ID", 404));
  }

  const section = course.sections.find(
    (sec) => sec._id.toString() === sectionIndex
  );
  if (!section) return next(new AppError("Section not found", 404));

  const video = section.videos.id(videoIndex);
  if (!video) return next(new AppError("Video not found", 404));

  // Allow access if video is free or user has premium subscription
  if (video.isFree || req.user?.hasPremiumAccess()) {
    req.videoUrl = video.url;
    return next();
  }

  return next(new AppError("This video requires a premium subscription", 403));
});

// Streaming video
exports.streamVideo = catchAsync(async (req, res, next) => {
  const { videoUrl } = req;
  const videoPath = path.join(process.cwd(), videoUrl); // Assuming the URL in the database points to the file location
  console.log(videoPath);
  // Check if video file exists
  fs.stat(videoPath, (err, stats) => {
    if (err || !stats.isFile()) {
      return next(new AppError("Video file not found", 404));
    }

    const videoSize = stats.size;
    const range = req.headers.range; // Get the range of data requested by the client

    if (!range) {
      return res.status(400).send("Requires Range header");
    }

    const CHUNK_SIZE = 5 * 1024 * 1024; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;
    const stream = fs.createReadStream(videoPath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4", // Set the correct content type for your video format
    });

    stream.pipe(res);
  });
});
