const userModel = require("../models/user");
const bugModel = require("../models/bug");
const feedbackModel = require("../models/feedback");

const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.JWT_SECRET;
const randomstring = require("randomstring");

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const signup = async (req, res) => {
  let { username, email, password } = req.body;
  let ip = req.ip;
  if ( !username || !email || !password ) {
    return res.status(400).json({ message: "Empty fields" });

  } else if (!/^[a-zA-Z0-9_.\s]+$/.test(username)){
    res.json({
      status: "FAILED",
      message: "Invalid name!",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid Email",
    });
  } else if (password.length < 6) {
    res.json({
      status: "FAILED",
      message: "Password length must be greater than or equal to 6",
    });
  } else {
    try {
      // check for existing user
      const existingUser = await userModel.findOne({ email: email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "A user with the provided email already exists" });
      }
      let hashedIp;
      console.log(`Account created from: ${ip}`);
      // hash password
      const saltRounds = 10;
      hashedIp = await bcrypt.hash(ip, saltRounds);
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      // user creation
      const result = await userModel.create({
        username,
        email,
        password: hashedPassword,
        ipAddress: hashedIp ? hashedIp : null,
      });
      // generate token
      const token = jwt.sign(
        { email: result.email, id: result._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      // send response
      return res.status(201).json({ user: sanitizeUser(result), token: token });
    } catch (err) {
      console.error("ERROR:", err);
      return res.status(500).json({ message: err.message });
    }
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ message: "Email and password required" });
  }
  try {
    // check for existing user
    const existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json({ message: "User doesn't exist!" });
    }
    // hash and compare passwords
    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }
    const matchIp = await bcrypt.compare(req.ip, existingUser.ipAddress);
    if (!matchIp) {
      console.log(
        `User: ${existingUser.username} logged in from a different IP address`,
      );
    }
    // generate token
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    // send response
    res.status(200).json({ user: sanitizeUser(existingUser), token });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI,
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    const temporaryPassword = randomstring.generate(7);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(temporaryPassword, saltRounds);
    await userModel.findByIdAndUpdate(existingUser._id, {
      password: hashedPassword,
    });
    
    // Send email with temporaryPassword
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "email daldooo apna yaha pe",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });
    const mailOptions = {
      from: "FMS Development Team <email daldooo apna yaha pe>",
      to: email,
      subject: `Reset Password for FMS account: ${email}`,
      text: `Your temporary password is: ${temporaryPassword}. Please login and change it.`,
      html: `<h3>Your temporary password is: ${temporaryPassword}</h3><p>Please login and change it.</p>`,
    };
    await transport.sendMail(mailOptions);
    res.status(200).json({ message: "Temporary password sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const existingUser = await userModel.findOne({ email: req.email });
    const matchPassword = await bcrypt.compare(password, existingUser.password);
    const matchNewPassword = await bcrypt.compare(
      newPassword,
      existingUser.password,
    );
    if (matchNewPassword || !matchPassword) {
      return res
        .status(400)
        .json({ message: "New password cannot be same as current password!" });
    }
    if (matchPassword) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      const userPassword = await userModel.findByIdAndUpdate(
        { _id: req.userId },
        { password: hashedPassword },
      );
      return res.status(200).json({
        message: "Password changed successfully!",
        password: userPassword,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Current password doesn't match!" });
    }
  } catch (err) {
    res.status(400).json({ message: "Something went wrong! " + err });
  }
};

const resetPasswordFromLink = async (req, res, next) => {
  const { id, token } = req.params;
  const existingUser = await userModel.findById({ _id: id });
  if (!existingUser) {
    return res
      .status(400)
      .json({ message: "Couldn't reset password, Not Found!" });
  }
  const secret = SECRET_KEY + existingUser.password;
  try {
    const payload = jwt.verify(token, secret);
    res.render("reset-password", { email: existingUser.email });
  } catch (err) {
    res.status(400).json({ message: "Something went wrong! " + err });
  }
};

const verifyAndResetPassword = async (req, res, next) => {
  const { id, token } = req.params;
  const existingUser = await userModel.findById({ _id: id });
  if (!existingUser) {
    return res
      .status(400)
      .json({ message: "Couldn't reset password, Not Found!" });
  }
  const secret = SECRET_KEY + existingUser.password;
  try {
    const payload = jwt.verify(token, secret);
    // res.render("reset-password", { email: existingUser,email });
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userPassword = await userModel.findByIdAndUpdate(
      { _id: req.userId },
      { password: hashedPassword },
    );
    return res
      .status(200)
      .json({ message: "Password reset was successful!", userPassword });
  } catch (err) {
    res.status(400).json({ message: "Something went wrong! " + err });
  }
};

const reportBugs = async (req, res) => {
  try {
    const { description } = req.body;
    const email = req.email;
    const oAuth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URI,
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
    const result = await bugModel.create({
      userId: req.userId,
      email,
      description,
    });

    const sendMail = async () => {
      try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: "email daldooo apna yaha pe",
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken,
          },
        });
      } catch (error) {
        console.error("Error sending email:", error);
      }
    };

    const emailIds = ["msifmsys@gmail.com", "email daldooo apna yaha pe"];
  } catch (err) {
    console.error("Error reporting bug:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createFeedback = async (req, res) => {
  try {
    const { email, description } = req.body;
    const result = await feedbackModel.create({
      email,
      description,
    });
    res.status(200).json({ feedback: result });
  } catch (err) {
    res.status(400).json({ message: "Something went wrong! " + err });
  }
};

module.exports = {
  signin,
  signup,
  forgotPassword,
  reportBugs,
  resetPassword,
  verifyAndResetPassword,
  resetPasswordFromLink,
  createFeedback,
};
