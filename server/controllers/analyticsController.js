
const { pool } = require("../config/db");

// ==========================================
// ADMIN ANALYTICS CONTROLLER
// ==========================================

async function getAdminAnalytics(req, res) {
  try {
    // Run analytics queries in parallel
    const [
      readerResult,
      articleResult,
      bookmarkResult,
      historyResult,
      feedbackResult,
      trendResult,
      topReadResult,
      topBookmarkResult,
      recentActivityResult,
    ] = await Promise.all([
      // 1. Total readers
      pool.query(`
        SELECT COUNT(*) AS totalReaders
        FROM reader_users
      `),

      // 2. Article statistics
      pool.query(`
        SELECT
          COUNT(*) AS totalArticles,
          COALESCE(SUM(status = 'published'
            AND published_at <= NOW()), 0) AS publishedArticles,
          COALESCE(SUM(status = 'draft'), 0) AS draftArticles,
          COALESCE(SUM(status = 'scheduled'), 0) AS scheduledArticles
        FROM articles
      `),

      // 3. Total bookmarks
      pool.query(`
        SELECT COUNT(*) AS totalBookmarks
        FROM bookmarks
      `),

      // 4. Reading history records
      pool.query(`
        SELECT COUNT(*) AS totalReadingRecords
        FROM reading_history
      `),

      // 5. Feedback overview
      pool.query(`
        SELECT
          COUNT(*) AS totalFeedback,
          COALESCE(SUM(is_helpful = 1), 0) AS helpful,
          COALESCE(SUM(is_helpful = 0), 0) AS notHelpful
        FROM article_feedback
      `),

      // 6. Reading activity: last 7 days
      // Counts latest reader-article records grouped by day
      pool.query(`
        SELECT
          DATE(last_read_at) AS activityDate,
          COUNT(*) AS readingRecords
        FROM reading_history
        WHERE last_read_at >=
          CURDATE() - INTERVAL 6 DAY
          AND last_read_at < CURDATE() + INTERVAL 1 DAY
        GROUP BY DATE(last_read_at)
        ORDER BY activityDate ASC
      `),

      // 7. Most read articles
      pool.query(`
        SELECT
          a.id,
          a.title,
          a.slug,
          COUNT(rh.id) AS readingRecords
        FROM articles a
        INNER JOIN reading_history rh
          ON rh.article_id = a.id
        GROUP BY a.id, a.title, a.slug
        ORDER BY readingRecords DESC, a.id DESC
        LIMIT 5
      `),

      // 8. Most bookmarked articles
      pool.query(`
        SELECT
          a.id,
          a.title,
          a.slug,
          COUNT(b.id) AS bookmarkCount
        FROM articles a
        INNER JOIN bookmarks b
          ON b.article_id = a.id
        GROUP BY a.id, a.title, a.slug
        ORDER BY bookmarkCount DESC, a.id DESC
        LIMIT 5
      `),

      // 9. Recent reader activity
      pool.query(`
        SELECT
          rh.user_id AS readerId,
          ru.name AS readerName,
          a.id AS articleId,
          a.title AS articleTitle,
          a.slug AS articleSlug,
          rh.last_read_at AS lastReadAt
        FROM reading_history rh
        INNER JOIN reader_users ru
          ON ru.id = rh.user_id
        INNER JOIN articles a
          ON a.id = rh.article_id
        ORDER BY rh.last_read_at DESC
        LIMIT 10
      `),
    ]);

    const readers = readerResult[0][0];
    const articles = articleResult[0][0];
    const bookmarks = bookmarkResult[0][0];
    const history = historyResult[0][0];
    const feedback = feedbackResult[0][0];

    const totalFeedback = Number(feedback.totalFeedback);
    const helpful = Number(feedback.helpful);

    const helpfulPercentage =
      totalFeedback > 0
        ? Number(((helpful / totalFeedback) * 100).toFixed(1))
        : 0;

    // Fill missing dates with zero
    const activityMap = new Map(
      trendResult[0].map((row) => [
        String(row.activityDate).slice(0, 10),
        Number(row.readingRecords),
      ])
    );

    const activityTrend = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dateKey = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      activityTrend.push({
        date: dateKey,
        readingRecords: activityMap.get(dateKey) || 0,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalReaders: Number(readers.totalReaders),
          totalArticles: Number(articles.totalArticles),
          publishedArticles: Number(articles.publishedArticles),
          draftArticles: Number(articles.draftArticles),
          scheduledArticles: Number(articles.scheduledArticles),
          totalBookmarks: Number(bookmarks.totalBookmarks),
          totalReadingRecords: Number(history.totalReadingRecords),
          totalFeedback,
          helpful: Number(feedback.helpful),
          notHelpful: Number(feedback.notHelpful),
          helpfulPercentage,
        },

        activityTrend,

        topReadArticles: topReadResult[0].map((row) => ({
          ...row,
          readingRecords: Number(row.readingRecords),
        })),

        topBookmarkedArticles: topBookmarkResult[0].map((row) => ({
          ...row,
          bookmarkCount: Number(row.bookmarkCount),
        })),

        recentActivity: recentActivityResult[0],
      },
    });
  } catch (error) {
    console.error("ADMIN ANALYTICS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin analytics.",
    });
  }
}

module.exports = {
  getAdminAnalytics,
};
