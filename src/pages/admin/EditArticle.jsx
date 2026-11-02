
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  adminRequest,
  getAdminArticles,
} from "../../services/adminApi";

import "./ArticleEditor.css";

function toLocalDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
}

function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    excerpt: "",
    cover_image: "",
    content: "",
    is_featured: false,
    scheduled_at: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStatus, setCurrentStatus] = useState("draft");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const loadArticle = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem(
        "scrolltheory_admin_token"
      );

      if (!token) {
        navigate("/admin/login");
        return;
      }

      const response = await getAdminArticles(token);
      const articles = response.articles || response.data || [];

      const article = articles.find(
        (item) => String(item.id) === String(id)
      );

      if (!article) {
        setError("Article not found.");
        return;
      }

      setCurrentStatus(article.status || "draft");

      setForm({
        title: article.title || "",
        slug: article.slug || "",
        category: article.category || "",
        excerpt: article.excerpt || "",
        cover_image: article.cover_image || "",
        content: article.content || "",
        is_featured: Boolean(Number(article.is_featured)),
        scheduled_at: toLocalDateTime(article.published_at),
      });
    } catch (err) {
      setError(err.message || "Failed to load article.");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  const handleSave = async (status) => {
    setError("");
    setSuccess("");

    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    if (!form.content.trim()) {
      setError("Article content is required.");
      return;
    }

    if (status === "scheduled") {
      if (!form.scheduled_at) {
        setError("Select a schedule date and time.");
        return;
      }

      if (new Date(form.scheduled_at).getTime() <= Date.now()) {
        setError("Choose a future schedule time.");
        return;
      }
    }

    const token = localStorage.getItem(
      "scrolltheory_admin_token"
    );

    if (!token) {
      navigate("/admin/login");
      return;
    }

    const publishedAt =
      status === "scheduled"
        ? new Date(form.scheduled_at).toISOString()
        : status === "published"
          ? new Date().toISOString()
          : null;

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category: form.category.trim(),
      excerpt: form.excerpt.trim(),
      cover_image: form.cover_image.trim() || null,
      content: form.content.trim(),
      is_featured: form.is_featured ? 1 : 0,
      status,
      published_at: publishedAt,
    };

    try {
      setSaving(true);

      await adminRequest(
        `/api/articles/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        token
      );

      setCurrentStatus(status);

      setSuccess(
        status === "draft"
          ? "Article saved as draft."
          : status === "published"
            ? "Article published successfully."
            : "Article scheduled successfully."
      );

      setTimeout(() => {
        navigate("/admin/articles");
      }, 900);
    } catch (err) {
      setError(err.message || "Failed to update article.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="st-editor">Loading article...</main>;
  }

  if (error === "Article not found.") {
    return (
      <main className="st-editor">
        <h2>Article not found</h2>
        <button
          className="st-editor-back"
          onClick={() => navigate("/admin/articles")}
        >
          Back to Articles
        </button>
      </main>
    );
  }

  return (
    <main className="st-editor">
      <div className="st-editor-header">
        <div>
          <span className="st-editor-eyebrow">
            CONTENT STUDIO / EDIT ARTICLE
          </span>

          <h1>Edit Story.</h1>

          <p>
            Update your story and manage its publishing status.
          </p>

          <p>
            Current status: <strong>{currentStatus}</strong>
          </p>
        </div>

        <button
          className="st-editor-back"
          onClick={() => navigate("/admin/articles")}
        >
          ← Back to Articles
        </button>
      </div>

      {error && error !== "Article not found." && (
        <div className="st-editor-message error">{error}</div>
      )}

      {success && (
        <div className="st-editor-message success">{success}</div>
      )}

      <div className="st-editor-grid">
        <section className="st-editor-main-card">
          <div className="st-editor-field">
            <label>Article Title *</label>
            <input
              value={form.title}
              maxLength={255}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>

          <div className="st-editor-field">
            <label>Slug *</label>
            <input
              value={form.slug}
              onChange={(e) =>
                updateField(
                  "slug",
                  e.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9\s-]/g, "")
                    .replace(/\s+/g, "-")
                    .replace(/-+/g, "-")
                )
              }
            />
          </div>

          <div className="st-editor-field">
            <label>Category</label>
            <input
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
            />
          </div>

          <div className="st-editor-field">
            <label>Excerpt</label>
            <textarea
              rows={3}
              maxLength={500}
              value={form.excerpt}
              onChange={(e) => updateField("excerpt", e.target.value)}
            />
          </div>

          <div className="st-editor-field">
            <label>Cover Image URL</label>
            <input
              type="url"
              value={form.cover_image}
              onChange={(e) =>
                updateField("cover_image", e.target.value)
              }
            />

            {form.cover_image && (
              <div className="st-editor-image-preview">
                <img
                  src={form.cover_image}
                  alt="Cover preview"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="st-editor-field">
            <label>Story Content *</label>
            <textarea
              rows={16}
              className="st-editor-content"
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
            />
          </div>
        </section>

        <aside className="st-editor-side-card">
          <h3>Publishing</h3>

          <div className="st-editor-featured">
            <label>
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) =>
                  updateField("is_featured", e.target.checked)
                }
              />
              <span>Featured Story</span>
            </label>

            <p>Highlight this story on your publication.</p>
          </div>

          <div className="st-editor-field">
            <label>Schedule Date & Time</label>
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) =>
                updateField("scheduled_at", e.target.value)
              }
            />
          </div>

          <div className="st-editor-actions">
            <button
              className="st-editor-draft"
              disabled={saving}
              onClick={() => handleSave("draft")}
            >
              Save as Draft
            </button>

            <button
              className="st-editor-publish"
              disabled={saving}
              onClick={() => handleSave("published")}
            >
              {saving ? "Saving..." : "Publish Now"}
            </button>

            <button
              className="st-editor-schedule"
              disabled={saving}
              onClick={() => handleSave("scheduled")}
            >
              Schedule Article
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default EditArticle;
