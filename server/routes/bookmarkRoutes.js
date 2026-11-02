
const express = require("express");
const router = express.Router();

const {
  protectReader,
} = require("../middleware/readerAuthMiddleware");

const {
  getBookmarks,
  addBookmark,
  removeBookmark,
} = require("../controllers/bookmarkController");

// All bookmark endpoints require reader login
router.use(protectReader);

router.get("/", getBookmarks);
router.post("/:articleId", addBookmark);
router.delete("/:articleId", removeBookmark);

module.exports = router;
    