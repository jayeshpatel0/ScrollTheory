
const { pool } = require("../config/db");

// ================================================
// POST /api/reader/history
// Save or update reading history
// ================================================
exports.saveReadingHistory = async (req, res) => {
  try {
    const articleId = Number(req.body.article_id);

    if (
      !Number.isSafeInteger(articleId) ||
      articleId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID.",
      });
    }

    // Only published articles can be tracked.
    const [articles] = await pool.execute(
      `SELECT id
       FROM articles
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

    // One entry per reader/article.
    // Reopening an article updates last_read_at.
    await pool.execute(
      `INSERT INTO reading_history
         (user_id, article_id, last_read_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE
         last_read_at = CURRENT_TIMESTAMP`,
      [req.reader.id, articleId]
    );

    return res.json({
      success: true,
      message: "Reading history saved.",
    });
  } catch (error) {
    console.error("Save reading history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save reading history.",
    });
  }
};

// ================================================
// GET /api/reader/history
// Get logged-in reader's reading history
// ================================================
exports.getReadingHistory = async (req, res) => {
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
          h.last_read_at
       FROM reading_history h
       INNER JOIN articles a
         ON a.id = h.article_id
       WHERE h.user_id = ?
         AND a.status = 'published'
       ORDER BY h.last_read_at DESC`,
      [req.reader.id]
    );

    return res.json({
      success: true,
      history: rows,
    });
  } catch (error) {
    console.error("Get reading history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load reading history.",
    });
  }
};

// ================================================
// DELETE /api/reader/history/:articleId
// Remove one article from reader's history
// ================================================
exports.removeReadingHistory = async (req, res) => {
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
      `DELETE FROM reading_history
       WHERE user_id = ?
         AND article_id = ?`,
      [req.reader.id, articleId]
    );

    return res.json({
      success: true,
      message: "Article removed from reading history.",
    });
  } catch (error) {
    console.error("Remove reading history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to remove history entry.",
    });
  }
};

// ================================================
// DELETE /api/reader/history
// Clear logged-in reader's entire history
// ================================================
exports.clearReadingHistory = async (req, res) => {
  try {
    await pool.execute(
      `DELETE FROM reading_history
       WHERE user_id = ?`,
      [req.reader.id]
    );

    return res.json({
      success: true,
      message: "Reading history cleared.",
    });
  } catch (error) {
    console.error("Clear reading history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to clear reading history.",
    });
  }
};
