
import { useEffect, useState } from "react";
import { BarChart3, BookOpen, Layers3, CalendarDays } from "lucide-react";
import "./ReadingAnalytics.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function getLastMonths() {
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setDate(1);
    date.setHours(12, 0, 0, 0);
    date.setMonth(date.getMonth() - i);

    months.push({
      key: `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", {
        month: "short",
      }),
      count: 0,
    });
  }

  return months;
}

export default function ReadingAnalytics() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("readerToken");

        if (!token) {
          setError("Please login to view reading analytics.");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/reader/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load reading analytics."
          );
        }

        setHistory(
          Array.isArray(data.history) ? data.history : []
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <section className="reading-analytics">
        <p>Loading reading analytics...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="reading-analytics">
        <p className="analytics-error">{error}</p>
      </section>
    );
  }

  const categories = {};

  history.forEach((article) => {
    const category = article.category || "Uncategorized";
    categories[category] = (categories[category] || 0) + 1;
  });

  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const months = getLastMonths();

  const monthMap = new Map(
    months.map((month) => [month.key, month])
  );

  history.forEach((article) => {
    if (!article.last_read_at) return;

    const date = new Date(article.last_read_at);

    if (Number.isNaN(date.getTime())) return;

    const key =
      `${date.getFullYear()}-` +
      `${String(date.getMonth() + 1).padStart(2, "0")}`;

    const month = monthMap.get(key);

    if (month) {
      month.count += 1;
    }
  });

  const maxCount = Math.max(
    1,
    ...months.map((month) => month.count)
  );

  const totalArticles = history.length;

  const totalCategories = Object.keys(categories).length;

  const currentMonth = months[months.length - 1];

  return (
    <section className="reading-analytics">
      <div className="analytics-heading">
        <div>
          <span className="analytics-eyebrow">
            YOUR READING JOURNEY
          </span>
          <h2>Reading Analytics</h2>
          <p>
            Explore your reading patterns and favorite topics.
          </p>
        </div>
        <BarChart3 size={30} />
      </div>

      <div className="analytics-stats">
        <div className="analytics-card">
          <BookOpen />
          <span>Unique articles</span>
          <strong>{totalArticles}</strong>
        </div>

        <div className="analytics-card">
          <Layers3 />
          <span>Categories explored</span>
          <strong>{totalCategories}</strong>
        </div>

        <div className="analytics-card">
          <CalendarDays />
          <span>Latest month entries</span>
          <strong>{currentMonth.count}</strong>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-panel">
          <h3>Reading Activity</h3>
          <p className="analytics-subtitle">
            Last 6 months · History entries by last-read month
          </p>

          <div
            className="activity-chart"
            role="img"
            aria-label="Monthly reading history entries"
          >
            {months.map((month) => (
              <div
                className="activity-column"
                key={month.key}
              >
                <span className="activity-count">
                  {month.count}
                </span>

                <div className="activity-bar-track">
                  <div
                    className="activity-bar"
                    style={{
                      height: `${
                        (month.count / maxCount) * 100
                      }%`,
                    }}
                  />
                </div>

                <span className="activity-label">
                  {month.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-panel">
          <h3>Favorite Categories</h3>
          <p className="analytics-subtitle">
            Based on unique articles in your history
          </p>

          {topCategories.length === 0 ? (
            <div className="analytics-empty">
              No reading data yet. Read an article to get started.
            </div>
          ) : (
            <div className="category-list">
              {topCategories.map(([name, count]) => (
                <div className="category-item" key={name}>
                  <div className="category-info">
                    <span>{name}</span>
                    <strong>{count}</strong>
                  </div>

                  <div className="category-track">
                    <div
                      className="category-fill"
                      style={{
                        width: `${
                          (count / totalArticles) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
