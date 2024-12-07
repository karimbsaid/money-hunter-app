const express = require("express");
const chatController = require("../controllers/chatController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect); // Ensure user is logged in

router.get("/course/:courseId/messages", chatController.getCourseMessages);

module.exports = router;
