
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminArticles,
} from "../../services/adminApi";
import "./ArticleManagement.css";

function ArticleManagement() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const loadArticles = useCallback(async () => {
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

      const data = response.articles || response.data || [];

      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load articles.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      (article.title || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (article.category || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      status === "all" ||
      article.status?.toLowerCase() === status;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (article) => {
    const confirmed = window.confirm(
      `Delete "${article.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem(
        "scrolltheory_admin_token"
      );

      const { adminRequest } = await import(
        "../../services/adminApi"
      );

      await adminRequest(
        `/api/articles/${article.id}`,
        { method: "DELETE" },
        token
      );

      setArticles((prev) =>
        prev.filter((item) => item.id !== article.id)
      );
    } catch (err) {
      alert(err.message || "Could not delete article.");
    }
  };

  const counts = {
    all: articles.length,
    published: articles.filter(
      (a) => a.status === "published"
    ).length,
    draft: articles.filter(
      (a) => a.status === "draft"
    ).length,
    scheduled: articles.filter(
      (a) => a.status === "scheduled"
    ).length,
  };

  return (
    <main className="article-management">
      <div className="article-page-header">
        <div>
          <span className="article-eyebrow">
            CONTENT STUDIO
          </span>
          <h1>Articles</h1>
          <p>
            Create, organize and manage your publication stories.
          </p>
        </div>

        <button
          className="article-create-btn"
          onClick={() => navigate("/admin/articles/new")}
        >
          <span>+</span> New Article
        </button>
      </div>

      <section className="article-stats">
        {[
          ["All Articles", counts.all],
          ["Published", counts.published],
          ["Drafts", counts.draft],
          ["Scheduled", counts.scheduled],
        ].map(([label, value]) => (
          <div className="article-stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section className="article-content-card">
        <div className="article-toolbar">
          <div className="article-search">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search articles or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter articles by status"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <button
            className="article-refresh-btn"
            onClick={loadArticles}
            title="Refresh articles"
          >
            ↻
          </button>
        </div>

        {error && (
          <div className="article-error">
            <p>{error}</p>
            <button onClick={loadArticles}>Try again</button>
          </div>
        )}

        {loading ? (
          <div className="article-empty">
            Loading articles...
          </div>
        ) : !error && filteredArticles.length === 0 ? (
          <div className="article-empty">
            <div className="article-empty-icon">✦</div>
            <h3>No articles found</h3>
            <p>
              {search || status !== "all"
                ? "Try changing your search or filter."
                : "Start your publication journey by creating your first story."}
            </p>

            {!search && status === "all" && (
              <button
                className="article-create-btn"
                onClick={() => navigate("/admin/articles/new")}
              >
                + Create First Article
              </button>
            )}
          </div>
        ) : (
          <div className="article-table-wrap">
            <table className="article-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredArticles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <div className="article-title-cell">
                        {article.cover_image ? (
                          <img
                            src={article.cover_image}
                            alt=""
                            className="article-thumb"
                          />
                        ) : (
                          <div className="article-thumb article-thumb-placeholder">
                            ST
                          </div>
                        )}

                        <div>
                          <strong>{article.title}</strong>
                          <small>
                            /{article.slug}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>{article.category || "Uncategorized"}</td>

                    <td>
                      <span
                        className={`article-status status-${article.status}`}
                      >
                        {article.status}
                      </span>
                    </td>

                    <td>
                      {Number(article.is_featured)
                        ? "★ Featured"
                        : "—"}
                    </td>


                    <td>
                      <div className="article-actions">
                        <button
                          onClick={() =>
                            navigate(`/admin/articles/${article.id}/edit`)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="article-seo-btn"
                          onClick={() =>
                            navigate(`/admin/articles/${article.id}/seo`)
                          }
                        >
                          SEO Settings
                        </button>

                        <button
                          className="article-delete-btn"
                          title="Delete article"
                          onClick={() => handleDelete(article)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredArticles.length > 0 && (
          <div className="article-table-footer">
            Showing {filteredArticles.length} of {articles.length} articles
          </div>
        )}
      </section>
    </main>
  );
}

export default ArticleManagement;
