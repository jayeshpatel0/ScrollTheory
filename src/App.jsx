import { useEffect, useState } from "react";
import "./style.css";

const featuredArticles = [
  {
    id: "scrolling",
    category: "MIND & CULTURE",
    title: "Why We Can't Stop Scrolling",
    description: "The psychology behind our endless feeds and our search for something meaningful.",
    author: "ScrollTheory Editorial",
    time: "6 min read",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85",
    excerpt: "Our attention is valuable. Every notification, recommendation and tiny red badge competes for it. The first step toward a more intentional digital life isn't deleting every app—it's noticing what deserves your attention."
  },
  {
    id: "ai-thinking",
    category: "TECHNOLOGY",
    title: "Are We Thinking Less in the Age of AI?",
    description: "A closer look at how technology is changing the way we learn and think.",
    author: "ScrollTheory Editorial",
    time: "5 min read",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
    excerpt: "AI can accelerate a first draft, explain a difficult concept or help us explore alternatives. The important question is what we do next: accept the first answer, or use it as the beginning of better questions?"
  },
  {
    id: "starting-again",
    category: "LIFESTYLE",
    title: "The Quiet Beauty of Starting Again",
    description: "Sometimes a new chapter begins with one very small decision.",
    author: "ScrollTheory Editorial",
    time: "4 min read",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85",
    excerpt: "A beginning rarely arrives with a grand announcement. More often, it looks like clearing a desk, opening a notebook or taking one honest step. Small rituals make change feel possible."
  },
];

const dailyThoughts = [
  { quote: "Pay attention to what you pay attention to.", credit: "A ScrollTheory reminder" },
  { quote: "A good question can open a door a quick answer never finds.", credit: "A ScrollTheory reminder" },
  { quote: "Make room for the ideas that ask you to slow down.", credit: "A ScrollTheory reminder" },
  { quote: "Curiosity is a practice, not a destination.", credit: "A ScrollTheory reminder" },
];

function App() {
  const [savedIds, setSavedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("scrolltheory-reading-list") || "[]"); }
    catch { return []; }
  });
  const [filter, setFilter] = useState("ALL");
  const [quoteIndex] = useState(() => Math.floor(Date.now() / 86400000) % dailyThoughts.length);
  const [readingMode, setReadingMode] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [formStatus, setFormStatus] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");

  useEffect(() => {
    localStorage.setItem("scrolltheory-reading-list", JSON.stringify(savedIds));
  }, [savedIds]);

  const toggleSaved = (id) => {
    setSavedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const shownArticles = featuredArticles.filter((article) =>
    filter === "ALL" || (filter === "SAVED" ? savedIds.includes(article.id) : article.category === filter)
  );

  const handleContactSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const subject = encodeURIComponent(`ScrollTheory inquiry: ${data.get("topic")}`);
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nTopic: ${data.get("topic")}\n\n${data.get("message")}`
    );
    window.location.href = `mailto:hello@scrolltheory.example?subject=${subject}&body=${body}`;
    setFormStatus("Your email app should open with your message prepared. Replace hello@scrolltheory.example with your real inbox before publishing.");
  };

  const handleNewsletter = (event) => {
    event.preventDefault();
    setNewsletterEmail("");
    setFormStatus("Newsletter signup design is ready, but it is not connected to an email list yet. Connect an email provider before collecting subscribers.");
  };

  return (
    <div className={`app ${readingMode ? "reading-mode" : ""}`}>
      <div className="announcement">IDEAS FOR THE CURIOUS — WELCOME TO SCROLLTHEORY</div>

      <header className="navbar">
        <a href="#home" className="logo"><span className="logo-icon">S.</span>ScrollTheory</a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#home">Home</a><a href="#articles">Articles</a><a href="#magazine">Magazine</a>
          <a href="#books">Books</a><a href="#about">About</a><a href="#contact">Contact</a>
        </nav>
        <a className="nav-button" href="#articles">Start Reading ↗</a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">THE INTERNET, WITH A LITTLE MORE MEANING.</span>
            <h1>Don't just scroll.<br /><span>Discover.</span></h1>
            <p>Stories, perspectives and ideas worth your time. Explore thoughtful articles, digital magazines and books for the curious mind.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#articles">Explore Stories <span>↗</span></a>
              <a className="text-button" href="#books">Discover Books →</a>
            </div>
            <div className="hero-note"><span className="note-dot" />A space for curious minds.</div>
          </div>
          <div className="hero-visual">
            <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1100&q=85" alt="A peaceful library filled with books" />
            <div className="floating-card"><span>YOUR NEXT GOOD READ</span><strong>Ideas that stay with you.</strong><span className="card-arrow">↗</span></div>
            <div className="hero-index">VOL. 01 — READ SOMETHING NEW</div>
          </div>
        </section>

        <section className="editorial-strip"><span>READ</span><span>THINK</span><span>QUESTION</span><span>DISCOVER</span><span>REPEAT ↗</span></section>

        <section className="daily-thought" aria-labelledby="thought-title">
          <div className="thought-mark">“</div>
          <div><span className="eyebrow">A MOMENT TO PAUSE</span><h2 id="thought-title">{dailyThoughts[quoteIndex].quote}</h2><p>{dailyThoughts[quoteIndex].credit} · Daily thought</p></div>
          <a href="#articles" className="view-link">Take it with you ↗</a>
        </section>

        <section className="section articles-section" id="articles">
          <div className="section-heading">
            <div><span className="eyebrow">THE READING LIST</span><h2>Stories worth your scroll.</h2><p>Fresh perspectives for a curious mind.</p></div>
            <div className="reading-tools">
              <button className={`tool-button ${readingMode ? "active" : ""}`} onClick={() => setReadingMode(!readingMode)}>{readingMode ? "Exit calm mode" : "Calm reading mode"}</button>
              <button className="tool-button" onClick={() => setFontScale((size) => size >= 1.2 ? 0.9 : +(size + 0.1).toFixed(1))}>Text size {fontScale.toFixed(1)}×</button>
            </div>
          </div>
          <div className="filter-row" aria-label="Filter stories">
            {["ALL", "MIND & CULTURE", "TECHNOLOGY", "LIFESTYLE", "SAVED"].map((value) => (
              <button key={value} className={`filter-chip ${filter === value ? "selected" : ""}`} onClick={() => setFilter(value)}>{value === "SAVED" ? `SAVED (${savedIds.length})` : value}</button>
            ))}
          </div>
          {shownArticles.length ? <div className="article-grid">
            {shownArticles.map((article) => (
              <article className="article-card" key={article.id}>
                <div className="article-image"><img src={article.image} alt={article.title} loading="lazy" /><span className="image-number">{String(featuredArticles.findIndex((item) => item.id === article.id) + 1).padStart(2, "0")}</span></div>
                <div className="article-info">
                  <span className="category">{article.category}</span><h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <div className="article-meta"><span>{article.author}</span><span>{article.time}</span></div>
                  <details className="article-preview"><summary>Read preview <span>↗</span></summary><p style={{ fontSize: `${13 * fontScale}px` }}>{article.excerpt}</p></details>
                  <button className={`save-button ${savedIds.includes(article.id) ? "saved" : ""}`} onClick={() => toggleSaved(article.id)} aria-pressed={savedIds.includes(article.id)}>
                    {savedIds.includes(article.id) ? "✓ Saved to your list" : "+ Save for later"}
                  </button>
                </div>
              </article>
            ))}
          </div> : <div className="empty-state"><h3>Your reading list is waiting.</h3><p>Save a story using “Save for later” and it will appear here on this browser.</p><button className="text-button" onClick={() => setFilter("ALL")}>Browse all stories →</button></div>}
          <p className="local-note">Your reading list is stored only in this browser on this device.</p>
        </section>

        <section className="magazine-section" id="magazine">
          <div className="magazine-copy"><span className="eyebrow">THE DIGITAL MAGAZINE</span><h2>A new perspective, every edition.</h2><p>A home for ideas, culture, creativity and conversations that deserve a little more attention.</p><a href="#contact" className="light-button">Pitch an idea ↗</a></div>
          <div className="magazine-art"><div className="magazine-cover"><span>SCROLLTHEORY</span><div className="cover-title">THE ART<br />OF THINKING<br />DIFFERENTLY.</div><div className="cover-bottom"><span>ISSUE 001</span><span>IDEAS • CULTURE • LIFE</span></div></div></div>
        </section>

        <section className="section books-section" id="books">
          <div className="section-heading"><div><span className="eyebrow">YOUR DIGITAL BOOKSHELF</span><h2>Turn the next page.</h2><p>Discover books and stories, one chapter at a time.</p></div></div>
          <div className="books-panel"><div className="book-icon">S.</div><div><span className="category">COMING TO YOUR BOOKSHELF</span><h3>Your next chapter starts here.</h3><p>Original books, thoughtful writing and reading experiences by ScrollTheory authors.</p></div><a href="#contact" className="book-link">Suggest a book ↗</a></div>
        </section>

        <section className="newsletter-section">
          <div><span className="eyebrow">A LETTER FOR YOUR INBOX</span><h2>The Sunday Scroll.</h2><p>One thoughtful note. A few good reads. No noisy feed.</p></div>
          <form className="newsletter-form" onSubmit={handleNewsletter}><label className="sr-only" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" type="email" required placeholder="Your email address" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} /><button type="submit">Count me in ↗</button></form>
          <small>Newsletter form preview only—not connected to a mailing list yet.</small>
        </section>

        <section className="about-section" id="about">
          <span className="eyebrow">A NOTE FROM SCROLLTHEORY</span><h2>The world is full of noise.<br />Let's make room for ideas.</h2><p>ScrollTheory is a space for stories, perspectives and meaningful reading. Built for minds that never stop asking why.</p><a className="primary-button" href="#contact">Talk to our editors ↗</a>
        </section>

        <section className="section contact-section" id="contact">
          <div className="contact-intro"><span className="eyebrow">OPEN A CONVERSATION</span><h2>Good ideas start<br /><em>with a hello.</em></h2><p>Have a story pitch, a book recommendation, a collaboration idea or simply a thought to share? Our editorial door is open.</p>
            <div className="contact-topics"><div><span>01</span><p><strong>Pitch a story</strong><br />An idea worth exploring.</p></div><div><span>02</span><p><strong>Collaborate</strong><br />Partnerships and creative projects.</p></div><div><span>03</span><p><strong>Say hello</strong><br />Feedback from curious readers.</p></div></div>
          </div>
          <form className="contact-form" onSubmit={handleContactSubmit}>
            <label>Your name<input name="name" required autoComplete="name" placeholder="What should we call you?" /></label>
            <label>Email address<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
            <label>What is this about?<select name="topic" defaultValue="General hello"><option>General hello</option><option>Story pitch</option><option>Book submission</option><option>Collaboration</option><option>Advertising inquiry</option><option>Feedback</option></select></label>
            <label>Your message<textarea name="message" rows="5" required minLength="10" placeholder="Tell us what's on your mind..." /></label>
            <button className="primary-button" type="submit">Prepare message ↗</button>
            <p className="form-hint">This opens your email app. Before launch, replace the sample recipient in the code with your real contact email.</p>
            {formStatus && <p className="form-status" role="status">{formStatus}</p>}
          </form>
        </section>
      </main>

      <footer className="footer">
        <a href="#home" className="logo footer-logo"><span className="logo-icon">S.</span>ScrollTheory</a>
        <p>Read beyond the scroll.</p>
        <div className="footer-links"><a href="#about">About</a><a href="#contact">Contact</a><a href="#articles">Read stories</a></div>
        <span>© {new Date().getFullYear()} ScrollTheory</span>
      </footer>
    </div>
  );
}

export default App;
