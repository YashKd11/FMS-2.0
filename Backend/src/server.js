require("dotenv").config();
const express = require("express");
const app = express();
const { forgotPassword } = require("../controllers/userController");
const port = process.env.PORT || 5000;
const { apiLimiter } = require("../middleware");
const cors = require("cors");

const allowedOrigins = (
  process.env.FRONTEND_ORIGINS ||
  "http://localhost:5173,http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

console.log("FRONTEND_ORIGINS:", process.env.FRONTEND_ORIGINS);
console.log("ALLOWED ORIGINS:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Server hardware information
const si = require("systeminformation");
si.cpu()
  .then((data) => {
    console.log("--Server Information--");
    console.log("Brand: " + data.brand);
    console.log("Physical cores: " + data.physicalCores);
    console.log("Speed: " + data.speed);
  })
  .catch((error) => console.error(error));

// Allow configured frontend origins during local dev and deployment.
app.use(
  cors(corsOptions),
);
app.options("*", cors(corsOptions));
// mongo
const connectDB = require("../config/db");
connectDB();

// routes
const userRouter = require("../routes/userRoutes");
const formRouter = require("../routes/formRoutes");
const uploadRoutes = require("../routes/uploadRoutes");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);
app.use(apiLimiter);

app.use("/api/users", userRouter);
app.use("/api/forms", formRouter);
app.use("/api/upload", uploadRoutes);

app.post("/api/forgot-password", forgotPassword);

app.get("/", (req, res) => {
  res.send("FMS api");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
