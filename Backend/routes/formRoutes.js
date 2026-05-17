const express = require("express");
const {
  saveForm,
  deleteForm,
  getAllForms,
} = require("../controllers/formController");

const formRouter = express.Router();
const { protect } = require("../middleware/auth");

formRouter.post("/", protect, saveForm);
formRouter.get("/", protect, getAllForms);
formRouter.delete("/:id", protect, deleteForm);

module.exports = formRouter;
