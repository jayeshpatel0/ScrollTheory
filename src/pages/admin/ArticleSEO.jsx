
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Save,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import "./ArticleSEO.css";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const EMPTY_SEO = {
  meta_title: "",
  meta_description: "",
  focus_keyword: "",
  canonical_url: "",
  social_image_url: "",
  robots_index: 1,
  robots_follow: 1,
};

export default function ArticleSEO() {
  const { articleId } = useParams();
  const navigate = useNavigate();

  const [seo, setSeo] = useState(EMPTY_SEO);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token = localStorage.getItem("scrolltheory_admin_token");

  const updateField = (name, value) => {
    setSeo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loadSEO = async () => {
    try {
      setLoading(true);
      setError("");
      setNotice("");

      if (!token) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await fetch(
        `${API_BASE}/admin/seo/articles/${articleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("scrolltheory_admin_token");
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load SEO settings.");
      }

      setArticle({
        id: result.seo.article_id,
        title: result.seo.title,
        slug: result.seo.slug,
        status: result.seo.status,
      });

      setSeo({
        meta_title: result.seo.meta_title || "",
        meta_description: result.seo.meta_description || "",
        focus_keyword: result.seo.focus_keyword || "",
        canonical_url: result.seo.canonical_url || "",
        social_image_url: result.seo.social_image_url || "",
        robots_index: Number(result.seo.robots_index),
        robots_follow: Number(result.seo.robots_follow),
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSEO();
  }, [articleId]);

  const saveSEO = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setNotice("");

      const response = await fetch(
        `${API_BASE}/admin/seo/articles/${articleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(seo),
        }
      );

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("scrolltheory_admin_token");
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save SEO.");
      }

      setNotice("SEO settings saved successfully.");
    } catch (err) {
      setError(err.message || "Unable to save SEO settings.");
    } finally {
      setSaving(false);
    }
  };

  const previewTitle =
    seo.meta_title.trim() || article?.title || "Article title";

  const previewDescription =
    seo.meta_description.trim() ||
    "Add a meta description to preview your article here.";

  const previewUrl = seo.canonical_url.trim()
    ? seo.canonical_url.trim()
    : article?.slug
      ? `https://scrolltheory.netlify.app/articles/${article.slug}`
      : "https://scrolltheory.netlify.app/articles/your-story";

  const titleCount = seo.meta_title.length;
  const descriptionCount = seo.meta_description.length;

  if (loading) {
    return (
      <div className="seo-state">
        <RefreshCw className="seo-spin" size={24} />
        <p>Loading SEO settings...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="seo-state">
        <AlertCircle size={26} />
        <p>{error || "Article not found."}</p>
        <button onClick={() => navigate("/admin/articles")}>
          Back to articles
        </button>
      </div>
    );
  }

  return (
    <div className="seo-page">
      <div className="seo-top">
        <button
          type="button"
          className="seo-back"
          onClick={() => navigate("/admin/articles")}
        >
          <ArrowLeft size={17} />
          Back to Articles
        </button>

        <div>
          <span className="seo-eyebrow">SEARCH OPTIMIZATION</span>
          <h1>Article SEO</h1>
          <p>Optimize how your article appears in search engines.</p>
        </div>
      </div>

      <div className="seo-article-banner">
        <div className="seo-banner-icon">
          <Globe size={23} />
        </div>

        <div className="seo-banner-info">
          <span>Editing SEO for</span>
          <h2>{article.title}</h2>
          <small>
            /articles/{article.slug} · {article.status}
          </small>
        </div>
      </div>

      {error && (
        <div className="seo-alert seo-alert-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {notice && (
        <div className="seo-alert seo-alert-success">
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}

      <div className="seo-layout">
        <form className="seo-form" onSubmit={saveSEO}>
          <section className="seo-card">
            <div className="seo-card-heading">
              <div>
                <span className="seo-step">01</span>
                <h2>Search Appearance</h2>
              </div>
              <Search size={21} />
            </div>

            <div className="seo-field">
              <label htmlFor="meta_title">Meta Title</label>
              <input
                id="meta_title"
                type="text"
                maxLength={255}
                value={seo.meta_title}
                onChange={(e) =>
                  updateField("meta_title", e.target.value)
                }
                placeholder={article.title}
              />
              <div className="seo-field-bottom">
                <small>Recommended: around 50–60 characters.</small>
                <span className={titleCount > 60 ? "seo-warn" : ""}>
                  {titleCount}/255
                </span>
              </div>
            </div>

            <div className="seo-field">
              <label htmlFor="meta_description">Meta Description</label>
              <textarea
                id="meta_description"
                rows={4}
                maxLength={320}
                value={seo.meta_description}
                onChange={(e) =>
                  updateField("meta_description", e.target.value)
                }
                placeholder="Write a compelling summary of your article..."
              />
              <div className="seo-field-bottom">
                <small>Recommended: around 140–160 characters.</small>
                <span className={descriptionCount > 160 ? "seo-warn" : ""}>
                  {descriptionCount}/320
                </span>
              </div>
            </div>

            <div className="seo-field">
              <label htmlFor="focus_keyword">Focus Keyword</label>
              <input
                id="focus_keyword"
                type="text"
                maxLength={150}
                value={seo.focus_keyword}
                onChange={(e) =>
                  updateField("focus_keyword", e.target.value)
                }
                placeholder="e.g. technology stories"
              />
              <small className="seo-help">
                Editorial reference only; this is not a ranking guarantee.
              </small>
            </div>
          </section>

          <section className="seo-card">
            <div className="seo-card-heading">
              <div>
                <span className="seo-step">02</span>
                <h2>URLs & Social Sharing</h2>
              </div>
              <Globe size={21} />
            </div>

            <div className="seo-field">
              <label htmlFor="canonical_url">Canonical URL</label>
              <input
                id="canonical_url"
                type="url"
                maxLength={2048}
                value={seo.canonical_url}
                onChange={(e) =>
                  updateField("canonical_url", e.target.value)
                }
                placeholder="https://your-domain.com/articles/your-story"
              />
              <small className="seo-help">
                Leave blank to use the production article URL.
              </small>
            </div>

            <div className="seo-field">
              <label htmlFor="social_image_url">Social Image URL</label>
              <input
                id="social_image_url"
                type="url"
                maxLength={2048}
                value={seo.social_image_url}
                onChange={(e) =>
                  updateField("social_image_url", e.target.value)
                }
                placeholder="https://your-domain.com/images/cover.jpg"
              />
              <small className="seo-help">
                Use an accessible, high-quality image.
              </small>
            </div>
          </section>

          <section className="seo-card">
            <div className="seo-card-heading">
              <div>
                <span className="seo-step">03</span>
                <h2>Search Engine Directives</h2>
              </div>
              <Eye size={21} />
            </div>

            <label className="seo-toggle">
              <div>
                <strong>Allow indexing</strong>
                <small>
                  Search engines may index this article.
                </small>
              </div>
              <input
                type="checkbox"
                checked={Boolean(seo.robots_index)}
                onChange={(e) =>
                  updateField("robots_index", e.target.checked ? 1 : 0)
                }
              />
            </label>

            <label className="seo-toggle">
              <div>
                <strong>Allow following links</strong>
                <small>
                  Search engines may follow links on this article.
                </small>
              </div>
              <input
                type="checkbox"
                checked={Boolean(seo.robots_follow)}
                onChange={(e) =>
                  updateField("robots_follow", e.target.checked ? 1 : 0)
                }
              />
            </label>

            {(!seo.robots_index || !seo.robots_follow) && (
              <div className="seo-warning-box">
                <AlertCircle size={18} />
                <span>
                  Custom robots directives can affect search visibility.
                  Verify your settings before publishing.
                </span>
              </div>
            )}
          </section>

          <div className="seo-form-actions">
            <button
              type="button"
              className="seo-btn-secondary"
              onClick={loadSEO}
              disabled={saving}
            >
              Reset
            </button>

            <button
              type="submit"
              className="seo-btn-primary"
              disabled={saving}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save SEO Settings"}
            </button>
          </div>
        </form>

        <aside className="seo-preview-column">
          <section className="seo-card seo-preview-card">
            <div className="seo-card-heading">
              <div>
                <span className="seo-step">PREVIEW</span>
                <h2>Search Result</h2>
              </div>
              <Eye size={21} />
            </div>

            <div className="seo-google-preview">
              <div className="seo-preview-site">
                <div className="seo-site-dot">S</div>
                <div>
                  <strong>ScrollTheory</strong>
                  <small>scrolltheory.netlify.app</small>
                </div>
              </div>

              <div className="seo-preview-url">{previewUrl}</div>

              <h3>{previewTitle}</h3>
              <p>{previewDescription}</p>
            </div>

            <p className="seo-preview-note">
              <AlertCircle size={15} />
              Search engines may rewrite titles and snippets.
            </p>
          </section>

          <section className="seo-card seo-check-card">
            <div className="seo-card-heading">
              <h2>SEO Checklist</h2>
            </div>

            {[
              {
                label: "Meta title added",
                done: Boolean(seo.meta_title.trim()),
              },
              {
                label: "Meta description added",
                done: Boolean(seo.meta_description.trim()),
              },
              {
                label: "Focus keyword added",
                done: Boolean(seo.focus_keyword.trim()),
              },
              {
                label: "Social image added",
                done: Boolean(seo.social_image_url.trim()),
              },
              {
                label: "Title length near recommendation",
                done:
                  titleCount >= 30 &&
                  titleCount <= 60,
              },
              {
                label: "Description length near recommendation",
                done:
                  descriptionCount >= 120 &&
                  descriptionCount <= 160,
              },
            ].map((item) => (
              <div className="seo-check-item" key={item.label}>
                <CheckCircle2
                  size={17}
                  className={item.done ? "seo-check-done" : ""}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}
