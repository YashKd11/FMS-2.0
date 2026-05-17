const formModel = require("../models/form");
const mongoose = require("mongoose");

const saveForm = async (req, res) => {
  const { responderuri, respondedUri, title, formId } = req.body;

  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized to save forms" });
  }

  const newForm = new formModel({
    userId: req.userId,
    formId,
    respondedUri: respondedUri || responderuri,
    title,
    email: req.email,
  });

  const existingForm = await formModel.findOne({
    userId: req.userId,
    formId,
  });

  if (existingForm) {
    return res.status(409).json({
      message: "Form already saved",
    });
  }

  try {
    await newForm.save();
    res.status(201).json(newForm);
  } catch (err) {
    res.status(500).json({ message: `Something went wrong! ${err}` });
  }
};

const getAllForms = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const forms = await formModel
      .find({ userId: req.userId })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });


    res.status(200).json(forms);
  } catch (err) {
    res.status(500).json({ message: `Something went wrong!` });
  }
};
const deleteForm = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid form ID",
    });
  }

  try {
    const form = await formModel.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!form) {
      return res.status(404).json({
        message: "Form not found",
      });
    }

    return res.status(202).json(form);
  } catch (err) {
    return res.status(500).json({ message: `Something went wrong! ${err}` });
  }
};

module.exports = { saveForm, getAllForms, deleteForm };
