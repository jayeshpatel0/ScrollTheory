
const { pool } = require("../config/db");

// Helper: Validate optional URL
function validateOptionalUrl(value, fieldName, maxLength) {
  if (value === null || value === undefined || value === "") {
    return { valid: true, value: null };
  }

  if (typeof value !== "string") {
    return { valid: false, message: `${fieldName} must be a string.` };
  }

  const url = value.trim();

  if (url.length > maxLength) {
    return {
      valid: false,
      message: `${fieldName} is too long.`,
    };
  }

  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        valid: false,
        message: `${fieldName} must use HTTP or HTTPS.`,
      };
    }

    return { valid: true, value: url };
  } catch {
    return {
      valid: false,
      message: `${fieldName} must be a valid URL.`,
    };
  }
}

// Helper: Validate article ID
function parseArticleId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

// GET /api/admin/seo/articles/:articleId
exports.getArticleSeo = async (req, res) => {
  try {
    const articleId = parseArticleId(req.params.articleId);

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID.",
      });
    }

    const [rows] = await pool.execute(
      `SELECT
          a.id AS article_id,
          a.title,
          a.slug,
          a.status,
          s.meta_title,
          s.meta_description,
          s.focus_keyword,
          s.canonical_url,
          s.social_image_url,
          s.robots_index,
          s.robots_follow,
          s.updated_at
       FROM articles a
       LEFT JOIN article_seo s
         ON s.article_id = a.id
       WHERE a.id = ?
       LIMIT 1`,
      [articleId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    const article = rows[0];

    return res.json({
      success: true,
      seo: {
        article_id: article.article_id,
        title: article.title,
        slug: article.slug,
        status: article.status,
        meta_title: article.meta_title || "",
        meta_description: article.meta_description || "",
        focus_keyword: article.focus_keyword || "",
        canonical_url: article.canonical_url || "",
        social_image_url: article.social_image_url || "",
        robots_index:
          article.robots_index == null
            ? 1
            : Number(article.robots_index),
        robots_follow:
          article.robots_follow == null
            ? 1
            : Number(article.robots_follow),
        updated_at: article.updated_at,
      },
    });
  } catch (error) {
    console.error("GET ARTICLE SEO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load SEO settings.",
    });
  }
};

// PUT /api/admin/seo/articles/:articleId
exports.updateArticleSeo = async (req, res) => {
  try {
    const articleId = parseArticleId(req.params.articleId);

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID.",
      });
    }

    const {
      meta_title,
      meta_description,
      focus_keyword,
      canonical_url,
      social_image_url,
      robots_index,
      robots_follow,
    } = req.body || {};

    // Validate text fields
    const fields = [
      ["meta_title", meta_title, 255],
      ["meta_description", meta_description, 320],
      ["focus_keyword", focus_keyword, 150],
    ];

    const values = {};

    for (const [name, value, maxLength] of fields) {
      if (value !== undefined && value !== null &&
          typeof value !== "string") {
        return res.status(400).json({
          success: false,
          message: `${name} must be a string.`,
        });
      }

      const clean = value == null ? "" : value.trim();

      if (clean.length > maxLength) {
        return res.status(400).json({
          success: false,
          message: `${name} exceeds ${maxLength} characters.`,
        });
      }

      values[name] = clean || null;
    }

    // Validate URLs
    const canonical = validateOptionalUrl(
      canonical_url,
      "canonical_url",
      2048
    );

    if (!canonical.valid) {
      return res.status(400).json({
        success: false,
        message: canonical.message,
      });
    }

    // URL length limit for social image
    const socialImage = validateOptionalUrl(
      social_image_url,
      "social_image_url",
      2048
    );

    if (!socialImage.valid) {
      return res.status(400).json({
        success: false,
        message: socialImage.message,
      });
    }

    // Boolean validation: only 0/1 or true/false
    function parseBooleanFlag(value, fieldName) {
      if (value === true || value === 1 || value === "1") {
        return 1;
      }

      if (value === false || value === 0 || value === "0") {
        return 0;
      }

      throw new Error(`INVALID_${fieldName}`);
    }

    let indexFlag;
    let followFlag;

    try {
      indexFlag = parseBooleanFlag(robots_index, "ROBOTS_INDEX");
      followFlag = parseBooleanFlag(robots_follow, "ROBOTS_FOLLOW");
    } catch {
      return res.status(400).json({
        success: false,
        message: "Robots flags must be true, false, 1 or 0.",
      });
    }

    // Confirm article exists
    const [articles] = await pool.execute(
      "SELECT id FROM articles WHERE id = ? LIMIT 1",
      [articleId]
    );

    if (!articles.length) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    // Insert or update SEO settings
    await pool.execute(
      `INSERT INTO article_seo (
          article_id,
          meta_title,
          meta_description,
          focus_keyword,
          canonical_url,
          social_image_url,
          robots_index,
          robots_follow
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
          meta_title = VALUES(meta_title),
          meta_description = VALUES(meta_description),
          focus_keyword = VALUES(focus_keyword),
          canonical_url = VALUES(canonical_url),
          social_image_url = VALUES(social_image_url),
          robots_index = VALUES(robots_index),
          robots_follow = VALUES(robots_follow)`,
      [
        articleId,
        values.meta_title,
        values.meta_description,
        values.focus_keyword,
        canonical.value,
        socialImage.value,
        indexFlag,
        followFlag,
      ]
    );

    return res.json({
      success: true,
      message: "SEO settings saved successfully.",
    });
  } catch (error) {
    console.error("UPDATE ARTICLE SEO ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save SEO settings.",
    });
  }
};
