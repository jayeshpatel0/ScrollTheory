
const { pool } = require("../config/db");

let schedulerRunning = false;
let timer = null;

// Publish scheduled articles when their time arrives
async function publishScheduledArticles() {
  if (schedulerRunning) return;

  schedulerRunning = true;

  try {
    const [result] = await pool.query(
      `UPDATE articles
       SET status = 'published'
       WHERE status = 'scheduled'
       AND published_at IS NOT NULL
       AND published_at <= NOW()`
    );

    if (result.affectedRows > 0) {
      console.log(
        `${result.affectedRows} scheduled article(s) published.`
      );
    }
  } catch (error) {
    console.error(
      "SCHEDULED PUBLISH ERROR:",
      error.message
    );
  } finally {
    schedulerRunning = false;
  }
}

function startScheduler() {
  if (timer) return;

  console.log("Article scheduler started.");

  // Check once on startup
  publishScheduledArticles();

  // Check every 60 seconds
  timer = setInterval(
    publishScheduledArticles,
    60 * 1000
  );
}

function stopScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  startScheduler,
  stopScheduler,
};
