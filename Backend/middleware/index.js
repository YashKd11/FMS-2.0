const auth = require("./auth");
const {
  loginRateLimiter,
  feedbackRequestsLimiter,
  apiLimiter,
  bugResourcesLimiter,
} = require("./Limiter");

module.exports = {
  auth,
  loginRateLimiter,
  feedbackRequestsLimiter,
  apiLimiter,
  bugResourcesLimiter,
};
