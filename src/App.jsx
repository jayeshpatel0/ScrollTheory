
import "./style.css";

const featuredArticles = [
  {
    category: "MIND & CULTURE",
    title: "Why We Can't Stop Scrolling",
    description:
      "The psychology behind our endless feeds and our search for something meaningful.",
    author: "ScrollTheory Editorial",
    time: "6 min read",
    image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85",
  },
  {
    category: "TECHNOLOGY",
    title: "Are We Thinking Less in the Age of AI?",
    description:
      "A closer look at how technology is changing the way we learn and think.",
    author: "ScrollTheory Editorial",
    time: "5 min read",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
  },
  {
    category: "LIFESTYLE",
    title: "The Quiet Beauty of Starting Again",
    description:
      "Sometimes a new chapter begins with one very small decision.",
    author: "ScrollTheory Editorial",
    time: "4 min read",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85",
  },
];

function App() {
  return (
    <div className="app">
      <div className="announcement">
        IDEAS FOR THE CURIOUS — WELCOME TO SCROLLTHEORY
      </div>

      <header className="navbar">
        <a href="#home" className="logo">
          <span className="logo-icon">S.</span>
          ScrollTheory
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#articles">Articles</a>
          <a href="#magazine">Magazine</a>
          <a href="#books">Books</a>
          <a href="#about">About</a>
        </nav>

        <a className="nav-button" href="#articles">
          Start Reading ↗
        </a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              THE INTERNET, WITH A LITTLE MORE MEANING.
            </span>

            <h1>
              Don't just scroll.
              <br />
              <span>Discover.</span>
            </h1>

            <p>
              Stories, perspectives and ideas worth your time.
              Explore thoughtful articles, digital magazines
              and books for the curious mind.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#articles">
                Explore Stories <span>↗</span>
              </a>
              <a className="text-button" href="#books">
                Discover Books →
              </a>
            </div>

            <div className="hero-note">
              <span className="note-dot" />
              A space for curious minds.
            </div>
          </div>

          <div className="hero-visual">
            <img
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1100&q=85"
              alt="A peaceful library filled with books"
            />
            <div className="floating-card">
              <span>YOUR NEXT GOOD READ</span>
              <strong>Ideas that stay with you.</strong>
              <span className="card-arrow">↗</span>
            </div>
            <div className="hero-index">VOL. 01 — READ SOMETHING NEW</div>
          </div>
        </section>

        <section className="editorial-strip">
          <span>READ</span>
          <span>THINK</span>
          <span>QUESTION</span>
          <span>DISCOVER</span>
          <span>REPEAT ↗</span>
        </section>

        <section className="section articles-section" id="articles">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE READING LIST</span>
              <h2>Stories worth your scroll.</h2>
              <p>Fresh perspectives for a curious mind.</p>
            </div>
            <a href="#articles" className="view-link">
              Explore articles ↗
            </a>
          </div>

          <div className="article-grid">
            {featuredArticles.map((article, index) => (
              <article className="article-card" key={article.title}>
                <a className="article-image" href="#about">
                  <img src={article.image} alt={article.title} />
                  <span className="image-number">
                    0{index + 1}
                  </span>
                </a>
                <div className="article-info">
                  <span className="category">{article.category}</span>
                  <h3>
                    <a href="#about">{article.title}</a>
                  </h3>
                  <p>{article.description}</p>
                  <div className="article-meta">
                    <span>{article.author}</span>
                    <span>{article.time}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="magazine-section" id="magazine">
          <div className="magazine-copy">
            <span className="eyebrow">THE DIGITAL MAGAZINE</span>
            <h2>A new perspective, every edition.</h2>
            <p>
              A home for ideas, culture, creativity and conversations
              that deserve a little more attention.
            </p>
            <a href="#articles" className="light-button">
              Explore the Magazine ↗
            </a>
          </div>
          <div className="magazine-art">
            <div className="magazine-cover">
              <span>SCROLLTHEORY</span>
              <div className="cover-title">
                THE ART
                <br />
                OF THINKING
                <br />
                DIFFERENTLY.
              </div>
              <div className="cover-bottom">
                <span>ISSUE 001</span>
                <span>IDEAS • CULTURE • LIFE</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section books-section" id="books">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR DIGITAL BOOKSHELF</span>
              <h2>Turn the next page.</h2>
              <p>Discover books and stories, one chapter at a time.</p>
            </div>
          </div>

          <div className="books-panel">
            <div className="book-icon">S.</div>
            <div>
              <span className="category">COMING TO YOUR BOOKSHELF</span>
              <h3>Your next chapter starts here.</h3>
              <p>
                Original books, thoughtful writing and reading
                experiences by ScrollTheory authors.
              </p>
            </div>
            <a href="#about" className="book-link">
              Explore Books ↗
            </a>
          </div>
        </section>

        <section className="about-section" id="about">
          <span className="eyebrow">A NOTE FROM SCROLLTHEORY</span>
          <h2>The world is full of noise.<br />Let's make room for ideas.</h2>
          <p>
            ScrollTheory is a space for stories, perspectives and
            meaningful reading. Built for minds that never stop
            asking why.
          </p>
          <a className="primary-button" href="#home">
            Back to the beginning ↑
          </a>
        </section>
      </main>

      <footer className="footer">
        <a href="#home" className="logo footer-logo">
          <span className="logo-icon">S.</span>
          ScrollTheory
        </a>
        <p>Read beyond the scroll.</p>
        <span>© {new Date().getFullYear()} ScrollTheory</span>
      </footer>
    </div>
  );
}

export default App;
