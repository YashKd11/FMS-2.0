const auth = require("./auth");
const {
  loginRateLimiter,
  feedbackRequestsLimiter,
  apiLimiter,
  bugResourcesLimiter,
} = require("./limiter");

module.exports = {
  auth,
  loginRateLimiter,
  feedbackRequestsLimiter,
  apiLimiter,
  bugResourcesLimiter,
};
