require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });

    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection error:", err.message);

    process.exit(1);
  }
};

module.exports = connectDB;