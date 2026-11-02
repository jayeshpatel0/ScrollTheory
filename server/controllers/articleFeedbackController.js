
const { pool } = require("../config/db");

// Check whether an article exists and is published.
async function getPublishedArticle(articleId) {
  const [rows] = await pool.query(
    `SELECT id
     FROM articles
     WHERE id = ? AND status = 'published'
     LIMIT 1`,
    [articleId]
  );

  return rows[0] || null;
}

// GET /api/article-feedback/:articleId
// Public: Get feedback summary.
exports.getFeedbackSummary = async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!/^\d+$/.test(articleId) || Number(articleId) < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID.",
      });
    }

    const article = await getPublishedArticle(articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Published article not found.",
      });
    }

    const [rows] = await pool.query(
      `SELECT
         COUNT(*) AS totalResponses,
         COALESCE(SUM(is_helpful = 1), 0) AS helpfulCount,
         COALESCE(SUM(is_helpful = 0), 0) AS notHelpfulCount
       FROM article_feedback
       WHERE article_id = ?`,
      [articleId]
    );

    const summary = rows[0];
    const total = Number(summary.totalResponses);
    const helpful = Number(summary.helpfulCount);

    return res.json({
      success: true,
      summary: {
        totalResponses: total,
        helpfulCount: helpful,
        notHelpfulCount: Number(summary.notHelpfulCount),
        helpfulPercentage:
          total > 0 ? Math.round((helpful / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("GET FEEDBACK SUMMARY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load feedback.",
    });
  }
};

// GET /api/article-feedback/:articleId/me
// Reader: Get own feedback.
exports.getMyFeedback = async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!/^\d+$/.test(articleId) || Number(articleId) < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID.",
      });
    }

    const article = await getPublishedArticle(articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Published article not found.",
      });
    }

    const [rows] = await pool.query(
      `SELECT is_helpful
       FROM article_feedback
       WHERE article_id = ? AND user_id = ?
       LIMIT 1`,
      [articleId, req.reader.id]
    );

    return res.json({
      success: true,
      feedback:
        rows.length > 0
          ? Boolean(rows[0].is_helpful)
          : null,
    });
  } catch (error) {
    console.error("GET MY FEEDBACK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load your feedback.",
    });
  }
};

// PUT /api/article-feedback/:articleId
// Reader: Create or update feedback.
exports.saveFeedback = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { is_helpful } = req.body;

    if (!/^\d+$/.test(articleId) || Number(articleId) < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID.",
      });
    }

    if (typeof is_helpful !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_helpful must be true or false.",
      });
    }

    const article = await getPublishedArticle(articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Published article not found.",
      });
    }

    await pool.query(
      `INSERT INTO article_feedback
        (article_id, user_id, is_helpful)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         is_helpful = VALUES(is_helpful)`,
      [articleId, req.reader.id, is_helpful ? 1 : 0]
    );

    return res.json({
      success: true,
      message: "Your feedback has been saved.",
      feedback: is_helpful,
    });
  } catch (error) {
    console.error("SAVE FEEDBACK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save feedback.",
    });
  }
};

// DELETE /api/article-feedback/:articleId
// Reader: Remove own feedback.
exports.deleteFeedback = async (req, res) => {
  try {
    const { articleId } = req.params;

    if (!/^\d+$/.test(articleId) || Number(articleId) < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID.",
      });
    }

    const [result] = await pool.query(
      `DELETE FROM article_feedback
       WHERE article_id = ? AND user_id = ?`,
      [articleId, req.reader.id]
    );

    return res.json({
      success: true,
      message: result.affectedRows
        ? "Feedback removed."
        : "No feedback to remove.",
    });
  } catch (error) {
    console.error("DELETE FEEDBACK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove feedback.",
    });
  }
};
