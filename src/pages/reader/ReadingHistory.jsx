
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Clock3,
  History,
  Search,
  Trash2,
  RefreshCw,
  BookMarked,
} from "lucide-react";

import "./ReadingHistory.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function getImageUrl(image) {
  if (!image) return "";

  if (/^https?:\/\//i.test(image)) return image;

  return `${API_URL}/${image.replace(/^\/+/, "")}`;
}

function formatLastRead(date) {
  if (!date) return "Recently read";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Recently read";
  }

  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReadingHistory() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [notice, setNotice] = useState("");

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("readerToken");

    if (!token) {
      setError("Please log in to view your reading history.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/reader/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load reading history."
        );
      }

      setHistory(
        Array.isArray(data.history) ? data.history : []
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredHistory = history.filter((article) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      article.title,
      article.category,
      article.excerpt,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(query)
      );
  });

  async function removeArticle(articleId) {
    if (removingId !== null) return;

    const token = localStorage.getItem("readerToken");

    if (!token) {
      setError("Please log in again.");
      return;
    }

    setRemovingId(articleId);
    setNotice("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/reader/history/${articleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to remove history."
        );
      }

      setHistory((previous) =>
        previous.filter((item) => item.id !== articleId)
      );

      setNotice("Story removed from your reading history.");
    } catch (err) {
      setError(err.message || "Unable to remove story.");
    } finally {
      setRemovingId(null);
    }
  }

  async function clearHistory() {
    if (!history.length || clearing) return;

    const confirmed = window.confirm(
      "Clear your entire reading history? This cannot be undone."
    );

    if (!confirmed) return;

    const token = localStorage.getItem("readerToken");

    if (!token) {
      setError("Please log in again.");
      return;
    }

    setClearing(true);
    setNotice("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/reader/history`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to clear history."
        );
      }

      setHistory([]);
      setNotice("Your reading history has been cleared.");
    } catch (err) {
      setError(err.message || "Unable to clear history.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <main className="reading-history-page">
      <div className="rh-container">

        <Link to="/profile" className="rh-back-link">
          <ArrowLeft size={17} />
          Back to Profile
        </Link>

        <header className="rh-header">
          <div className="rh-heading">
            <span className="rh-eyebrow">
              YOUR PERSONAL LIBRARY
            </span>

            <h1>
              Reading <span>History.</span>
            </h1>

            <p>
              Every story you've explored, all in one place.
              Pick up where curiosity left off.
            </p>
          </div>

          <div className="rh-header-icon">
            <History size={38} strokeWidth={1.4} />
          </div>
        </header>

        <section className="rh-toolbar">
          <div className="rh-count">
            <BookMarked size={19} />
            <span>
              <strong>{history.length}</strong>{" "}
              {history.length === 1 ? "Story" : "Stories"} read
            </span>
          </div>

          <div className="rh-toolbar-actions">
            <label className="rh-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search your history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="rh-clear-btn"
              onClick={clearHistory}
              disabled={!history.length || clearing || loading}
            >
              <Trash2 size={16} />
              {clearing ? "Clearing..." : "Clear All"}
            </button>
          </div>
        </section>

        {notice && (
          <div className="rh-notice" role="status">
            {notice}
          </div>
        )}

        {error && (
          <div className="rh-error" role="alert">
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchHistory}
              disabled={loading}
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="rh-state">
            <div className="rh-spinner" />
            <p>Gathering your stories...</p>
          </div>
        ) : !error && history.length === 0 ? (
          <div className="rh-state rh-empty">
            <div className="rh-empty-icon">
              <BookOpen size={34} />
            </div>

            <h2>Your story starts here.</h2>

            <p>
              Articles you open while logged in will appear
              here for you to revisit.
            </p>

            <Link to="/articles" className="rh-primary-btn">
              Explore Stories
              <ArrowUpRight size={17} />
            </Link>
          </div>
        ) : !error && filteredHistory.length === 0 ? (
          <div className="rh-state rh-empty">
            <div className="rh-empty-icon">
              <Search size={32} />
            </div>

            <h2>No stories found.</h2>

            <p>Try another title or category.</p>

            <button
              type="button"
              className="rh-primary-btn"
              onClick={() => setSearch("")}
            >
              Clear Search
            </button>
          </div>
        ) : !error ? (
          <section className="rh-grid">
            {filteredHistory.map((article) => (
              <article
                className="rh-card"
                key={article.id}
              >
                <Link
                  to={`/articles/${encodeURIComponent(article.slug)}`}
                  className="rh-card-cover"
                >
                  {article.cover_image ? (
                    <img
                      src={getImageUrl(article.cover_image)}
                      alt={article.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}

                  <div className="rh-cover-fallback">
                    <BookOpen size={34} />
                  </div>

                  <span className="rh-category">
                    {article.category || "Journal"}
                  </span>
                </Link>

                <div className="rh-card-content">
                  <div className="rh-last-read">
                    <Clock3 size={14} />
                    <span>
                      Last read · {formatLastRead(article.last_read_at)}
                    </span>
                  </div>

                  <Link
                    to={`/articles/${encodeURIComponent(article.slug)}`}
                    className="rh-card-title"
                  >
                    <h2>{article.title}</h2>
                  </Link>

                  <p className="rh-excerpt">
                    {article.excerpt || "Revisit this story and explore it again."}
                  </p>

                  <div className="rh-card-footer">
                    <Link
                      to={`/articles/${encodeURIComponent(article.slug)}`}
                      className="rh-read-link"
                    >
                      Read Again
                      <ArrowUpRight size={16} />
                    </Link>

                    <button
                      type="button"
                      className="rh-remove-btn"
                      title="Remove from history"
                      aria-label={`Remove ${article.title} from history`}
                      disabled={
                        removingId !== null || clearing
                      }
                      onClick={() => removeArticle(article.id)}
                    >
                      {removingId === article.id ? (
                        <span className="rh-button-spinner" />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        <footer className="rh-footer">
          <span>SCROLLTHEORY</span>
          <p>A little space to think.</p>
        </footer>
      </div>
    </main>
  );
}
