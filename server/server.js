
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { testConnection } = require("./config/db");
const { startScheduler } = require("./services/scheduler");

// Routes
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const readerAuthRoutes = require("./routes/readerAuthRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const readingHistoryRoutes = require("./routes/readingHistoryRoutes");
const articleFeedbackRoutes = require("./routes/articleFeedbackRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const readerManagementRoutes = require("./routes/readerManagementRoutes");
const seoRoutes = require("./routes/seoRoutes");

const app = express();

// Port
const PORT = Number(process.env.PORT) || 5000;

// Trust proxy (Render deployment)
app.set("trust proxy", 1);

// CORS configuration
const allowedOrigins = [
  "https://scrolltheory.netlify.app",
];

// Local development
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173");
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without Origin, e.g. health checks
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("CORS blocked: Origin not allowed")
      );
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ScrollTheory API is running",
    status: "OK",
  });
});

// API health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
  });
});


app.get("/debug-db-network", async (req, res) => {
  const net = require("net");

  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || 3306);

  const socket = new net.Socket();

  socket.setTimeout(8000);

  socket.once("connect", () => {
    socket.destroy();
    res.json({
      success: true,
      message: "TCP connection to database succeeded",
    });
  });

  socket.once("timeout", () => {
    socket.destroy();
    res.status(504).json({
      success: false,
      message: "Database TCP connection timed out",
    });
  });

  socket.once("error", (err) => {
    res.status(502).json({
      success: false,
      code: err.code || "UNKNOWN",
      message: "Database TCP connection failed",
    });
  });

  socket.connect(port, host);
});


// API routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/reader/auth", readerAuthRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/reader/history", readingHistoryRoutes);
app.use("/api/article-feedback", articleFeedbackRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/admin/readers", readerManagementRoutes);
app.use("/api/admin/seo", seoRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("API ERROR:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  // CORS error
  if (err.message && err.message.startsWith("CORS blocked:")) {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// Start server
async function startServer() {
  try {
    console.log("--------------------------------");
    console.log("Starting ScrollTheory API...");
    console.log("Environment:", process.env.NODE_ENV || "development");

    // Check required environment variables
    const requiredVariables = [
      "DB_HOST",
      "DB_USER",
      "DB_NAME",
      "DB_PASSWORD",
      "JWT_SECRET",
      "READER_JWT_SECRET",
    ];

    const missingVariables = requiredVariables.filter(
      (key) => !process.env[key]
    );

    if (missingVariables.length > 0) {
      throw new Error(
        `Missing environment variables: ${missingVariables.join(", ")}`
      );
    }

    // Test MySQL connection
    console.log("Checking MySQL connection...");

    await testConnection();

    console.log("MySQL connection successful.");

    // Start article scheduler
    console.log("Starting article scheduler...");

    startScheduler();

    console.log("Article scheduler started.");

    // Start HTTP server
    app.listen(PORT, "0.0.0.0", () => {
      console.log("--------------------------------");
      console.log(`ScrollTheory API running on port ${PORT}`);
      console.log("Server is ready.");
      console.log("--------------------------------");
    });
  } catch (error) {
    console.error("--------------------------------");
    console.error("SERVER STARTUP FAILED");
    console.error("Error message:", error?.message);
    console.error("Error code:", error?.code);
    console.error("Error name:", error?.name);
    console.error("Error stack:", error?.stack);
    console.error("--------------------------------");

    process.exit(1);
  }
}

startServer();
