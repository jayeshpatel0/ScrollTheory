
const { pool } = require("../config/db");

// GET /api/bookmarks
// Logged-in reader's saved published articles
exports.getBookmarks = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
          a.id,
          a.title,
          a.slug,
          a.category,
          a.excerpt,
          a.cover_image,
          a.published_at,
          b.created_at AS bookmarked_at
       FROM bookmarks b
       INNER JOIN articles a ON a.id = b.article_id
       WHERE b.user_id = ?
         AND a.status = 'published'
       ORDER BY b.created_at DESC`,
      [req.reader.id]
    );

    return res.json({
      success: true,
      bookmarks: rows,
    });
  } catch (error) {
    console.error("Get bookmarks error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load bookmarks.",
    });
  }
};

// POST /api/bookmarks/:articleId
exports.addBookmark = async (req, res) => {
  try {
    const articleId = Number(req.params.articleId);

    if (
      !Number.isSafeInteger(articleId) ||
      articleId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID.",
      });
    }

    const [articles] = await pool.execute(
      `SELECT id FROM articles
       WHERE id = ?
         AND status = 'published'
       LIMIT 1`,
      [articleId]
    );

    if (!articles.length) {
      return res.status(404).json({
        success: false,
        message: "Published article not found.",
      });
    }

    await pool.execute(
      `INSERT INTO bookmarks (user_id, article_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         article_id = VALUES(article_id)`,
      [req.reader.id, articleId]
    );

    return res.json({
      success: true,
      bookmarked: true,
      message: "Article saved to bookmarks.",
    });
  } catch (error) {
    console.error("Add bookmark error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save bookmark.",
    });
  }
};

// DELETE /api/bookmarks/:articleId
exports.removeBookmark = async (req, res) => {
  try {
    const articleId = Number(req.params.articleId);

    if (
      !Number.isSafeInteger(articleId) ||
      articleId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID.",
      });
    }

    await pool.execute(
      `DELETE FROM bookmarks
       WHERE user_id = ?
         AND article_id = ?`,
      [req.reader.id, articleId]
    );

    return res.json({
      success: true,
      bookmarked: false,
      message: "Bookmark removed.",
    });
  } catch (error) {
    console.error("Remove bookmark error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to remove bookmark.",
    });
  }
};
