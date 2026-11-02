
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  me,
  updateReaderProfile,
} = require("../controllers/readerAuthController");

const {
  protectReader,
} = require("../middleware/readerAuthMiddleware");

router.post("/register", register);
router.post("/login", login);

router.get("/me", protectReader, me);

// Update logged-in reader profile
router.patch(
  "/me",
  protectReader,
  updateReaderProfile
);

module.exports = router;
