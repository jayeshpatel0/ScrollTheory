
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { testConnection } = require("./config/db");
const { startScheduler } = require("./services/scheduler");

const app = express();

const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const readerAuthRoutes = require("./routes/readerAuthRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const readingHistoryRoutes = require("./routes/readingHistoryRoutes");
const articleFeedbackRoutes = require("./routes/articleFeedbackRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const readerManagementRoutes = require("./routes/readerManagementRoutes");
const seoRoutes = require("./routes/seoRoutes");

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/reader/auth", readerAuthRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/reader/history", readingHistoryRoutes);
app.use("/api/article-feedback", articleFeedbackRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/admin/readers", readerManagementRoutes);
app.use("/api/admin/seo", seoRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ScrollTheory API is running",
  });
});

const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    await testConnection();

    startScheduler();

    app.listen(PORT, () => {
      console.log(
        `ScrollTheory API running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup failed.");
    process.exit(1);
  }
}

startServer();
