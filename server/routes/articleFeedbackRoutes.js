
const express = require("express");
const router = express.Router();

const {
  getFeedbackSummary,
  getMyFeedback,
  saveFeedback,
  deleteFeedback,
} = require("../controllers/articleFeedbackController");

const {
  protectReader,
} = require("../middleware/readerAuthMiddleware");

// IMPORTANT:
// Use the actual file path where your protectReader
// middleware is exported.

// Public feedback summary
router.get("/:articleId", getFeedbackSummary);

// Reader's own feedback
router.get(
  "/:articleId/me",
  protectReader,
  getMyFeedback
);

// Create or update reader feedback
router.put(
  "/:articleId",
  protectReader,
  saveFeedback
);

// Delete own feedback
router.delete(
  "/:articleId",
  protectReader,
  deleteFeedback
);

module.exports = router;
