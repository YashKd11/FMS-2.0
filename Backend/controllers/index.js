const {
  signin,
  signup,
  forgotPassword,
  reportBugs,
  resetPassword,
  verifyAndResetPassword,
  resetPasswordFromLink,
  createFeedback,
} = require("./userController");

const { saveForm, getAllForms, deleteForm } = require("./formController");

module.exports = {
  signin,
  signup,
  forgotPassword,
  reportBugs,
  resetPassword,
  verifyAndResetPassword,
  resetPasswordFromLink,
  createFeedback,
  saveForm,
  getAllForms,
  deleteForm,
};
