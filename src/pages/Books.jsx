
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { books } from "../data/libraryData";
import "./Books.css";

export default function Books() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = [
    "All",
    ...new Set(books.map((book) => book.category).filter(Boolean)),
  ];

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch = [
        book.title,
        book.author,
        book.category,
        book.subtitle,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || book.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const getReleaseDate = (date) => {
    if (!date) return "Release date coming soon";

    return new Date(date + "T00:00:00").toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <main className="st-books-page">
      <div className="st-books-container">

        {/* Hero */}
        <section className="st-books-hero">
          <span className="st-books-eyebrow">
            SCROLLTHEORY / LIBRARY
          </span>

          <h1>
            Books for a
            <br />
            <em>thoughtful life.</em>
          </h1>

          <p>
            Short books, thoughtful ideas, and stories
            worth slowing down for.
          </p>
        </section>

        {/* Search */}
        <section className="st-books-toolbar">
          <div className="st-books-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Search books, authors, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search books"
            />
          </div>

          <div className="st-books-categories">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  category === item ? "active" : ""
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Heading */}
        <section className="st-books-section">
          <div className="st-books-section-heading">
            <div>
              <span className="st-books-label">
                THE COLLECTION
              </span>
              <h2>Explore our books</h2>
            </div>

            <span className="st-books-count">
              {filteredBooks.length} Books
            </span>
          </div>

          {/* Book Grid */}
          {filteredBooks.length > 0 ? (
            <div className="st-books-grid">
              {filteredBooks.map((book) => (
                <article
                  className="st-book-card"
                  key={book.id}
                >
                  <Link
                    to={`/books/${book.slug}`}
                    className="st-book-cover-link"
                    aria-label={`View ${book.title}`}
                  >
                    {book.cover ? (
                      <img
                        className="st-book-cover"
                        src={book.cover}
                        alt={book.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="st-book-cover-placeholder">
                        <span>SCROLLTHEORY</span>
                        <div>
                          <h3>{book.title}</h3>
                          <p>{book.volume}</p>
                        </div>
                        <small>BOOK COLLECTION</small>
                      </div>
                    )}

                    <span
                      className={`st-book-badge ${
                        book.status === "published"
                          ? "is-published"
                          : "is-upcoming"
                      }`}
                    >
                      {book.status || "upcoming"}
                    </span>
                  </Link>

                  <div className="st-book-card-info">
                    <div className="st-book-card-meta">
                      <span>{book.category}</span>
                      <span>{book.readTime}</span>
                    </div>

                    <h3>
                      <Link to={`/books/${book.slug}`}>
                        {book.title}
                      </Link>
                    </h3>

                    <p className="st-book-subtitle">
                      {book.subtitle || book.excerpt}
                    </p>

                    <p className="st-book-author">
                      By {book.author}
                    </p>

                    <div className="st-book-card-footer">
                      <span>
                        {getReleaseDate(book.releaseDate)}
                      </span>

                      <Link to={`/books/${book.slug}`}>
                        Explore →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="st-books-empty">
              <h3>No books found</h3>
              <p>
                Try another title or choose a different category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* Bottom section */}
        <section className="st-books-bottom">
          <span>READ AT YOUR OWN PACE</span>
          <h2>Good ideas deserve a little time.</h2>
          <p>
            Find a quiet moment. Open a new perspective.
          </p>
        </section>

      </div>
    </main>
  );
}
