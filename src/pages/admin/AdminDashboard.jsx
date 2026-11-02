
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./AdminDashboard.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MetricCard({
  icon,
  label,
  value,
  description,
  accent,
}) {
  return (
    <article className={`analytics-card ${accent || ""}`}>
      <div className="analytics-card-top">
        <span className="analytics-card-icon">{icon}</span>
        <span className="analytics-card-label">{label}</span>
      </div>

      <h2 className="analytics-card-value">
        {formatNumber(value)}
      </h2>

      <p className="analytics-card-description">
        {description}
      </p>
    </article>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="analytics-section-heading">
      <div>
        {eyebrow && (
          <span className="analytics-eyebrow">{eyebrow}</span>
        )}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

// Simple responsive SVG chart, no chart package required
function ActivityChart({ data = [] }) {
  const width = 700;
  const height = 245;
  const left = 38;
  const right = 16;
  const top = 22;
  const bottom = 42;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const values = data.map((item) =>
    Number(item.readingRecords || 0)
  );

  const maxValue = Math.max(...values, 1);
  const yMax = Math.ceil(maxValue / 5) * 5 || 5;

  const points = data.map((item, index) => {
    const x =
      data.length <= 1
        ? left + plotWidth / 2
        : left + (index / (data.length - 1)) * plotWidth;

    const y =
      top +
      plotHeight -
      (Number(item.readingRecords || 0) / yMax) * plotHeight;

    return {
      x,
      y,
      value: Number(item.readingRecords || 0),
      date: item.date,
    };
  });

  const line = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const area =
    points.length > 0
      ? `${line} L ${points[points.length - 1].x} ${
          top + plotHeight
        } L ${points[0].x} ${top + plotHeight} Z`
      : "";

  const formatShortDate = (value) => {
    const date = new Date(`${value}T12:00:00`);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        });
  };

  return (
    <div className="analytics-chart">
      {data.length === 0 ? (
        <div className="analytics-empty">
          No reading activity available yet.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Reading records for the last seven days"
          className="analytics-chart-svg"
        >
          {[0, 1, 2, 3, 4].map((step) => {
            const y = top + (plotHeight / 4) * step;
            const label = Math.round(yMax * (1 - step / 4));

            return (
              <g key={step}>
                <line
                  x1={left}
                  y1={y}
                  x2={width - right}
                  y2={y}
                  stroke="#e9e7de"
                  strokeDasharray="4 5"
                />
                <text
                  x={left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#888b82"
                >
                  {label}
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient
              id="activityGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#1e5947" stopOpacity=".23" />
              <stop offset="100%" stopColor="#1e5947" stopOpacity="0" />
            </linearGradient>
          </defs>

          {points.length > 1 && (
            <path d={area} fill="url(#activityGradient)" />
          )}

          {points.length > 1 && (
            <path
              d={line}
              fill="none"
              stroke="#1e5947"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((point, index) => (
            <g key={`${point.date}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#ffffff"
                stroke="#1e5947"
                strokeWidth="2.5"
              >
                <title>
                  {point.date}: {point.value} reading records
                </title>
              </circle>

              <text
                x={point.x}
                y={height - 15}
                fontSize="11"
                fill="#888b82"
                textAnchor="middle"
              >
                {formatShortDate(point.date)}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}

function ArticleList({
  items = [],
  type,
  emptyMessage,
}) {
  if (!items.length) {
    return (
      <div className="analytics-empty">{emptyMessage}</div>
    );
  }

  const countKey =
    type === "bookmark" ? "bookmarkCount" : "readingRecords";

  const countLabel =
    type === "bookmark" ? "saved" : "records";

  return (
    <div className="analytics-article-list">
      {items.map((article, index) => (
        <div
          className="analytics-article-item"
          key={article.id}
        >
          <span className="analytics-rank">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="analytics-article-info">
            <h3 title={article.title}>
              {article.title}
            </h3>
            <p>
              {formatNumber(article[countKey])} {countLabel}
            </p>
          </div>

          <div className="analytics-mini-bar">
            <span
              style={{
                width: `${
                  (Number(article[countKey] || 0) /
                    Math.max(
                      ...items.map((item) =>
                        Number(item[countKey] || 0)
                      ),
                      1
                    )) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const loadAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const token = localStorage.getItem(
        "scrolltheory_admin_token"
      );

      if (!token) {
        logout();
        navigate("/admin/login", { replace: true });
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/analytics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        logout();
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load analytics."
        );
      }

      setAnalytics(result.data);
    } catch (err) {
      setError(
        err.message || "Something went wrong loading analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const overview = analytics?.overview || {};

  const metrics = [
    {
      icon: "◉",
      label: "Total Readers",
      value: overview.totalReaders,
      description: "Registered reader accounts",
    },
    {
      icon: "▤",
      label: "Total Articles",
      value: overview.totalArticles,
      description: `${formatNumber(
        overview.publishedArticles
      )} currently published`,
    },
    {
      icon: "☆",
      label: "Bookmarks",
      value: overview.totalBookmarks,
      description: "Articles saved by readers",
    },
    {
      icon: "↗",
      label: "Reading Records",
      value: overview.totalReadingRecords,
      description: "Unique reader-article pairs",
    },
  ];

  const publicationItems = [
    {
      label: "Published",
      value: overview.publishedArticles,
      color: "published",
    },
    {
      label: "Drafts",
      value: overview.draftArticles,
      color: "draft",
    },
    {
      label: "Scheduled",
      value: overview.scheduledArticles,
      color: "scheduled",
    },
  ];

  const publicationTotal = Math.max(
    Number(overview.totalArticles || 0),
    1
  );

  const feedbackTotal = Number(overview.totalFeedback || 0);
  const helpful = Number(overview.helpful || 0);
  const notHelpful = Number(overview.notHelpful || 0);

  return (
    <main className="st-admin-dashboard">
      {/* Header */}
      <header className="st-dashboard-header">
        <div className="st-dashboard-brand">
          <div className="st-brand-mark">S</div>
          <div>
            <span className="st-brand-name">ScrollTheory</span>
            <span className="st-brand-caption">
              ADMINISTRATION
            </span>
          </div>
        </div>

        <div className="st-admin-header-actions">
          <div className="st-admin-identity">
            <div className="st-admin-avatar">
              {(admin?.name || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{admin?.name || "Administrator"}</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button
            className="st-logout-button"
            onClick={handleLogout}
          >
            Logout ↗
          </button>
        </div>
      </header>

      <div className="st-dashboard-container">
        {/* Page heading */}
        <section className="st-dashboard-welcome">
          <div>
            <div className="st-dashboard-breadcrumb">
              ADMIN <span>/</span> OVERVIEW
            </div>

            <h1>Dashboard<span>.</span></h1>

            <p>
              Your publication at a glance. Here&apos;s what&apos;s
              happening at ScrollTheory.
            </p>
          </div>

          <button
            className="st-refresh-button"
            onClick={() => loadAnalytics(true)}
            disabled={loading || refreshing}
          >
            <span className={refreshing ? "st-spinning" : ""}>
              ↻
            </span>
            {refreshing ? "Refreshing..." : "Refresh data"}
          </button>
        </section>

        {/* Error state */}
        {error && (
          <div className="st-analytics-error" role="alert">
            <div>
              <strong>Analytics unavailable</strong>
              <p>{error}</p>
            </div>
            <button onClick={() => loadAnalytics(true)}>
              Retry
            </button>
          </div>
        )}

        {/* Metrics */}
        <section className="st-metrics-grid">
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.label}
              {...metric}
              accent={index === 0 ? "analytics-card-featured" : ""}
              value={loading ? "—" : metric.value}
            />
          ))}
        </section>

        {/* Main analytics */}
        <section className="st-dashboard-grid">
          {/* Activity chart */}
          <article className="st-panel st-activity-panel">
            <SectionHeader
              eyebrow="READER ENGAGEMENT"
              title="Reading activity"
              subtitle="Daily reading records · Last 7 days"
            />

            <div className="st-activity-summary">
              <div>
                <span className="st-summary-number">
                  {loading
                    ? "—"
                    : formatNumber(
                        (analytics?.activityTrend || []).reduce(
                          (sum, item) =>
                            sum + Number(item.readingRecords || 0),
                          0
                        )
                      )}
                </span>
                <span className="st-summary-caption">
                  Records in this period
                </span>
              </div>

              <span className="st-period-badge">
                LAST 7 DAYS
              </span>
            </div>

            {loading ? (
              <div className="analytics-empty">
                Loading reading activity...
              </div>
            ) : (
              <ActivityChart
                data={analytics?.activityTrend || []}
              />
            )}

            <p className="st-chart-footnote">
              Counts reflect latest saved reading records,
              not total page views.
            </p>
          </article>

          {/* Publication overview */}
          <article className="st-panel st-publication-panel">
            <SectionHeader
              eyebrow="CONTENT LIBRARY"
              title="Publication status"
              subtitle="Your editorial pipeline"
            />

            <div className="st-publication-total">
              <span className="st-publication-number">
                {loading
                  ? "—"
                  : formatNumber(overview.totalArticles)}
              </span>
              <span>Articles in library</span>
            </div>

            <div className="st-publication-stack">
              {publicationItems.map((item) => {
                const value = Number(item.value || 0);
                const percentage = loading
                  ? 0
                  : (value / publicationTotal) * 100;

                return (
                  <div
                    key={item.label}
                    className="st-publication-segment"
                    style={{
                      width: `${percentage}%`,
                    }}
                    title={`${item.label}: ${value}`}
                  />
                );
              })}
            </div>

            <div className="st-publication-legend">
              {publicationItems.map((item) => (
                <div
                  className="st-legend-row"
                  key={item.label}
                >
                  <span className="st-legend-label">
                    <i className={`st-dot ${item.color}`} />
                    {item.label}
                  </span>
                  <strong>
                    {loading ? "—" : formatNumber(item.value)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="st-publication-note">
              <span>✦</span>
              <p>
                Keep your editorial library organised and
                publication-ready.
              </p>
            </div>
          </article>
        </section>

        {/* Top articles */}
        <section className="st-dashboard-grid st-ranking-grid">
          <article className="st-panel">
            <SectionHeader
              eyebrow="EDITORIAL PERFORMANCE"
              title="Most read articles"
              subtitle="Ranked by reading history records"
            />

            {loading ? (
              <div className="analytics-empty">
                Loading articles...
              </div>
            ) : (
              <ArticleList
                items={analytics?.topReadArticles || []}
                type="read"
                emptyMessage="No reading records yet."
              />
            )}
          </article>

          <article className="st-panel">
            <SectionHeader
              eyebrow="READER COLLECTIONS"
              title="Most bookmarked"
              subtitle="Articles readers save most"
            />

            {loading ? (
              <div className="analytics-empty">
                Loading bookmarks...
              </div>
            ) : (
              <ArticleList
                items={analytics?.topBookmarkedArticles || []}
                type="bookmark"
                emptyMessage="No bookmarks yet."
              />
            )}
          </article>
        </section>

        {/* Feedback */}
        <section className="st-panel st-feedback-panel">
          <SectionHeader
            eyebrow="READER SENTIMENT"
            title="Article feedback"
            subtitle="Understand how readers find your content"
          />

          <div className="st-feedback-grid">
            <div className="st-feedback-highlight">
              <span className="st-feedback-big">
                {loading
                  ? "—"
                  : `${Number(
                      overview.helpfulPercentage || 0
                    ).toLocaleString("en-IN")}%`}
              </span>
              <span className="st-feedback-label">
                Helpful rating
              </span>

              <div className="st-feedback-track">
                <span
                  style={{
                    width: `${
                      loading
                        ? 0
                        : Math.min(
                            100,
                            Number(overview.helpfulPercentage || 0)
                          )
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="st-feedback-stat">
              <span className="st-feedback-stat-icon">✓</span>
              <div>
                <strong>
                  {loading ? "—" : formatNumber(helpful)}
                </strong>
                <span>Helpful</span>
              </div>
            </div>

            <div className="st-feedback-stat">
              <span className="st-feedback-stat-icon muted">
                −
              </span>
              <div>
                <strong>
                  {loading ? "—" : formatNumber(notHelpful)}
                </strong>
                <span>Not helpful</span>
              </div>
            </div>

            <div className="st-feedback-stat">
              <span className="st-feedback-stat-icon gold">
                ≡
              </span>
              <div>
                <strong>
                  {loading ? "—" : formatNumber(feedbackTotal)}
                </strong>
                <span>Total responses</span>
              </div>
            </div>
          </div>

          <p className="st-feedback-footnote">
            Rating = helpful responses / total responses.
            No feedback is counted as a rating of 0%.
          </p>
        </section>

        {/* Recent activity */}
        <section className="st-panel st-recent-panel">
          <SectionHeader
            eyebrow="LIVE READER ACTIVITY"
            title="Recent reading history"
            subtitle="Latest recorded reader activity"
          />

          {loading ? (
            <div className="analytics-empty">
              Loading recent activity...
            </div>
          ) : (analytics?.recentActivity || []).length === 0 ? (
            <div className="analytics-empty">
              No recent reader activity.
            </div>
          ) : (
            <div className="st-table-wrapper">
              <table className="st-activity-table">
                <thead>
                  <tr>
                    <th>READER</th>
                    <th>ARTICLE</th>
                    <th>LAST READ</th>
                  </tr>
                </thead>

                <tbody>
                  {analytics.recentActivity.map((item, index) => (
                    <tr
                      key={`${item.readerId}-${item.articleId}-${index}`}
                    >
                      <td>
                        <div className="st-table-reader">
                          <span className="st-table-avatar">
                            {(item.readerName || "R")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                          <span>{item.readerName || "Reader"}</span>
                        </div>
                      </td>

                      <td>
                        <span className="st-table-article">
                          {item.articleTitle}
                        </span>
                      </td>

                      <td className="st-table-date">
                        {formatDateTime(item.lastReadAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="st-dashboard-footer">
          <span>SCROLLTHEORY © {new Date().getFullYear()}</span>
          <span>Thoughtful stories. Meaningful perspectives.</span>
        </footer>
      </div>
    </main>
  );
}
