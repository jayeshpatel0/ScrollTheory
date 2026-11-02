
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../style.css";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const readingListKey = "scrolltheory-reading-list";

const dailyThoughts = [
  "Attention is the beginning of a more intentional life.",
  "Not every moment needs to be filled with something.",
  "Curiosity makes ordinary days feel extraordinary.",
  "Slow down enough to notice what matters.",
];

const normalizeArticle = (article) => {
  const dateValue = article.published_at || article.created_at;

  return {
    ...article,
    id: String(article.id),
    category: article.category || "General",
    label: (article.category || "General").toUpperCase(),
    title: article.title || "Untitled Story",
    excerpt: article.excerpt || "",
    author:
      article.author_name ||
      article.author ||
      "ScrollTheory Editorial",
    readTime: article.read_time
      ? `${article.read_time} min read`
      : "Story",
    date: dateValue
      ? new Date(dateValue).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Latest Story",
    image: article.cover_image || "",
    content: article.content || "",
  };
};

function HomePage() {
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState("");

  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(readingListKey) || "[]"
      ).map(String);
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState("All");
  const [readingMode, setReadingMode] = useState(false);
  const [fontScale, setFontScale] = useState(100);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [formStatus, setFormStatus] = useState("");

  // Save reading list
  useEffect(() => {
    localStorage.setItem(
      readingListKey,
      JSON.stringify(savedIds)
    );
  }, [savedIds]);

  // Fetch published articles from backend
  useEffect(() => {
    const controller = new AbortController();

    async function loadArticles() {
      setArticlesLoading(true);
      setArticlesError("");

      try {
        const response = await fetch(
          `${API_BASE}/api/articles`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to fetch articles.");
        }

        const result = await response.json();

        const list = Array.isArray(result)
          ? result
          : Array.isArray(result.articles)
          ? result.articles
          : Array.isArray(result.data)
          ? result.data
          : null;

        if (!list) {
          throw new Error("Unexpected articles API response.");
        }

        setArticles(list.map(normalizeArticle));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Articles error:", error);
          setArticlesError(
            "Stories are temporarily unavailable. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setArticlesLoading(false);
        }
      }
    }

    loadArticles();

    return () => controller.abort();
  }, []);

  // Reading list
  const toggleSave = (id) => {
    const articleId = String(id);

    setSavedIds((previous) =>
      previous.includes(articleId)
        ? previous.filter((item) => item !== articleId)
        : [...previous, articleId]
    );
  };

  // Dynamic categories
  const categories = [
    "All",
    ...new Set(articles.map((article) => article.category)),
    "Saved",
  ];

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    if (activeCategory === "Saved") {
      return savedIds.includes(article.id);
    }

    if (activeCategory === "All") {
      return true;
    }

    return article.category === activeCategory;
  });

  const openArticle = (article) => {
    setSelectedArticle(article);
    setFontScale(100);
  };

  const closeArticle = () => {
    setSelectedArticle(null);
  };

  const handleNewsletter = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setFormStatus("Please enter your email address.");
      return;
    }

    // Demo only. Connect newsletter backend for real subscriptions.
    setFormStatus(
      "Thank you for your interest in ScrollTheory!"
    );
    setEmail("");
  };

  const currentThought = dailyThoughts[thoughtIndex];

  return (
    <div className={`st-home ${readingMode ? "st-calm-mode" : ""}`}>

      {/* ANNOUNCEMENT */}
      <div className="st-announcement">
        <span>Ideas worth your time.</span>
        <span>Read Beyond the Scroll.</span>
      </div>

      {/* HERO */}
      <section className="st-hero">
        <div className="st-hero-content">
          <span className="st-eyebrow">
            AN INDEPENDENT DIGITAL PUBLICATION
          </span>

          <h1>
            Read beyond
            <br />
            <span>the scroll.</span>
          </h1>

          <p>
            Thoughtful stories for curious minds.
            Explore ideas, culture, technology, and the
            little things that make life meaningful.
          </p>

          <div className="st-hero-actions">
            <a href="#stories" className="st-btn st-btn-primary">
              Explore Stories ↗
            </a>

            <a href="#about" className="st-btn st-btn-outline">
              Our Story
            </a>
          </div>

          <div className="st-hero-note">
            <span className="st-dot" />
            A little less noise. A little more meaning.
          </div>
        </div>

        <div className="st-hero-visual">
          <img
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85"
            alt="A quiet library filled with books"
          />

          <div className="st-hero-image-caption">
            <span>THE ART OF SLOW READING</span>
            <span>SCROLLTHEORY / 001</span>
          </div>
        </div>
      </section>

      {/* EDITORIAL STRIP */}
      <section className="st-editorial-strip">
        <span>CURIOUS MINDS</span>
        <span>THOUGHTFUL STORIES</span>
        <span>FRESH PERSPECTIVES</span>
        <span>MEANINGFUL READING</span>
      </section>

      {/* DAILY THOUGHT */}
      <section className="st-thought-section">
        <div className="st-thought-inner">
          <span className="st-eyebrow">A MOMENT TO PAUSE</span>
          <h2>Today's Thought</h2>

          <blockquote key={thoughtIndex}>
            “{currentThought}”
          </blockquote>

          <p className="st-thought-author">
            — A ScrollTheory Thought
          </p>

          <button
            type="button"
            className="st-text-button"
            onClick={() =>
              setThoughtIndex(
                (previous) =>
                  (previous + 1) % dailyThoughts.length
              )
            }
          >
            Another thought ↗
          </button>
        </div>
      </section>

      {/* STORIES */}
      <section className="st-stories-section" id="stories">
        <div className="st-section-heading">
          <div>
            <span className="st-eyebrow">
              THE EDITOR'S SELECTION
            </span>

            <h2>Stories worth your scroll.</h2>

            <p>
              Explore perspectives that stay with you
              long after you've finished reading.
            </p>
          </div>

          <div className="st-reading-tools">
            <button
              type="button"
              className={`st-tool-button ${
                readingMode ? "active" : ""
              }`}
              onClick={() => setReadingMode((prev) => !prev)}
              aria-pressed={readingMode}
            >
              {readingMode
                ? "Exit Calm Mode"
                : "Calm Reading Mode"}
            </button>

            <span className="st-saved-count">
              ♡ {savedIds.length} saved
            </span>
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="st-category-filters">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={`st-filter-btn ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
              {category === "Saved" && ` (${savedIds.length})`}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {articlesLoading && (
          <div className="st-empty-state">
            <h3>Gathering thoughtful stories...</h3>
            <p>Please wait while we load the latest articles.</p>
          </div>
        )}

        {/* ERROR */}
        {!articlesLoading && articlesError && (
          <div className="st-empty-state">
            <h3>Stories are temporarily unavailable.</h3>
            <p>{articlesError}</p>

            <button
              type="button"
              className="st-btn st-btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* ARTICLE CARDS */}
        {!articlesLoading &&
          !articlesError &&
          filteredArticles.length > 0 && (
            <div className="st-article-grid">
              {filteredArticles.map((article) => {
                const isSaved = savedIds.includes(article.id);

                return (
                  <article
                    className="st-article-card"
                    key={article.id}
                  >
                    <div className="st-article-image-wrap">
                      {article.image ? (
                        <img
                          className="st-article-image"
                          src={article.image}
                          alt={article.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="st-image-placeholder">
                          <span>ScrollTheory</span>
                        </div>
                      )}

                      <span className="st-article-category">
                        {article.label}
                      </span>

                      <button
                        type="button"
                        className={`st-save-btn ${
                          isSaved ? "saved" : ""
                        }`}
                        onClick={() => toggleSave(article.id)}
                        aria-label={
                          isSaved
                            ? "Remove from reading list"
                            : "Save to reading list"
                        }
                        aria-pressed={isSaved}
                      >
                        {isSaved ? "♥" : "♡"}
                      </button>
                    </div>

                    <div className="st-article-content">
                      <div className="st-article-meta">
                        <span>{article.date}</span>
                        <span>{article.readTime}</span>
                      </div>

                      <h3>{article.title}</h3>

                      <p>{article.excerpt}</p>

                      <div className="st-article-bottom">
                        <span>{article.author}</span>

                        <button
                          type="button"
                          className="st-read-link"
                          onClick={() => openArticle(article)}
                        >
                          Read Story ↗
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        {/* EMPTY STATE */}
        {!articlesLoading &&
          !articlesError &&
          filteredArticles.length === 0 && (
            <div className="st-empty-state">
              <h3>
                {activeCategory === "Saved"
                  ? "Your reading list is waiting."
                  : "No stories here just yet."}
              </h3>

              <p>
                {activeCategory === "Saved"
                  ? "Save a story with the ♡ button and it will appear here."
                  : "New stories are on their way."}
              </p>

              <button
                type="button"
                className="st-btn st-btn-primary"
                onClick={() => setActiveCategory("All")}
              >
                Discover Stories
              </button>
            </div>
          )}

        <div className="st-stories-footer">
          <p>
            A few good reads can change your perspective.
          </p>

          <Link to="/articles" className="st-btn st-btn-outline">
            Explore Articles ↗
          </Link>
        </div>
      </section>

      {/* MAGAZINE */}
      <section className="st-magazine-section" id="magazine">
        <div className="st-magazine-image">
          <img
            src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=85"
            alt="Books and printed reading material"
            loading="lazy"
          />
        </div>

        <div className="st-magazine-content">
          <span className="st-eyebrow">
            THE SCROLLTHEORY COLLECTION
          </span>

          <h2>
            More than
            <br />
            another read.
          </h2>

          <p>
            Discover carefully curated ideas, thoughtful
            essays, and stories created for readers who
            want to explore a little deeper.
          </p>

          <Link to="/magazine" className="st-btn st-btn-primary">
            Discover Our Magazine ↗
          </Link>
        </div>
      </section>

      {/* BOOKS */}
      <section className="st-books-section" id="books">
        <div className="st-books-heading">
          <span className="st-eyebrow">FOR THE BOOK LOVERS</span>
          <h2>A bookshelf for curious minds.</h2>
          <p>
            Good books open doors to unfamiliar worlds
            and unexpected ideas.
          </p>
        </div>

        <div className="st-book-grid">
          <div className="st-book-item">
            <span className="st-book-number">01 / DISCOVER</span>
            <h3>Ideas that stay.</h3>
            <p>
              Explore books that inspire reflection and
              a different way of looking at things.
            </p>
          </div>

          <div className="st-book-item">
            <span className="st-book-number">02 / EXPLORE</span>
            <h3>Perspectives that grow.</h3>
            <p>
              From culture and creativity to technology
              and everyday life.
            </p>
          </div>

          <div className="st-book-item">
            <span className="st-book-number">03 / READ</span>
            <h3>Your next chapter.</h3>
            <p>
              Find your next interesting read and
              make space for new ideas.
            </p>
          </div>
        </div>

        <div className="st-books-cta">
          <Link to="/books" className="st-btn st-btn-primary">
            Explore Books ↗
          </Link>
        </div>
      </section>

      {/* ABOUT */}
      <section className="st-about-section" id="about">
        <div className="st-about-label">
          <span className="st-eyebrow">WHY SCROLLTHEORY?</span>
          <span className="st-about-mark">ST.</span>
        </div>

        <div className="st-about-content">
          <h2>
            In a world full of content,
            <span> let's make room for meaning.</span>
          </h2>

          <p>
            ScrollTheory is a digital publication built
            around curiosity, thoughtful storytelling,
            and ideas that deserve more than a passing glance.
          </p>

          <p>
            We believe reading can be a pause, a discovery,
            or the beginning of a completely new perspective.
          </p>

          <Link to="/about" className="st-text-button">
            Get to know us ↗
          </Link>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="st-newsletter-section" id="newsletter">
        <span className="st-eyebrow">
          A LETTER FOR YOUR INBOX
        </span>

        <h2>
          Less noise.
          <br />
          <span>More thoughtful reads.</span>
        </h2>

        <p>
          Discover ideas worth thinking about.
          Join our reading community.
        </p>

        <form
          className="st-newsletter-form"
          onSubmit={handleNewsletter}
        >
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            aria-label="Email address"
          />

          <button type="submit" className="st-btn st-btn-primary">
            Join Us ↗
          </button>
        </form>

        {formStatus && (
          <p className="st-form-status" role="status">
            {formStatus}
          </p>
        )}

        <span className="st-newsletter-note">
          Thoughtful reading, without the unnecessary noise.
        </span>
      </section>

      {/* CONTACT */}
      <section className="st-contact-preview" id="contact">
        <div>
          <span className="st-eyebrow">LET'S CONNECT</span>
          <h2>Have a story in mind?</h2>
          <p>
            Ideas, feedback, collaborations, or just a
            thoughtful hello. We'd love to hear from you.
          </p>
        </div>

        <Link to="/contact" className="st-btn st-btn-primary">
          Talk to Us ↗
        </Link>
      </section>

      {/* ARTICLE MODAL */}
      {selectedArticle && (
        <div
          className="st-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeArticle();
            }
          }}
        >
          <article
            className={`st-article-modal ${
              readingMode ? "st-modal-calm" : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="st-modal-title"
          >
            <div className="st-modal-toolbar">
              <button
                type="button"
                className="st-tool-button"
                onClick={() =>
                  setFontScale((s) => Math.max(80, s - 10))
                }
                disabled={fontScale <= 80}
              >
                A−
              </button>

              <span>{fontScale}%</span>

              <button
                type="button"
                className="st-tool-button"
                onClick={() =>
                  setFontScale((s) => Math.min(140, s + 10))
                }
                disabled={fontScale >= 140}
              >
                A+
              </button>

              <button
                type="button"
                className="st-modal-close"
                onClick={closeArticle}
                aria-label="Close article"
              >
                ✕
              </button>
            </div>

            <div className="st-modal-article-body">
              <span className="st-eyebrow">
                {selectedArticle.label}
              </span>

              <h2 id="st-modal-title">
                {selectedArticle.title}
              </h2>

              <div className="st-article-meta">
                <span>{selectedArticle.author}</span>
                <span>{selectedArticle.readTime}</span>
              </div>

              {selectedArticle.image && (
                <img
                  className="st-modal-image"
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                />
              )}

              <p className="st-modal-excerpt">
                {selectedArticle.excerpt}
              </p>

              <div
                className="st-modal-story"
                style={{ fontSize: `${fontScale}%` }}
              >
                {selectedArticle.content
                  .split(/\n\s*\n/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>

              <button
                type="button"
                className="st-btn st-btn-outline"
                onClick={() => toggleSave(selectedArticle.id)}
              >
                {savedIds.includes(selectedArticle.id)
                  ? "♥ Saved to Reading List"
                  : "♡ Save this Story"}
              </button>

              {selectedArticle.slug && (
                <Link
                  className="st-text-button st-modal-full-link"
                  to={`/articles/${selectedArticle.slug}`}
                >
                  Open Full Article ↗
                </Link>
              )}
            </div>
          </article>
        </div>
      )}

      {/* PAGE STYLES */}
      <style>{`
        .st-home {
          --st-green: #20382f;
          --st-gold: #a77d3e;
          --st-cream: #faf9f6;
          --st-text: #282c27;
          --st-muted: #72746d;
          background: var(--st-cream);
          color: var(--st-text);
          font-family: "DM Sans", sans-serif;
          overflow: clip;
        }

        .st-home * { box-sizing: border-box; }

        .st-home h1, .st-home h2, .st-home h3 {
          font-family: "Playfair Display", Georgia, serif;
          color: var(--st-green);
          font-weight: 500;
        }

        .st-announcement {
          padding: 10px 6%;
          background: var(--st-green);
          color: #f9f7ef;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          font-size: 11px;
          letter-spacing: 1px;
        }

        .st-hero {
          display: grid;
          grid-template-columns: 1fr .9fr;
          align-items: center;
          gap: 5%;
          padding: 85px 7%;
        }

        .st-hero-content { max-width: 620px; }

        .st-eyebrow {
          display: inline-block;
          color: var(--st-gold);
          font-size: 10px;
          letter-spacing: 2px;
          font-weight: 700;
          line-height: 1.8;
        }

        .st-hero h1 {
          font-size: clamp(54px, 7vw, 94px);
          letter-spacing: -3px;
          line-height: 1.03;
          margin: 22px 0;
        }

        .st-hero h1 span,
        .st-newsletter-section h2 span,
        .st-about-content h2 span {
          color: var(--st-gold);
          font-style: italic;
        }

        .st-hero-content > p {
          color: var(--st-muted);
          max-width: 480px;
          font-size: 15px;
          line-height: 1.9;
        }

        .st-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 30px;
        }

        .st-btn {
          min-height: 46px;
          padding: 13px 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border: 1px solid var(--st-green);
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: .2s ease;
        }

        .st-btn-primary {
          background: var(--st-green);
          color: white;
        }

        .st-btn-primary:hover {
          background: #315544;
          border-color: #315544;
          transform: translateY(-2px);
        }

        .st-btn-outline {
          color: var(--st-green);
          background: transparent;
        }

        .st-btn-outline:hover {
          background: var(--st-green);
          color: white;
        }

        .st-hero-note {
          margin-top: 28px;
          color: var(--st-muted);
          display: flex;
          gap: 10px;
          align-items: center;
          font-size: 11px;
        }

        .st-dot {
          height: 7px;
          width: 7px;
          border-radius: 50%;
          background: var(--st-gold);
        }

        .st-hero-visual { position: relative; min-width: 0; }

        .st-hero-visual > img {
          width: 100%;
          height: 510px;
          object-fit: cover;
          display: block;
        }

        .st-hero-image-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 16px;
          background: rgba(32,56,47,.92);
          color: white;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .st-editorial-strip {
          padding: 23px 7%;
          background: #f0eee7;
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          color: var(--st-green);
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .st-thought-section {
          padding: 80px 7%;
          text-align: center;
          border-bottom: 1px solid #e9e6de;
        }

        .st-thought-inner { max-width: 750px; margin: auto; }

        .st-thought-section h2 { font-size: 36px; margin: 12px 0 25px; }

        .st-thought-section blockquote {
          margin: 0 auto;
          font-family: "Playfair Display", Georgia, serif;
          font-size: clamp(24px, 4vw, 38px);
          line-height: 1.4;
          color: var(--st-green);
        }

        .st-thought-author {
          color: var(--st-muted);
          font-size: 12px;
          margin: 20px 0;
        }

        .st-text-button {
          color: var(--st-green);
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--st-gold);
          padding: 6px 0;
          font-family: inherit;
          font-size: 12px;
          text-decoration: none;
          cursor: pointer;
        }

        .st-stories-section {
          padding: 90px 7%;
          scroll-margin-top: 30px;
        }

        .st-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }

        .st-section-heading h2,
        .st-books-heading h2 {
          font-size: clamp(34px, 4vw, 50px);
          letter-spacing: -1px;
          margin: 12px 0;
        }

        .st-section-heading p,
        .st-books-heading p {
          color: var(--st-muted);
          font-size: 14px;
          line-height: 1.8;
        }

        .st-reading-tools {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .st-tool-button {
          background: transparent;
          color: var(--st-green);
          border: 1px solid #d9d8ce;
          padding: 10px 13px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
        }

        .st-tool-button.active {
          background: var(--st-green);
          color: white;
        }

        .st-tool-button:disabled { opacity: .4; cursor: not-allowed; }

        .st-saved-count { font-size: 12px; color: var(--st-muted); }

        .st-category-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 30px 0;
        }

        .st-filter-btn {
          border: 1px solid #deddd4;
          background: transparent;
          color: var(--st-muted);
          padding: 10px 16px;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
        }

        .st-filter-btn.active {
          background: var(--st-green);
          color: white;
          border-color: var(--st-green);
        }

        .st-article-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .st-article-card {
          min-width: 0;
          border: 1px solid #e8e5dc;
          background: #fffefa;
          transition: transform .25s ease;
        }

        .st-article-card:hover { transform: translateY(-4px); }

        .st-article-image-wrap { position: relative; overflow: hidden; }

        .st-article-image {
          display: block;
          width: 100%;
          height: 235px;
          object-fit: cover;
          transition: transform .4s ease;
        }

        .st-image-placeholder {
          height: 235px;
          display: grid;
          place-items: center;
          background: #efede5;
          color: var(--st-green);
          font-family: "Playfair Display", Georgia, serif;
          font-size: 24px;
        }

        .st-article-card:hover .st-article-image { transform: scale(1.035); }

        .st-article-category {
          position: absolute;
          left: 14px;
          bottom: 14px;
          background: var(--st-cream);
          color: var(--st-green);
          padding: 8px 10px;
          font-size: 9px;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .st-save-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 37px;
          height: 37px;
          border: none;
          background: var(--st-cream);
          color: var(--st-green);
          font-size: 22px;
          cursor: pointer;
          border-radius: 50%;
        }

        .st-save-btn.saved { color: #b34848; }

        .st-article-content { padding: 22px; }

        .st-article-meta {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 10px;
          color: var(--st-muted);
          font-size: 10px;
        }

        .st-article-content h3 {
          font-size: 25px;
          line-height: 1.3;
          margin: 18px 0 12px;
        }

        .st-article-content > p {
          color: var(--st-muted);
          font-size: 12px;
          line-height: 1.9;
          min-height: 68px;
        }

        .st-article-bottom {
          border-top: 1px solid #ebe8df;
          padding-top: 18px;
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .st-article-bottom > span {
          color: var(--st-muted);
          font-size: 10px;
        }

        .st-read-link {
          border: none;
          background: none;
          color: var(--st-green);
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .st-empty-state {
          padding: 65px 20px;
          text-align: center;
          border: 1px dashed #d9d8ce;
        }

        .st-empty-state h3 { font-size: 28px; }
        .st-empty-state p { color: var(--st-muted); margin-bottom: 24px; }

        .st-stories-footer {
          margin-top: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }

        .st-stories-footer p { color: var(--st-muted); font-size: 12px; }

        .st-magazine-section {
          background: #efede5;
          padding: 80px 7%;
          display: grid;
          grid-template-columns: .9fr 1fr;
          align-items: center;
          gap: 9%;
        }

        .st-magazine-image img {
          display: block;
          width: 100%;
          height: 430px;
          object-fit: cover;
        }

        .st-magazine-content h2 {
          font-size: clamp(44px, 5vw, 65px);
          line-height: 1.08;
          margin: 18px 0;
          letter-spacing: -1px;
        }

        .st-magazine-content p {
          color: var(--st-muted);
          line-height: 1.9;
          font-size: 14px;
          max-width: 460px;
          margin-bottom: 28px;
        }

        .st-books-section { padding: 90px 7%; }

        .st-books-heading {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 45px;
        }

        .st-book-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border-top: 1px solid #dfdcd3;
          border-bottom: 1px solid #dfdcd3;
        }

        .st-book-item {
          padding: 32px;
          border-right: 1px solid #dfdcd3;
        }

        .st-book-item:last-child { border-right: none; }

        .st-book-number {
          font-size: 10px;
          color: var(--st-gold);
          letter-spacing: 1.5px;
          font-weight: 700;
        }

        .st-book-item h3 { font-size: 27px; margin: 20px 0 12px; }

        .st-book-item p {
          color: var(--st-muted);
          font-size: 13px;
          line-height: 1.9;
        }

        .st-books-cta { text-align: center; margin-top: 35px; }

        .st-about-section {
          background: var(--st-green);
          padding: 80px 7%;
          display: grid;
          grid-template-columns: .7fr 1.3fr;
          gap: 10%;
        }

        .st-about-label .st-eyebrow { color: #d5b780; }

        .st-about-mark {
          display: block;
          color: #f7f4eb;
          font-family: "Playfair Display", Georgia, serif;
          font-size: 100px;
          line-height: 1.3;
          margin-top: 25px;
        }

        .st-about-content h2 {
          color: #faf9f6;
          font-size: clamp(34px, 4vw, 52px);
          line-height: 1.2;
          margin: 0 0 24px;
        }

        .st-about-content h2 span { display: block; }

        .st-about-content p {
          color: #d1d8d1;
          font-size: 14px;
          line-height: 1.9;
          max-width: 580px;
        }

        .st-about-content .st-text-button {
          color: white;
          display: inline-block;
          margin-top: 16px;
          border-color: #d5b780;
        }

        .st-newsletter-section { padding: 90px 7%; text-align: center; }

        .st-newsletter-section h2 {
          font-size: clamp(40px, 5vw, 65px);
          line-height: 1.1;
          margin: 18px 0;
        }

        .st-newsletter-section > p {
          color: var(--st-muted);
          font-size: 13px;
          line-height: 1.8;
        }

        .st-newsletter-form {
          display: flex;
          justify-content: center;
          gap: 10px;
          max-width: 550px;
          margin: 30px auto 16px;
        }

        .st-newsletter-form input {
          flex: 1;
          min-width: 0;
          padding: 14px;
          border: 1px solid #d9d8ce;
          background: #fffefa;
          color: var(--st-text);
          font: inherit;
          font-size: 12px;
          outline-offset: 3px;
        }

        .st-newsletter-note { color: var(--st-muted); font-size: 10px; }
        .st-form-status { color: var(--st-green); font-size: 12px; }

        .st-contact-preview {
          background: #efede5;
          padding: 55px 7%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .st-contact-preview h2 { font-size: 35px; margin: 10px 0; }

        .st-contact-preview p {
          max-width: 550px;
          color: var(--st-muted);
          font-size: 13px;
          line-height: 1.8;
        }

        .st-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(12,24,18,.72);
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .st-article-modal {
          width: min(780px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: var(--st-cream);
          color: var(--st-text);
        }

        .st-modal-toolbar {
          position: sticky;
          top: 0;
          z-index: 2;
          background: var(--st-cream);
          border-bottom: 1px solid #e3e0d7;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        .st-modal-toolbar > span {
          font-size: 11px;
          color: var(--st-muted);
        }

        .st-modal-close {
          margin-left: 10px;
          width: 35px;
          height: 35px;
          border: 1px solid #ddd9cf;
          background: transparent;
          color: var(--st-green);
          cursor: pointer;
        }

        .st-modal-article-body {
          max-width: 650px;
          margin: auto;
          padding: 35px 30px 45px;
        }

        .st-modal-article-body h2 {
          font-size: clamp(35px, 5vw, 54px);
          line-height: 1.15;
          margin: 14px 0 20px;
        }

        .st-modal-image {
          display: block;
          width: 100%;
          max-height: 360px;
          object-fit: cover;
          margin: 26px 0;
        }

        .st-modal-excerpt {
          font-family: "Playfair Display", Georgia, serif;
          color: var(--st-green);
          font-size: 21px;
          line-height: 1.6;
        }

        .st-modal-story {
          line-height: 1.95;
          color: #555950;
          margin: 25px 0 30px;
          white-space: normal;
          overflow-wrap: anywhere;
        }

        .st-modal-story p { margin: 0 0 22px; }

        .st-modal-full-link {
          display: inline-block;
          margin-left: 18px;
        }

        .st-calm-mode .st-article-card,
        .st-calm-mode .st-hero-visual,
        .st-calm-mode .st-editorial-strip,
        .st-calm-mode .st-magazine-section {
          display: none;
        }

        .st-calm-mode .st-article-grid {
          grid-template-columns: 1fr;
          max-width: 680px;
          margin: auto;
        }

        .st-calm-mode .st-article-content { padding: 32px; }
        .st-calm-mode .st-article-content h3 { font-size: 32px; }
        .st-calm-mode .st-article-content > p { font-size: 15px; }

        .st-calm-mode .st-stories-section { background: #f4f1e8; }

        .st-modal-calm .st-modal-story {
          max-width: 580px;
          margin-left: auto;
          margin-right: auto;
          line-height: 2.1;
        }

        @media (max-width: 900px) {
          .st-hero {
            grid-template-columns: 1fr .8fr;
            padding: 65px 5%;
          }

          .st-hero h1 { font-size: clamp(46px, 6vw, 68px); }
          .st-hero-visual > img { height: 400px; }

          .st-stories-section,
          .st-books-section,
          .st-newsletter-section { padding: 70px 5%; }

          .st-article-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .st-about-section { padding: 70px 5%; }

          .st-section-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .st-magazine-section { gap: 5%; padding: 60px 5%; }
        }

        @media (max-width: 600px) {
          .st-announcement {
            justify-content: center;
            text-align: center;
            font-size: 9px;
          }

          .st-announcement span:last-child { display: none; }

          .st-hero {
            grid-template-columns: 1fr;
            gap: 35px;
            padding: 55px 5%;
          }

          .st-hero h1 {
            font-size: clamp(52px, 14vw, 76px);
            letter-spacing: -2px;
          }

          .st-hero-visual > img { height: 320px; }

          .st-editorial-strip {
            justify-content: center;
            text-align: center;
            font-size: 9px;
          }

          .st-thought-section { padding: 60px 6%; }
          .st-thought-section h2 { font-size: 30px; }

          .st-article-grid { grid-template-columns: 1fr; }
          .st-article-image { height: 240px; }

          .st-reading-tools { align-items: flex-start; }

          .st-stories-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .st-magazine-section {
            grid-template-columns: 1fr;
            gap: 30px;
            padding: 55px 5%;
          }

          .st-magazine-image img { height: 300px; }

          .st-book-grid { grid-template-columns: 1fr; }

          .st-book-item {
            border-right: none;
            border-bottom: 1px solid #dfdcd3;
            padding: 25px 5px;
          }

          .st-book-item:last-child { border-bottom: none; }

          .st-about-section {
            grid-template-columns: 1fr;
            gap: 25px;
          }

          .st-about-mark { font-size: 65px; margin-top: 10px; }

          .st-newsletter-form { flex-direction: column; }

          .st-newsletter-form input,
          .st-newsletter-form button { width: 100%; }

          .st-contact-preview { padding: 45px 5%; }

          .st-modal-overlay { padding: 8px; }
          .st-article-modal { max-height: 94vh; }

          .st-modal-article-body { padding: 28px 18px; }
          .st-modal-article-body h2 { font-size: 36px; }
          .st-modal-image { max-height: 250px; }

          .st-modal-full-link {
            margin: 18px 0 0;
            display: block;
            width: fit-content;
          }
        }
      `}</style>
    </div>
  );
}

export default HomePage;
