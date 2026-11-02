
import { useCallback, useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import "./ArticleFeedback.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export default function ArticleFeedback({ articleId }) {
  const [summary, setSummary] = useState(null);
  const [myFeedback, setMyFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("readerToken");

  const loadFeedback = useCallback(async () => {
    setLoading(true);

    try {
      const summaryResponse = await fetch(
        `${API_URL}/api/article-feedback/${articleId}`
      );

      const summaryData = await summaryResponse.json();

      if (!summaryResponse.ok) {
        throw new Error(
          summaryData.message || "Unable to load feedback."
        );
      }

      setSummary(summaryData.summary);

      if (token) {
        const mineResponse = await fetch(
          `${API_URL}/api/article-feedback/${articleId}/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (mineResponse.ok) {
          const mineData = await mineResponse.json();
          setMyFeedback(mineData.feedback);
        } else if (mineResponse.status === 401) {
          setMyFeedback(null);
        }
      } else {
        setMyFeedback(null);
      }
    } catch (error) {
      setMessage(error.message || "Unable to load feedback.");
    } finally {
      setLoading(false);
    }
  }, [articleId, token]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  async function submitFeedback(value) {
    const currentToken = localStorage.getItem("readerToken");

    if (!currentToken) {
      setMessage("Please login as a reader to give feedback.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/article-feedback/${articleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
          body: JSON.stringify({
            is_helpful: value,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save feedback.");
      }

      setMyFeedback(value);
      setMessage("Thank you for your feedback!");

      // Refresh server summary.
      const summaryResponse = await fetch(
        `${API_URL}/api/article-feedback/${articleId}`
      );

      if (summaryResponse.ok) {
        const data = await summaryResponse.json();
        setSummary(data.summary);
      }
    } catch (error) {
      setMessage(error.message || "Unable to save feedback.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="article-feedback">
        <p>Loading feedback...</p>
      </section>
    );
  }

  return (
    <section className="article-feedback">
      <div className="feedback-heading">
        <span className="feedback-eyebrow">
          YOUR OPINION MATTERS
        </span>
        <h3>Was this article helpful?</h3>
        <p>
          Your feedback helps us create better stories.
        </p>
      </div>

      <div className="feedback-actions">
        <button
          type="button"
          disabled={saving}
          onClick={() => submitFeedback(true)}
          className={
            myFeedback === true
              ? "feedback-btn selected"
              : "feedback-btn"
          }
          aria-pressed={myFeedback === true}
        >
          <ThumbsUp size={18} />
          Yes, helpful
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={() => submitFeedback(false)}
          className={
            myFeedback === false
              ? "feedback-btn selected"
              : "feedback-btn"
          }
          aria-pressed={myFeedback === false}
        >
          <ThumbsDown size={18} />
          Not really
        </button>
      </div>

      {saving && (
        <p className="feedback-message">
          Saving your feedback...
        </p>
      )}

      {message && (
        <p className="feedback-message" role="status">
          {message}
        </p>
      )}

      {summary && (
        <div className="feedback-summary">
          <div className="feedback-summary-top">
            <span>
              <CheckCircle2 size={16} />
              {summary.totalResponses} responses
            </span>

            <strong>
              {summary.helpfulPercentage}% found it helpful
            </strong>
          </div>

          <div
            className="feedback-progress"
            role="progressbar"
            aria-label="Helpful feedback percentage"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={summary.helpfulPercentage}
          >
            <div
              className="feedback-progress-fill"
              style={{
                width: `${summary.helpfulPercentage}%`,
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
