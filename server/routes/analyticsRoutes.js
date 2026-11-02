
const express = require("express");
const router = express.Router();

const {
  getAdminAnalytics,
} = require("../controllers/analyticsController");

const {
  protectAdmin,
} = require("../middleware/authMiddleware");

// GET /api/admin/analytics
router.get("/", protectAdmin, getAdminAnalytics);

module.exports = router;
