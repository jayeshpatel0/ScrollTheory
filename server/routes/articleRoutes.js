
const express = require("express");
const router = express.Router();

const {
  getPublishedArticles,
  getArticleBySlug,
  getAdminArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");

const {
  protectAdmin,
} = require("../middleware/authMiddleware");

// -------------------------------
// PUBLIC ROUTES
// -------------------------------

// GET /api/articles
router.get("/", getPublishedArticles);

// GET /api/articles/slug/:slug
router.get("/slug/:slug", getArticleBySlug);

// -------------------------------
// ADMIN ROUTES
// -------------------------------

// GET /api/articles/admin/all
router.get("/admin/all", protectAdmin, getAdminArticles);

// POST /api/articles
router.post("/", protectAdmin, createArticle);

// PUT /api/articles/:id
router.put("/:id", protectAdmin, updateArticle);

// DELETE /api/articles/:id
router.delete("/:id", protectAdmin, deleteArticle);

module.exports = router;
