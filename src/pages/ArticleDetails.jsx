
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import "./ArticleDetails.css";
import SEO from "../components/SEO";
import ArticleFeedback from "../components/reader/ArticleFeedback";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function getImageUrl(image) {
  if (!image) return "";

  if (/^https?:\/\//i.test(image)) return image;

  return `${API_URL}/${image.replace(/^\/+/, "")}`;
}

function getReadingTime(content = "") {
  const text = content.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getArticleContent(article) {
  if (!article?.content) return "";

  return DOMPurify.sanitize(article.content, {
    USE_PROFILES: { html: true },
  });
}

export default function ArticleDetails() {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadArticle() {
      setLoading(true);
      setError("");
      setArticle(null);
      setRelated([]);

      try {
        const response = await fetch(
          `${API_URL}/api/articles/slug/${encodeURIComponent(slug)}`,
          { signal: controller.signal }
        );

        if (response.status === 404) {
          throw new Error("Article not found.");
        }

        if (!response.ok) {
          throw new Error("Unable to load this article.");
        }

        const result = await response.json();

        // Supports { article: {...} } or direct article object.
        const currentArticle = result.article || result;

        if (!currentArticle?.slug || !currentArticle?.title) {
          throw new Error("Invalid article response from server.");
        }

        setArticle(currentArticle);

        // Fetch published articles for related stories.
        try {
          const listResponse = await fetch(
            `${API_URL}/api/articles`,
            { signal: controller.signal }
          );

          if (listResponse.ok) {
            const listResult = await listResponse.json();

            const list = Array.isArray(listResult)
              ? listResult
              : listResult.articles || [];

            setRelated(
              list
                .filter(
                  (item) =>
                    item.slug !== currentArticle.slug &&
                    item.category === currentArticle.category
                )
                .slice(0, 3)
            );
          }
        } catch (e) {
          if (e.name === "AbortError") throw e;
          // Related stories are optional.
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadArticle();

    return () => controller.abort();
  }, [slug]);

  const safeContent = useMemo(
    () => getArticleContent(article),
    [article]
  );

  async function shareArticle() {
    const shareData = {
      title: article.title,
      text: article.excerpt || article.title,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Article link copied!");
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        alert("Unable to share this article.");
      }
    }
  }

  if (loading) {
    return (
      <main className="article-state">
        <div className="article-loader" />
        <p>Preparing your reading experience...</p>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="article-state">
        <span className="article-state-icon">✦</span>
        <h1>Story not found</h1>
        <p>{error || "This article is not available."}</p>
        <Link to="/" className="article-back-btn">
          ← Back to Home
        </Link>
      </main>
    );
  }

  const imageUrl = getImageUrl(article.cover_image);
  const readTime = getReadingTime(article.content);

  return (
    <main className="article-page">

      {/* SEO: Article-specific metadata */}
      <SEO
        title={article.title}
        description={article.excerpt}
        image={imageUrl}
        slug={article.slug}
        type="article"
      />

      <div className="article-topbar">
        <Link to="/" className="article-back-link">
          ← Back to Home
        </Link>

        <button
          type="button"
          className="article-share-btn"
          onClick={shareArticle}
        >
          ↗ Share
        </button>
      </div>

      <header className="article-header">
        <span className="article-category">
          {article.category || "Journal"}
        </span>

        <h1>{article.title}</h1>

        {article.excerpt && (
          <p className="article-excerpt">
            {article.excerpt}
          </p>
        )}

        <div className="article-meta">
          <span>
            By{" "}
            <strong>
              {article.author_name ||
                article.author ||
                "ScrollTheory"}
            </strong>
          </span>

          {article.published_at && (
            <>
              <span className="article-meta-dot">·</span>
              <time dateTime={article.published_at}>
                {formatDate(article.published_at)}
              </time>
            </>
          )}

          <span className="article-meta-dot">·</span>
          <span>{readTime} min read</span>
        </div>
      </header>

      {imageUrl && (
        <figure className="article-cover">
          <img
            src={imageUrl}
            alt={article.title}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </figure>
      )}

      <div className="article-layout">
        <aside className="article-side-note">
          <span>SCROLLTHEORY</span>
          <p>A little space to think.</p>
        </aside>

        <article className="article-body">
          {article.content ? (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{
                __html: safeContent,
              }}
            />
          ) : (
            <p>
              Full article content is not available yet.
            </p>
          )}

          <div className="article-end">
            <span>✦</span>
            <p>
              Thank you for spending time with this story.
            </p>
          </div>

          <div className="article-bottom-actions">
            <span>Enjoyed reading?</span>
            <button
              type="button"
              className="article-share-btn"
              onClick={shareArticle}
            >
              Share this story ↗
            </button>
          </div>

          <ArticleFeedback articleId={article.id} />
        </article>
      </div>

      {related.length > 0 && (
        <section className="related-section">
          <div className="related-heading">
            <div>
              <span className="related-eyebrow">
                KEEP EXPLORING
              </span>
              <h2>More stories for you.</h2>
            </div>

            <Link to="/articles">
              All stories ↗
            </Link>
          </div>

          <div className="related-grid">
            {related.map((item) => (
              <Link
                to={`/articles/${encodeURIComponent(item.slug)}`}
                className="related-card"
                key={item.id || item.slug}
              >
                {item.cover_image && (
                  <div className="related-image">
                    <img
                      src={getImageUrl(item.cover_image)}
                      alt={item.title}
                      loading="lazy"
                    />
                  </div>
                )}

                <span>
                  {item.category || "Journal"}
                </span>

                <h3>{item.title}</h3>

                <p>
                  {item.excerpt || "Explore this story."}
                </p>

                <strong>Read story ↗</strong>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
