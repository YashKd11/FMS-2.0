const express = require("express");
const multer = require("multer");

const uploadRouter = express.Router();

// ✅ SINGLE IMPORT
const {
  uploadFeedback,
  getReports,
  deleteReport,
  exportReport,
} = require("../controllers/uploadController");

// ✅ CORRECT MIDDLEWARE PATH
const { protect } = require("../middleware/auth");

// ✅ MULTER
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------- ROUTES ----------------

uploadRouter.post(
  "/upload-feedback",
  protect,
  upload.single("file"),
  uploadFeedback
);

uploadRouter.get("/get-reports", protect, getReports);
uploadRouter.delete("/delete-report/:id", protect, deleteReport);
uploadRouter.get("/export/:id", protect, exportReport);

module.exports = uploadRouter;