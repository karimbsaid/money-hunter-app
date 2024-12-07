const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "the field name is required"],
  },
  email: {
    type: String,
    required: [true, "the email field is required"],
    validate: [validator.isEmail, "please enter a valid email"],
    unique: true,
  },
  password: {
    type: String,
    minlength: 8,
    select: false,
    required: [true, "Please provide a password"],
  },
  role: {
    type: String,
    enum: ["admin", "user", "teacher"],
    default: "user",
  },

  confirmPassword: {
    type: String,
    required: [true, "please confirm your password"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "please confirm your password",
    },
  },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  passwordChangedAt: Date,
  photo: String,
  subscription: {
    type: String,
    enum: ["free", "premium"],
    default: "free",
  },
  subscriptionEndDate: {
    type: Date,
  },
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword); // 'this.password' is accessible here
};
userSchema.methods.changePasswordAfter = function (jwt_timestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwt_timestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.hasPremiumAccess = function () {
  return (
    this.subscription === "premium" &&
    this.subscriptionEndDate &&
    this.subscriptionEndDate > new Date()
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
