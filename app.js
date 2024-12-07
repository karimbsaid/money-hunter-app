const express = require("express");

const AppError = require("./utils/appError");
const courseRouter = require("./routes/courseRoutes");
const userRouter = require("./routes/userRoutes");
const gloabErrorController = require("./controllers/errorController");
const app = express();

// 1) MIDDLEWARES
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
//app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/course", courseRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// app.use((err, req, res, next) => {
//   err.status = err.status || "error";
//   err.statusCode = err.statusCode || 500;
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });
app.use(gloabErrorController);

module.exports = app;
