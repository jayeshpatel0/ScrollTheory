
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminRequest } from "../../services/adminApi";
import "./ArticleEditor.css";

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function ArticleEditor() {
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

  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTitleChange = (value) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugEdited ? prev.slug : createSlug(value),
    }));
  };

  const handleSubmit = async (status) => {
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Please enter article title.");
      return;
    }

    if (!form.content.trim()) {
      setError("Please write your article content.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Please enter a valid slug.");
      return;
    }

    if (status === "scheduled") {
      if (!form.scheduled_at) {
        setError("Please select a schedule date and time.");
        return;
      }

      if (new Date(form.scheduled_at).getTime() <= Date.now()) {
        setError("Please select a future date and time.");
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
        "/api/articles",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        token
      );

      setSuccess(
        status === "draft"
          ? "Article saved as draft!"
          : status === "published"
            ? "Article published successfully!"
            : "Article scheduled successfully!"
      );

      setTimeout(() => {
        navigate("/admin/articles");
      }, 900);
    } catch (err) {
      setError(err.message || "Could not save article.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="st-editor">
      <div className="st-editor-header">
        <div>
          <span className="st-editor-eyebrow">
            CONTENT STUDIO / ARTICLES
          </span>
          <h1>Write a Story.</h1>
          <p>
            Every great publication starts with a thoughtful idea.
          </p>
        </div>

        <button
          className="st-editor-back"
          onClick={() => navigate("/admin/articles")}
        >
          ← Back to Articles
        </button>
      </div>

      {error && (
        <div className="st-editor-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="st-editor-message success">
          {success}
        </div>
      )}

      <div className="st-editor-grid">
        <section className="st-editor-main-card">
          <div className="st-editor-field">
            <label>Article Title *</label>
            <input
              type="text"
              placeholder="Give your story a memorable title..."
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="st-editor-field">
            <label>Article Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => {
                setSlugEdited(true);
                updateField("slug", createSlug(e.target.value));
              }}
              placeholder="your-story-slug"
            />
            <small>
              Website URL: /articles/{form.slug || "your-story"}
            </small>
          </div>

          <div className="st-editor-field">
            <label>Category</label>
            <input
              type="text"
              placeholder="Culture, Technology, Lifestyle..."
              value={form.category}
              onChange={(e) =>
                updateField("category", e.target.value)
              }
              maxLength={100}
            />
          </div>

          <div className="st-editor-field">
            <label>Short Excerpt</label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="A short introduction to your story..."
              value={form.excerpt}
              onChange={(e) =>
                updateField("excerpt", e.target.value)
              }
            />
            <small>{form.excerpt.length}/500</small>
          </div>

          <div className="st-editor-field">
            <label>Cover Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
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
              className="st-editor-content"
              rows={16}
              placeholder="Start writing your story here..."
              value={form.content}
              onChange={(e) =>
                updateField("content", e.target.value)
              }
            />
            <small>
              Plain text editor for now. Rich text formatting will be added later.
            </small>
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
            <p>Highlight this story in featured sections.</p>
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
            <small>
              Choose a future time for scheduled publishing.
            </small>
          </div>

          <div className="st-editor-actions">
            <button
              className="st-editor-draft"
              disabled={saving}
              onClick={() => handleSubmit("draft")}
            >
              Save Draft
            </button>

            <button
              className="st-editor-publish"
              disabled={saving}
              onClick={() => handleSubmit("published")}
            >
              {saving ? "Saving..." : "Publish Now"}
            </button>

            <button
              className="st-editor-schedule"
              disabled={saving}
              onClick={() => handleSubmit("scheduled")}
            >
              Schedule Article
            </button>
          </div>

          <p className="st-editor-note">
            Drafts remain unpublished. Scheduled stories become
            public when the publishing scheduler processes them.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default ArticleEditor;
    