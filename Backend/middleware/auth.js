const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;
const rateLimit = require("express-rate-limit");

const auth = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];
      let user = jwt.verify(token, SECRET_KEY);
      req.userId = user.id;
      req.email = user.email;
    } else {
      return res.status(401).json({ message: "Unauthorized user!" });
    }
    // moving on
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized user!" });
  }
};

const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts, try again later",
});

const feedbackRequestsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Too many feedback requests",
});

module.exports = { auth, protect, loginRateLimiter, feedbackRequestsLimiter };
