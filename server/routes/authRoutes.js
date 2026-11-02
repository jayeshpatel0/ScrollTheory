
const express = require("express");
const router = express.Router();

const { login, me } = require("../controllers/authController");
const { protectAdmin } = require("../middleware/authMiddleware");

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me
router.get("/me", protectAdmin, me);

module.exports = router;
