const Message = require("../models/messageModel"); // Ensure this path is correct

// Store active users and their rooms
const activeUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    // Join a course chat room
    socket.on("joinCourse", async ({ courseId, userId }) => {
      socket.join(`course-${courseId}`);
      activeUsers.set(socket.id, { courseId, userId });

      // Notify others that a new user joined
      socket.to(`course-${courseId}`).emit("userJoined", { userId });
    });

    // Handle new messages
    socket.on("sendMessage", async ({ courseId, content }) => {
      const userData = activeUsers.get(socket.id);
      if (!userData) return;

      try {
        // Save message to database
        const message = await Message.create({
          courseId,
          sender: userData.userId,
          content,
        });

        // Broadcast message to all users in the course
        io.to(`course-${courseId}`).emit("newMessage", {
          message: {
            ...message.toObject(),
            sender: userData.userId,
          },
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      const userData = activeUsers.get(socket.id);
      if (userData) {
        socket
          .to(`course-${userData.courseId}`)
          .emit("userLeft", { userId: userData.userId });
        activeUsers.delete(socket.id);
      }
    });
  });
};
