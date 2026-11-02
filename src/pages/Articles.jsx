
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Articles.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function getImageUrl(image) {
  if (!image) return "";

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${API_URL}/${image.replace(/^\/+/, "")}`;
}

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getReadTime(content = "") {
  const text = content.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchArticles() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/articles`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load articles.");
        }

        const result = await response.json();

        const data = Array.isArray(result)
          ? result
          : result.articles || [];

        setArticles(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "Something went wrong while loading stories."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchArticles();

    return () => controller.abort();
  }, []);

  // Build categories from published articles
  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        articles
          .map((article) => article.category?.trim())
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [articles]);

  // Search and filter
  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === "All" ||
        article.category === activeCategory;

      const matchesSearch =
        !query ||
        [
          article.title,
          article.excerpt,
          article.category,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query)
        );

      return matchesCategory && matchesSearch;
    });
  }, [articles, search, activeCategory]);

  return (
    <main className="st-articles-page">

      {/* Page Hero */}
      <section className="st-articles-hero">
        <span className="st-articles-eyebrow">
          THE SCROLLTHEORY JOURNAL
        </span>

        <h1>
          Stories worth
          <br />
          <em>your scroll.</em>
        </h1>

        <p>
          Ideas, perspectives and stories for curious minds.
          Take your time. Find something meaningful.
        </p>

        <div className="st-articles-count">
          {loading
            ? "Discovering stories..."
            : `${articles.length} ${articles.length === 1 ? "story" : "stories"} published`}
        </div>
      </section>

      {/* Search */}
      <section className="st-articles-toolbar">
        <div className="st-articles-search">
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            placeholder="Search stories..."
            aria-label="Search stories"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="st-articles-filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "st-filter-btn active"
                  : "st-filter-btn"
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Articles */}
      <section className="st-articles-content">

        {loading && (
          <div className="st-articles-message">
            <div className="st-articles-loader" />
            <p>Finding thoughtful stories for you...</p>
          </div>
        )}

        {!loading && error && (
          <div className="st-articles-message">
            <h2>Stories are taking a little break.</h2>
            <p>{error}</p>

            <button
              type="button"
              className="st-articles-retry"
              onClick={() => window.location.reload()}
            >
              Try Again ↗
            </button>
          </div>
        )}

        {!loading && !error && filteredArticles.length === 0 && (
          <div className="st-articles-message">
            <span className="st-articles-empty-icon">✦</span>
            <h2>No stories found.</h2>
            <p>
              Try another keyword or select a different category.
            </p>

            <button
              type="button"
              className="st-articles-retry"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            >
              Clear Filters ↗
            </button>
          </div>
        )}

        {!loading && !error && filteredArticles.length > 0 && (
          <>
            <div className="st-articles-results">
              <span>
                {search || activeCategory !== "All"
                  ? `${filteredArticles.length} matching stories`
                  : "EXPLORE THE JOURNAL"}
              </span>
            </div>

            <div className="st-articles-grid">
              {filteredArticles.map((article) => (
                <article
                  className="st-article-card"
                  key={article.id || article.slug}
                >
                  <Link
                    to={`/articles/${encodeURIComponent(article.slug)}`}
                    className="st-article-image-link"
                    aria-label={`Read ${article.title}`}
                  >
                    <div className="st-article-image">
                      {article.cover_image ? (
                        <img
                          src={getImageUrl(article.cover_image)}
                          alt={article.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="st-article-image-placeholder">
                          <span>SCROLLTHEORY</span>
                          <span>✦</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="st-article-info">
                    <div className="st-article-card-meta">
                      <span className="st-article-category">
                        {article.category || "Journal"}
                      </span>

                      {article.published_at && (
                        <>
                          <span className="st-article-dot">·</span>
                          <time dateTime={article.published_at}>
                            {formatDate(article.published_at)}
                          </time>
                        </>
                      )}
                    </div>

                    <Link
                      to={`/articles/${encodeURIComponent(article.slug)}`}
                      className="st-article-title-link"
                    >
                      <h2>{article.title}</h2>
                    </Link>

                    {article.excerpt && (
                      <p className="st-article-excerpt">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="st-article-card-footer">
                      <span>
                        {getReadTime(article.content)} min read
                      </span>

                      <Link
                        to={`/articles/${encodeURIComponent(article.slug)}`}
                        className="st-article-read-link"
                      >
                        Read Story ↗
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Bottom Note */}
      {!loading && !error && articles.length > 0 && (
        <footer className="st-articles-footer">
          <span>✦</span>
          <p>
            Read slowly. Think deeply. Stay curious.
          </p>
        </footer>
      )}
    </main>
  );
}
