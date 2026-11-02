
const { pool } = require("../config/db");

// ------------------------------
// Helper: Create URL-friendly slug
// ------------------------------
function makeSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 240)
    .replace(/-+$/g, "");
}

// ------------------------------
// Helper: Validate article data
// ------------------------------
const allowedStatuses = ["draft", "published", "scheduled"];

function prepareArticle(body, isUpdate = false) {
  const {
    title,
    category,
    excerpt,
    cover_image,
    content,
    status,
    is_featured,
    published_at,
  } = body;

  if (!isUpdate || title !== undefined) {
    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 255
    ) {
      throw new Error("Title is required (max 255 characters).");
    }
  }

  if (!isUpdate || category !== undefined) {
    if (
      typeof category !== "string" ||
      !category.trim() ||
      category.trim().length > 100
    ) {
      throw new Error("Valid category is required.");
    }
  }

  if (!isUpdate || content !== undefined) {
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("Article content is required.");
    }
  }

  if (status !== undefined && !allowedStatuses.includes(status)) {
    throw new Error("Invalid article status.");
  }

  if (
    excerpt !== undefined &&
    excerpt !== null &&
    typeof excerpt !== "string"
  ) {
    throw new Error("Invalid excerpt.");
  }

  if (
    cover_image !== undefined &&
    cover_image !== null &&
    typeof cover_image !== "string"
  ) {
    throw new Error("Invalid cover image URL.");
  }

  if (
    is_featured !== undefined &&
    ![true, false, 0, 1].includes(is_featured)
  ) {
    throw new Error("Invalid featured value.");
  }

  let publishDate = null;

  if (published_at !== undefined && published_at !== null && published_at !== "") {
    if (typeof published_at !== "string") {
      throw new Error("Invalid publish date.");
    }

    const parsed = new Date(published_at);

    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid publish date.");
    }

    publishDate = parsed;
  }

  const finalStatus = status || "draft";

  if (finalStatus === "scheduled" && !publishDate) {
    throw new Error("Scheduled articles require a publish date.");
  }

  if (finalStatus === "published" && !publishDate) {
    publishDate = new Date();
  }

  return {
    title: title?.trim(),
    category: category?.trim(),
    excerpt: excerpt === undefined ? undefined : excerpt,
    cover_image:
      cover_image === undefined ? undefined : cover_image,
    content: content?.trim(),
    status: finalStatus,
    is_featured:
      is_featured === undefined
        ? undefined
        : Number(is_featured),
    published_at: publishDate,
  };
}

// ------------------------------
// GET: Public published articles
// GET /api/articles
// ------------------------------
exports.getPublishedArticles = async (req, res) => {
  try {
    const [articles] = await pool.query(
      `SELECT
        id, title, slug, category, excerpt,
        cover_image, content, is_featured,
        published_at, created_at, updated_at
       FROM articles
       WHERE status = 'published'
       AND published_at <= NOW()
       ORDER BY is_featured DESC, published_at DESC`
    );

    return res.json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error("PUBLIC ARTICLES ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch articles.",
    });
  }
};

// ------------------------------
// GET: Public article by slug
// GET /api/articles/slug/:slug
// ------------------------------
exports.getArticleBySlug = async (req, res) => {
  try {
    const [articles] = await pool.query(
      `SELECT
        id, title, slug, category, excerpt,
        cover_image, content, is_featured,
        published_at, created_at, updated_at
       FROM articles
       WHERE slug = ?
       AND status = 'published'
       AND published_at <= NOW()
       LIMIT 1`,
      [req.params.slug]
    );

    if (!articles.length) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    return res.json({
      success: true,
      article: articles[0],
    });
  } catch (error) {
    console.error("ARTICLE DETAILS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch article.",
    });
  }
};

// ------------------------------
// GET: All articles for admin
// GET /api/articles/admin/all
// ------------------------------
exports.getAdminArticles = async (req, res) => {
  try {
    const [articles] = await pool.query(
      `SELECT
        a.*,
        ad.name AS author_name
       FROM articles a
       LEFT JOIN admins ad ON a.author_id = ad.id
       ORDER BY a.updated_at DESC`
    );

    return res.json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error("ADMIN ARTICLES ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch admin articles.",
    });
  }
};

// ------------------------------
// POST: Create article
// POST /api/articles
// ------------------------------
exports.createArticle = async (req, res) => {
  try {
    const article = prepareArticle(req.body);

    const baseSlug = makeSlug(article.title);

    if (!baseSlug) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid title.",
      });
    }

    // Generate unique slug
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const [existing] = await pool.query(
        "SELECT id FROM articles WHERE slug = ? LIMIT 1",
        [slug]
      );

      if (!existing.length) break;

      counter++;
      slug = `${baseSlug.slice(0, 270)}-${counter}`;
    }

    const [result] = await pool.query(
      `INSERT INTO articles
      (
        title, slug, category, excerpt,
        cover_image, content, status,
        is_featured, author_id, published_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        article.title,
        slug,
        article.category,
        article.excerpt ?? null,
        article.cover_image ?? null,
        article.content,
        article.status,
        article.is_featured ?? 0,
        req.admin.id,
        article.published_at,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Article created successfully.",
      article: {
        id: result.insertId,
        title: article.title,
        slug,
        status: article.status,
      },
    });
  } catch (error) {
    if (error.message.startsWith("Title") ||
        error.message.startsWith("Valid") ||
        error.message.startsWith("Article") ||
        error.message.startsWith("Invalid") ||
        error.message.startsWith("Scheduled")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("CREATE ARTICLE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create article.",
    });
  }
};

// ------------------------------
// PUT: Update article
// PUT /api/articles/:id
// ------------------------------
exports.updateArticle = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID.",
      });
    }

    const [rows] = await pool.query(
      "SELECT * FROM articles WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    const current = rows[0];
    const updates = prepareArticle(req.body, true);

    const title = updates.title ?? current.title;
    const category = updates.category ?? current.category;
    const excerpt = updates.excerpt === undefined
      ? current.excerpt : updates.excerpt;
    const coverImage = updates.cover_image === undefined
      ? current.cover_image : updates.cover_image;
    const content = updates.content ?? current.content;
    const status = req.body.status ?? current.status;
    const featured = updates.is_featured ?? current.is_featured;

    let publishedAt;

    if (req.body.status !== undefined) {
      publishedAt = updates.published_at;

      if (status === "draft") {
        publishedAt = null;
      }

      if (status === "published" && !publishedAt) {
        publishedAt = new Date();
      }
    } else if (req.body.published_at !== undefined) {
      publishedAt = updates.published_at;
    } else {
      publishedAt = current.published_at;
    }

    if (status === "scheduled" && !publishedAt) {
      return res.status(400).json({
        success: false,
        message: "Scheduled articles require a publish date.",
      });
    }

    // Update slug if title changes
    let slug = current.slug;

    if (req.body.title !== undefined) {
      const baseSlug = makeSlug(title);

      if (!baseSlug) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid title.",
        });
      }

      slug = baseSlug;
      let counter = 1;

      while (true) {
        const [existing] = await pool.query(
          "SELECT id FROM articles WHERE slug = ? AND id != ? LIMIT 1",
          [slug, id]
        );

        if (!existing.length) break;

        counter++;
        slug = `${baseSlug.slice(0, 270)}-${counter}`;
      }
    }

    await pool.query(
      `UPDATE articles SET
        title = ?,
        slug = ?,
        category = ?,
        excerpt = ?,
        cover_image = ?,
        content = ?,
        status = ?,
        is_featured = ?,
        published_at = ?
       WHERE id = ?`,
      [
        title,
        slug,
        category,
        excerpt,
        coverImage,
        content,
        status,
        featured,
        publishedAt,
        id,
      ]
    );

    return res.json({
      success: true,
      message: "Article updated successfully.",
      article: {
        id,
        title,
        slug,
        status,
      },
    });
  } catch (error) {
    console.error("UPDATE ARTICLE ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update article.",
    });
  }
};

// ------------------------------
// DELETE: Remove article
// DELETE /api/articles/:id
// ------------------------------
exports.deleteArticle = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID.",
      });
    }

    const [result] = await pool.query(
      "DELETE FROM articles WHERE id = ?",
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    return res.json({
      success: true,
      message: "Article deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ARTICLE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete article.",
    });
  }
};
