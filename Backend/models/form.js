const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FormSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    formId: {
      type: String,
      required: true,
    },
    respondedUri: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
const Form = mongoose.model("forms", FormSchema);
module.exports = Form;
