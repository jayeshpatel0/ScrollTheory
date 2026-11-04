
import { Link } from "react-router-dom";
import { CalendarDays, ArrowRight, BookOpen } from "lucide-react";
import { upcomingContent } from "../data/libraryData";
import "./Upcoming.css";

export default function Upcoming() {
  const items = [...upcomingContent].sort(
    (a, b) =>
      new Date(a.releaseDate) - new Date(b.releaseDate)
  );

  function formatDate(date) {
    if (!date) return "Release date coming soon";

    return new Date(date + "T00:00:00").toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  function getLink(item) {
    if (item.slug && item.volume) {
      return `/books/${item.slug}`;
    }

    return `/magazines/${item.slug}`;
  }

  return (
    <main className="upcoming-page">
      <div className="upcoming-container">

        {/* Hero */}
        <section className="upcoming-hero">
          <span className="upcoming-eyebrow">
            THE NEXT CHAPTER
          </span>

          <h1>
            Something <em>worth</em>
            <br />
            waiting for.
          </h1>

          <p>
            Discover the books and magazines coming next
            to ScrollTheory. Thoughtful stories, fresh
            perspectives and ideas worth your time.
          </p>

          <div className="upcoming-hero-note">
            <CalendarDays size={17} />
            <span>Explore our upcoming releases</span>
          </div>
        </section>

        {/* Upcoming List */}
        <section className="upcoming-section">
          <div className="upcoming-section-heading">
            <div>
              <span className="upcoming-label">
                THE RELEASE CALENDAR
              </span>
              <h2>Coming Soon</h2>
            </div>

            <span className="upcoming-total">
              {items.length} Releases
            </span>
          </div>

          {items.length > 0 ? (
            <div className="upcoming-grid">
              {items.map((item, index) => {
                const isBook = Boolean(item.volume);
                const link = getLink(item);

                return (
                  <article
                    className="upcoming-card"
                    key={`${isBook ? "book" : "magazine"}-${item.slug}`}
                  >
                    <Link
                      to={link}
                      className="upcoming-card-cover"
                    >
                      {item.cover ? (
                        <img
                          src={item.cover}
                          alt={item.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="upcoming-cover-placeholder">
                          <BookOpen size={40} />
                          <span>ScrollTheory</span>
                        </div>
                      )}

                      <span className="upcoming-type-badge">
                        {isBook ? "BOOK" : "MAGAZINE"}
                      </span>
                    </Link>

                    <div className="upcoming-card-body">
                      <div className="upcoming-card-meta">
                        <span>{item.category}</span>
                        <span>
                          {item.volume || item.issue}
                        </span>
                      </div>

                      <h3>
                        <Link to={link}>
                          {item.title}
                        </Link>
                      </h3>

                      {item.subtitle && (
                        <p className="upcoming-subtitle">
                          {item.subtitle}
                        </p>
                      )}

                      <p className="upcoming-excerpt">
                        {item.excerpt}
                      </p>

                      <div className="upcoming-card-footer">
                        <div className="upcoming-release-date">
                          <CalendarDays size={16} />
                          <span>
                            {formatDate(item.releaseDate)}
                          </span>
                        </div>

                        <Link
                          to={link}
                          className="upcoming-arrow"
                          aria-label={`View ${item.title}`}
                        >
                          <ArrowRight size={19} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="upcoming-empty">
              <BookOpen size={42} />
              <h3>New stories are on their way.</h3>
              <p>
                Our next books and magazines will be
                announced here.
              </p>
              <Link to="/books">
                Explore Books
                <ArrowRight size={17} />
              </Link>
            </div>
          )}
        </section>

        {/* Bottom CTA */}
        <section className="upcoming-cta">
          <div>
            <span className="upcoming-label">
              KEEP EXPLORING
            </span>
            <h2>There is more to discover.</h2>
            <p>
              Find your next interesting read in our
              books and magazine collections.
            </p>
          </div>

          <div className="upcoming-cta-links">
            <Link to="/books">
              Explore Books <ArrowRight size={16} />
            </Link>
            <Link to="/magazines">
              Explore Magazines <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
