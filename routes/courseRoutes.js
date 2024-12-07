const express = require("express");
const authController = require("../controllers/authController");
const courseController = require("../controllers/courseController");
const videoController = require("../controllers/videoController");
const enrollmentController = require("../controllers/enrollmentController");
const { restrictToCourseOwner } = require("../controllers/authController");
const router = express.Router();
router.get(
  "/my-enrolled-courses",
  authController.protect,
  enrollmentController.getEnrolledCourses
);
router.route("/").get(courseController.getAllCourse).post(
  authController.protect,

  authController.restrictTo("teacher", "admin"),
  courseController.createCourse
);

router
  .route("/:id")
  .get(courseController.getCourse)
  .patch(
    authController.protect,
    authController.restrictTo("teacher", "admin"),
    authController.restrictToCourseOwner,
    courseController.updateCourse
  )
  .delete(
    authController.protect,
    authController.restrictTo("teacher", "admin"),
    authController.restrictToCourseOwner,
    courseController.deleteCourse
  );

// Section Routes
router.post(
  "/:courseId/sections",
  authController.protect,
  authController.restrictTo("teacher", "admin"),
  restrictToCourseOwner,
  courseController.addSection
);
router
  .route("/:courseId/sections/:sectionIndex")
  .patch(
    authController.protect,
    authController.restrictTo("teacher", "admin"),
    restrictToCourseOwner,
    courseController.updateSection
  )
  .delete(
    authController.protect,
    authController.restrictTo("teacher", "admin"),
    restrictToCourseOwner,
    courseController.deleteSection
  );

// Video Routes
router.post(
  "/:courseId/sections/:sectionIndex/videos",
  authController.protect,
  authController.restrictTo("teacher", "admin"),
  restrictToCourseOwner,
  videoController.uploading,
  courseController.addVideo
);
router
  .route("/:courseId/sections/:sectionIndex/videos/:videoIndex")
  .get(videoController.checkVideoAccess, videoController.streamVideo)
  .patch(
    authController.protect,
    authController.restrictTo("teacher", "admin"),
    restrictToCourseOwner,
    videoController.uploading,
    courseController.updateVideo
  )
  .delete(
    authController.protect,
    authController.restrictTo("teacher", "admin"),
    restrictToCourseOwner,
    courseController.deleteVideo
  );

// Enrollment routes
router.post(
  "/:courseId/enroll",
  authController.protect, // Ensure user is logged in
  enrollmentController.enrollInCourse
);

// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });
//router.post("/upload", videoController.uploading);

module.exports = router;
