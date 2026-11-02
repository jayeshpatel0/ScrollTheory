
const express = require("express");
const router = express.Router();

const {
  saveReadingHistory,
  getReadingHistory,
  removeReadingHistory,
  clearReadingHistory,
} = require("../controllers/readingHistoryController");

const {
  protectReader,
} = require("../middleware/readerAuthMiddleware");

// All history routes require reader authentication.
router.use(protectReader);

// Save/update reading history
router.post("/", saveReadingHistory);

// Get reading history
router.get("/", getReadingHistory);

// Remove one article
router.delete("/:articleId", removeReadingHistory);

// Clear complete history
router.delete("/", clearReadingHistory);

module.exports = router;
