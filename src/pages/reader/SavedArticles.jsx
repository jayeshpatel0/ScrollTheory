
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Clock3,
  ArrowRight,
  Trash2,
  RefreshCw,
  Search,
} from "lucide-react";
import { readerApi } from "../../services/readerApi";
import "./SavedArticles.css";

export default function SavedArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingIds, setRemovingIds] = useState([]);
  const [search, setSearch] = useState("");

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await readerApi.getBookmarks();

      const list = Array.isArray(data)
        ? data
        : data.bookmarks || data.articles || [];

      setArticles(list);
    } catch (err) {
      setError(
        err.message || "Could not load saved articles."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  async function handleRemove(articleId) {
    const key = String(articleId);

    if (removingIds.includes(key)) return;

    try {
      setError("");

      setRemovingIds((prev) => [...prev, key]);

      await readerApi.removeBookmark(articleId);

      setArticles((previous) =>
        previous.filter(
          (article) => String(article.id) !== key
        )
      );
    } catch (err) {
      setError(
        err.message || "Could not remove bookmark."
      );
    } finally {
      setRemovingIds((prev) =>
        prev.filter((id) => id !== key)
      );
    }
  }

  const filteredArticles = articles.filter((article) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      article.title,
      article.excerpt,
      article.category,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(query)
      );
  });

  if (loading) {
    return (
      <main className="saved-page">
        <div className="saved-container">
          <div className="saved-loading">
            <div className="saved-loader"></div>
            <p>Loading your reading list...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="saved-page">
      <div className="saved-container">

        {/* Page heading */}
        <div className="saved-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Saved Articles</span>
        </div>

        <header className="saved-header">
          <div className="saved-header-content">
            <span className="saved-eyebrow">
              YOUR PERSONAL LIBRARY
            </span>

            <h1>
              Saved <span>Articles.</span>
            </h1>

            <p>
              Stories worth keeping. Your favorite reads,
              all in one place.
            </p>

            <div className="saved-header-stats">
              <div className="saved-stat-icon">
                <BookmarkCheck size={22} />
              </div>
              <div>
                <strong>{articles.length}</strong>
                <span>
                  {articles.length === 1
                    ? "Saved story"
                    : "Saved stories"}
                </span>
              </div>
            </div>
          </div>

          <div className="saved-header-art">
            <div className="saved-art-circle">
              <BookOpen size={62} strokeWidth={1.2} />
            </div>
            <span className="saved-art-dot"></span>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="saved-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={loadBookmarks}
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Toolbar */}
        {articles.length > 0 && (
          <section className="saved-toolbar">
            <div>
              <h2>Your Reading List</h2>
              <p>
                Pick up where your curiosity left off.
              </p>
            </div>

            <label className="saved-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search saved stories..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                aria-label="Search saved articles"
              />
            </label>
          </section>
        )}

        {/* Empty state */}
        {!articles.length && !error && (
          <section className="saved-empty">
            <div className="saved-empty-icon">
              <Bookmark size={38} />
            </div>

            <span className="saved-eyebrow">
              YOUR NEXT GREAT READ
            </span>

            <h2>Nothing saved. Yet.</h2>

            <p>
              Found something interesting?
              Bookmark an article and it will be waiting
              for you here.
            </p>

            <Link
              to="/articles"
              className="saved-primary-btn"
            >
              Explore Articles
              <ArrowRight size={17} />
            </Link>
          </section>
        )}

        {/* No search results */}
        {articles.length > 0 &&
          filteredArticles.length === 0 && (
            <section className="saved-empty saved-no-results">
              <div className="saved-empty-icon">
                <Search size={34} />
              </div>

              <h2>No stories found</h2>
              <p>
                Try another keyword to find your saved
                article.
              </p>

              <button
                className="saved-secondary-btn"
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>
            </section>
          )}

        {/* Articles grid */}
        {filteredArticles.length > 0 && (
          <section className="saved-grid">
            {filteredArticles.map((article) => {
              const id = String(article.id);
              const isRemoving =
                removingIds.includes(id);

              return (
                <article
                  className="saved-card"
                  key={id}
                >
                  <div className="saved-card-image">
                    {article.cover_image ? (
                      <img
                        src={article.cover_image}
                        alt={
                          article.title || "Article cover"
                        }
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : null}

                    <div className="saved-image-fallback">
                      <BookOpen size={40} />
                    </div>

                    <span className="saved-bookmark-badge">
                      <BookmarkCheck size={17} />
                    </span>
                  </div>

                  <div className="saved-card-body">
                    <div className="saved-card-meta">
                      {article.category && (
                        <span className="saved-category">
                          {article.category}
                        </span>
                      )}

                      {article.reading_time && (
                        <span className="saved-reading-time">
                          <Clock3 size={13} />
                          {article.reading_time}
                          {typeof article.reading_time ===
                            "number"
                            ? " min read"
                            : ""}
                        </span>
                      )}
                    </div>

                    <h3>{article.title}</h3>

                    {article.excerpt && (
                      <p className="saved-card-excerpt">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="saved-card-actions">
                      {article.slug ? (
                        <Link
                          className="saved-read-link"
                          to={`/articles/${article.slug}`}
                        >
                          Read Article
                          <ArrowRight size={16} />
                        </Link>
                      ) : (
                        <span className="saved-unavailable">
                          Article link unavailable
                        </span>
                      )}

                      <button
                        type="button"
                        className="saved-remove-btn"
                        disabled={isRemoving}
                        title="Remove bookmark"
                        aria-label={`Remove ${
                          article.title || "article"
                        } from saved articles`}
                        onClick={() =>
                          handleRemove(article.id)
                        }
                      >
                        {isRemoving ? (
                          <span className="saved-small-spinner" />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Footer */}
        {articles.length > 0 && (
          <footer className="saved-footer">
            <Bookmark size={16} />
            <span>
              Your reading list, curated by you.
            </span>
          </footer>
        )}
      </div>
    </main>
  );
}
