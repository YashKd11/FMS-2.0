const express = require("express");

const {
  signin,
  signup,
  reportBugs,
  resetPassword,
  createFeedback,
  forgotPassword,
} = require("../controllers/userController");

const userRouter = express.Router();

const {
  protect,
  loginRateLimiter,
  feedbackRequestsLimiter,
} = require("../middleware/auth");

// Auth routes
userRouter.post("/signin", loginRateLimiter, signin);
userRouter.post("/signup", signup);
userRouter.post("/forgot-password", forgotPassword);
userRouter.patch("/reset-password", protect, resetPassword);

// Feedback & bugs
userRouter.post("/report-bugs", protect, reportBugs);
userRouter.post("/create-feedback", feedbackRequestsLimiter, createFeedback);

module.exports = userRouter;