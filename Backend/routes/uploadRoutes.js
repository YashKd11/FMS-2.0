const express = require("express");
const multer = require("multer");
const auth = require("/")

const uploadRouter = express.Router();

const {
  uploadFeedback,
  getReports,
  deleteReport,
  exportReport,
} = require("../controllers/uploadController");

const { protect } = require("../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({ storage });

uploadRouter.post(
  "/upload-feedback",
  protect,
  upload.single("file"),
  uploadFeedback
);

uploadRouter.get("/get-reports", protect, getReports);
uploadRouter.delete("/delete-report/:id", protect, deleteReport);
uploadRouter.get("/export/:id", auth, exportReport);

module.exports = uploadRouter;