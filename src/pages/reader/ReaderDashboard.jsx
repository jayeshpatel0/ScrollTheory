

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ReaderDashboard.css";
import {
  BookOpen,
  Bookmark,
  History,
  UserRound,
  ArrowUpRight,
  Clock3,
  RefreshCw,
} from "lucide-react";

import { useReaderAuth } from "../../context/ReaderAuthContext";
import ReadingAnalytics from "./ReadingAnalytics";


const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatDate(date) {
  if (!date) return "Recently read";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "Recently read";
  }

  return value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getImageUrl(path) {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_URL.replace(/\/$/, "")}/${path.replace(
    /^\/+/,
    ""
  )}`;
}

export default function ReaderDashboard() {
  const { user } = useReaderAuth();

  const [history, setHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("readerToken");

    if (!token) {
      setError("Reader session not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [historyResponse, bookmarksResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/reader/history`, {
            headers,
          }),
          fetch(`${API_URL}/api/bookmarks`, {
            headers,
          }),
        ]);

      const historyData = await historyResponse.json();
      const bookmarkData = await bookmarksResponse.json();

      if (!historyResponse.ok) {
        throw new Error(
          historyData.message || "Unable to load reading history."
        );
      }

      if (!bookmarksResponse.ok) {
        throw new Error(
          bookmarkData.message || "Unable to load bookmarks."
        );
      }

      setHistory(
        Array.isArray(historyData.history)
          ? historyData.history
          : []
      );

      // Supports the existing bookmark response structure.
      const savedItems =
        bookmarkData.bookmarks ??
        bookmarkData.articles ??
        [];

      setBookmarks(
        Array.isArray(savedItems) ? savedItems : []
      );
    } catch (err) {
      setError(
        err.message || "Something went wrong loading dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const recentArticles = history.slice(0, 4);

  return (
    <main className="reader-dashboard">

      {/* HEADER */}
      <section className="reader-dashboard-header">
        <div>
          <span className="reader-dashboard-eyebrow">
            SCROLLTHEORY / READER SPACE
          </span>

          <h1>
            Welcome back,
            <br />
            <span>{user?.name || "Reader"}.</span>
          </h1>

          <p>
            Your reading journey, all in one place.
          </p>
        </div>

        <Link
          to="/articles"
          className="reader-dashboard-primary"
        >
          Explore Articles <ArrowUpRight size={17} />
        </Link>
      </section>

      {/* ERROR */}
      {error && (
        <div className="reader-dashboard-message">
          <p>{error}</p>

          <button
            type="button"
            onClick={loadDashboard}
          >
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      )}

      {/* STATS */}
      <section className="reader-dashboard-stats">
        <article className="reader-stat-card">
          <span className="reader-stat-icon">
            <BookOpen size={21} />
          </span>

          <span className="reader-stat-label">
            Articles Read
          </span>

          <strong>
            {loading ? "—" : history.length}
          </strong>

          <small>Articles in your history</small>
        </article>

        <article className="reader-stat-card">
          <span className="reader-stat-icon">
            <Bookmark size={21} />
          </span>

          <span className="reader-stat-label">
            Saved Articles
          </span>

          <strong>
            {loading ? "—" : bookmarks.length}
          </strong>

          <small>Your personal collection</small>
        </article>

        <article className="reader-stat-card">
          <span className="reader-stat-icon">
            <History size={21} />
          </span>

          <span className="reader-stat-label">
            Recent Activity
          </span>

          <strong>
            {loading ? "—" : recentArticles.length}
          </strong>

          <small>Recently opened articles shown</small>
        </article>
      </section>
 <ReadingAnalytics />
      {/* RECENT READING */}
      <section className="reader-dashboard-section">
        <div className="reader-dashboard-section-heading">
          <div>
            <span className="reader-dashboard-eyebrow">
              YOUR READING JOURNEY
            </span>

            <h2>Continue Reading</h2>

            <p>
              Pick up where your curiosity left off.
            </p>
          </div>

          <Link
            to="/reading-history"
            className="reader-dashboard-text-link"
          >
            View History <ArrowUpRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="reader-dashboard-state">
            <RefreshCw size={20} />
            Loading your reading activity...
          </div>
        ) : !error && recentArticles.length === 0 ? (
          <div className="reader-dashboard-empty">
            <BookOpen size={34} />

            <h3>Your reading journey starts here.</h3>

            <p>
              Open an article to start building your
              reading history.
            </p>

            <Link to="/articles">
              Discover Articles <ArrowUpRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="reader-dashboard-articles">
            {recentArticles.map((article) => {
              const image = getImageUrl(article.cover_image);

              return (
                <article
                  className="reader-dashboard-article"
                  key={article.id}
                >
                  <Link
                    to={`/articles/${article.slug}`}
                    className="reader-dashboard-cover"
                    aria-label={`Read ${article.title}`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={article.title}
                        loading="lazy"
                      />
                    ) : (
                      <span className="reader-dashboard-no-image">
                        <BookOpen size={30} />
                      </span>
                    )}
                  </Link>

                  <div className="reader-dashboard-article-info">
                    <span className="reader-dashboard-category">
                      {article.category || "Article"}
                    </span>

                    <Link
                      to={`/articles/${article.slug}`}
                      className="reader-dashboard-article-title"
                    >
                      {article.title}
                    </Link>

                    <p>
                      {article.excerpt ||
                        "Continue exploring this story."}
                    </p>

                    <div className="reader-dashboard-article-meta">
                      <span>
                        <Clock3 size={14} />
                        {formatDate(article.last_read_at)}
                      </span>

                      <Link
                        to={`/articles/${article.slug}`}
                        aria-label={`Continue reading ${article.title}`}
                      >
                        Read again <ArrowUpRight size={15} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* QUICK LINKS */}
      <section className="reader-dashboard-section">
        <div className="reader-dashboard-section-heading">
          <div>
            <span className="reader-dashboard-eyebrow">
              YOUR SPACE
            </span>

            <h2>Made for your reading life.</h2>
          </div>
        </div>

        <div className="reader-dashboard-shortcuts">
          <Link
            to="/saved-articles"
            className="reader-dashboard-shortcut"
          >
            <Bookmark size={23} />

            <div>
              <strong>Saved Articles</strong>
              <span>Return to your collection.</span>
            </div>

            <ArrowUpRight size={19} />
          </Link>

          <Link
            to="/reading-history"
            className="reader-dashboard-shortcut"
          >
            <History size={23} />

            <div>
              <strong>Reading History</strong>
              <span>Explore your recent reads.</span>
            </div>

            <ArrowUpRight size={19} />
          </Link>

          <Link
            to="/profile"
            className="reader-dashboard-shortcut"
          >
            <UserRound size={23} />

            <div>
              <strong>My Profile</strong>
              <span>Manage your reader account.</span>
            </div>

            <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>

    </main>
  );
}
