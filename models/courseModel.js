const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: String,
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  price: { type: Number, required: true },
  sections: [
    {
      name: { type: String, required: true },
      videos: [
        {
          title: String,
          url: String,
          isFree: {
            type: Boolean,
            default: false, // By default, videos are not free
          },
        },
      ],
    },
  ],
  studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Course", courseSchema);
