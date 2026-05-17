const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FeedbackSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);
const Feedback = mongoose.model("feedback", FeedbackSchema);
module.exports = Feedback;
