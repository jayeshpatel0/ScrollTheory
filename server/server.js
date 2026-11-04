
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
const PORT = Number(process.env.PORT) || 5000;

app.set("trust proxy", 1);

// Database status
let databaseConnected = false;

// CORS
const allowedOrigins = [
  "https://scrolltheory.netlify.app",
];

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173");
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS blocked: Origin not allowed"));
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// API root
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ScrollTheory API is running",
    status: "OK",
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    api: "running",
    database: databaseConnected ? "connected" : "disconnected",
  });
});

// TEMPORARY database TCP diagnostic
app.get("/debug-db-network", async (req, res) => {
  // Keep this endpoint only during troubleshooting.
  const net = require("net");

  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || 3306);

  if (!host) {
    return res.status(500).json({
      success: false,
      message: "Database host is not configured",
    });
  }

  const socket = new net.Socket();
  let finished = false;

  const finish = (status, body) => {
    if (finished) return;
    finished = true;
    socket.destroy();
    res.status(status).json(body);
  };

  socket.setTimeout(8000);

  socket.once("connect", () => {
    finish(200, {
      success: true,
      message: "Database TCP connection succeeded",
    });
  });

  socket.once("timeout", () => {
    finish(504, {
      success: false,
      message: "Database TCP connection timed out",
    });
  });

  socket.once("error", (err) => {
    finish(502, {
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

// 404
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

  if (err.message?.startsWith("CORS blocked:")) {
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

// Database initialization
async function initializeDatabase() {
  try {
    console.log("Checking MySQL connection...");

    await testConnection();

    databaseConnected = true;
    console.log("MySQL connection successful.");

    console.log("Starting article scheduler...");
    startScheduler();
    console.log("Article scheduler started.");
  } catch (error) {
    databaseConnected = false;

    console.error("DATABASE INITIALIZATION FAILED");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Name:", error.name);

    // Do not terminate HTTP server.
    // Database-dependent endpoints may still fail.
  }
}

// Start HTTP server FIRST
function startServer() {
  console.log("--------------------------------");
  console.log("Starting ScrollTheory API...");
  console.log("Environment:", process.env.NODE_ENV || "development");

  const requiredVariables = [
    "DB_HOST",
    "DB_PORT",
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
    console.error(
      "Missing environment variables:",
      missingVariables.join(", ")
    );
    process.exit(1);
  }

  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`ScrollTheory API running on port ${PORT}`);
    console.log("HTTP server is ready.");

    // DB check happens AFTER port is open.
    initializeDatabase();
  });

  httpServer.on("error", (error) => {
    console.error("HTTP SERVER ERROR:", error.message);
  });
}

startServer();
