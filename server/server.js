const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// ==========================================
// CONNECTION STATE HELPER
// ==========================================

const getDbStateName = (state) => {
  switch (state) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "unknown";
  }
};

// ==========================================
// MONGOOSE CONNECTION EVENT LISTENERS
// ==========================================

mongoose.connection.on("connected", () => {
  console.log(`[MongoDB] Connection established (state: ${getDbStateName(mongoose.connection.readyState)})`);
});

mongoose.connection.on("error", (err) => {
  console.error("[MongoDB] Runtime connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn(`[MongoDB] Disconnected from database (state: ${getDbStateName(mongoose.connection.readyState)})`);
});

mongoose.connection.on("reconnected", () => {
  console.log("[MongoDB] Reconnected successfully");
});

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// ==========================================
// DATABASE READINESS GATE FOR /api
// ==========================================

app.use("/api", async (req, res, next) => {
  // If health check, allow through regardless of DB state
  if (req.path === "/health") {
    return next();
  }

  // 1: Connected - proceed immediately
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // 2: Connecting - wait up to 3 seconds for connection to complete
  if (mongoose.connection.readyState === 2) {
    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Connection wait timeout")), 3000);
        mongoose.connection.once("connected", () => {
          clearTimeout(timer);
          resolve();
        });
        mongoose.connection.once("error", (err) => {
          clearTimeout(timer);
          reject(err);
        });
      });
      return next();
    } catch {
      // Fall through to 503 response
    }
  }

  const currentState = mongoose.connection.readyState;
  console.warn(`[MongoDB Gate] Request to ${req.originalUrl} rejected: DB state is '${getDbStateName(currentState)}' (${currentState})`);

  return res.status(503).json({
    success: false,
    message: "Database connection is not ready. Please try again in a few moments.",
    dbStatus: getDbStateName(currentState),
  });
});

// ==========================================
// STATIC UPLOADS FOLDER
// ==========================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ==========================================
// ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/payments", paymentRoutes);

app.use(
  "/api/applications",
  applicationRoutes
);

// ==========================================
// HOME & HEALTH ROUTES
// ==========================================

app.get("/", (req, res) => {
  res.send("SevaConnect Backend Running");
});

app.get("/api/health", (req, res) => {
  const state = mongoose.connection.readyState;
  const isConnected = state === 1;
  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? "healthy" : "degraded",
    uptime: process.uptime(),
    database: {
      status: getDbStateName(state),
      readyState: state,
    },
  });
});

// ==========================================
// INITIALIZE MONGODB & START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("[MongoDB Error] process.env.MONGO_URI is not defined.");
    } else {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log("MongoDB Connected");
    }
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Initial Database State: ${getDbStateName(mongoose.connection.readyState)}`);
  });
};

startServer();