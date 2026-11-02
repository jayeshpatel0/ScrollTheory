
const express = require("express");
const router = express.Router();

const {
  getArticleSeo,
  updateArticleSeo,
} = require("../controllers/seoController");

const {
  protectAdmin,
} = require("../middleware/authMiddleware");

// All SEO admin routes require admin authentication
router.use(protectAdmin);

router.get(
  "/articles/:articleId",
  getArticleSeo
);

router.put(
  "/articles/:articleId",
  updateArticleSeo
);

module.exports = router;
