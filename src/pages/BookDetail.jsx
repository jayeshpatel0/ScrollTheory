
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, CalendarDays } from "lucide-react";
import { getBookBySlug } from "../data/libraryData";
import "./BookDetail.css";

export default function BookDetail() {
  const { slug } = useParams();
  const book = getBookBySlug(slug);

  if (!book) {
    return (
      <main className="book-detail-page">
        <div className="book-not-found">
          <BookOpen size={48} />
          <h1>Book Not Found</h1>
          <p>Sorry, this book could not be found.</p>
          <Link to="/books" className="book-back-btn">
            <ArrowLeft size={17} />
            Back to Books
          </Link>
        </div>
      </main>
    );
  }

  const isPublished = book.status === "published";

  return (
    <main className="book-detail-page">
      <div className="book-detail-container">
        <Link to="/books" className="book-back-link">
          <ArrowLeft size={17} />
          Back to Books
        </Link>

        <section className="book-detail-hero">
          <div className="book-detail-cover">
            {book.cover ? (
              <img src={book.cover} alt={book.title} />
            ) : (
              <div className="book-cover-placeholder">
                <BookOpen size={64} />
                <span>ScrollTheory</span>
              </div>
            )}
          </div>

          <div className="book-detail-info">
            <span className="book-detail-category">
              {book.category}
            </span>

            <span className="book-detail-volume">
              {book.volume}
            </span>

            <h1>{book.title}</h1>

            {book.subtitle && (
              <p className="book-detail-subtitle">
                {book.subtitle}
              </p>
            )}

            <p className="book-detail-author">
              By {book.author}
            </p>

            <div className="book-detail-meta">
              <span>
                <Clock size={16} />
                {book.readTime}
              </span>

              <span>
                <CalendarDays size={16} />
                {book.releaseDate}
              </span>
            </div>

            <span
              className={`book-detail-status ${
                isPublished ? "published" : "upcoming"
              }`}
            >
              {isPublished ? "Available to Read" : "Coming Soon"}
            </span>

            <p className="book-detail-excerpt">
              {book.excerpt}
            </p>

            {isPublished ? (
              <Link
                to={`/books/${book.slug}/read`}
                className="book-read-btn"
              >
                <BookOpen size={18} />
                Start Reading
              </Link>
            ) : (
              <button className="book-read-btn" disabled>
                <BookOpen size={18} />
                Coming Soon
              </button>
            )}
          </div>
        </section>

        <section className="book-description-section">
          <h2>About This Book</h2>
          <p>
            {book.description || book.excerpt}
          </p>
        </section>

        <section className="book-chapters-section">
          <div className="book-chapters-heading">
            <div>
              <span className="book-section-label">
                INSIDE THE BOOK
              </span>
              <h2>Chapters</h2>
            </div>

            <span className="book-chapter-count">
              {book.chapters?.length || 0} Chapters
            </span>
          </div>

          {book.chapters?.length > 0 ? (
            <div className="book-chapter-list">
              {book.chapters.map((chapter, index) => (
                <div
                  className="book-chapter-item"
                  key={chapter.id || chapter.slug}
                >
                  <div className="book-chapter-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="book-chapter-info">
                    <h3>{chapter.title}</h3>
                    <span>
                      <Clock size={14} />
                      {chapter.readTime}
                    </span>
                  </div>

                  <span className="book-chapter-icon">
                    <BookOpen size={19} />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>Chapters will be available soon.</p>
          )}
        </section>

        <div className="book-detail-footer">
          <Link to="/books">
            <ArrowLeft size={16} />
            Explore More Books
          </Link>
        </div>
      </div>
    </main>
  );
}
