
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  List,
} from "lucide-react";

import {
  getBookBySlug,
  getBookChapter,
} from "../data/libraryData";

import "./BookReader.css";

export default function BookReader() {
  const { slug } = useParams();

  const book = getBookBySlug(slug);
  const chapters = book?.chapters || [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [showChapters, setShowChapters] = useState(false);

  // Load saved progress for this book
  const [completedChapters, setCompletedChapters] = useState(
    () => {
      try {
        const saved = localStorage.getItem(
          `scrolltheory-progress-${slug}`
        );

        const parsed = saved ? JSON.parse(saved) : [];

        if (!Array.isArray(parsed)) return [];

        return [
          ...new Set(
            parsed.filter(
              (index) =>
                Number.isInteger(index) &&
                index >= 0 &&
                index < (book?.chapters?.length || 0)
            )
          ),
        ];
      } catch {
        return [];
      }
    }
  );

  const activeChapter = chapters[activeIndex];

  // Reload progress when the book slug changes
  useEffect(() => {
    setActiveIndex(0);
    setShowChapters(false);

    try {
      const saved = localStorage.getItem(
        `scrolltheory-progress-${slug}`
      );

      const parsed = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(parsed)) {
        setCompletedChapters([]);
        return;
      }

      const validProgress = [
        ...new Set(
          parsed.filter(
            (index) =>
              Number.isInteger(index) &&
              index >= 0 &&
              index < chapters.length
          )
        ),
      ];

      setCompletedChapters(validProgress);
    } catch {
      setCompletedChapters([]);
    }
  }, [slug]);

  // Save progress automatically
  useEffect(() => {
    try {
      localStorage.setItem(
        `scrolltheory-progress-${slug}`,
        JSON.stringify(completedChapters)
      );
    } catch (error) {
      console.error("Progress save failed:", error);
    }
  }, [slug, completedChapters]);

  // Scroll to top when chapter changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [activeIndex]);

  // Book not found
  if (!book) {
    return (
      <main className="book-reader-page">
        <div className="reader-message">
          <h1>Book Not Found</h1>
          <p>The book you are looking for does not exist.</p>
          <Link to="/books">Explore Books</Link>
        </div>
      </main>
    );
  }

  // Book is not published
  if (book.status !== "published") {
    return (
      <main className="book-reader-page">
        <div className="reader-message">
          <BookOpen size={45} />

          <h1>Coming Soon</h1>

          <p>
            This book is not available for reading yet.
          </p>

          <Link to={`/books/${book.slug}`}>
            Back to Book Details
          </Link>
        </div>
      </main>
    );
  }

  // No chapters available
  if (!activeChapter) {
    return (
      <main className="book-reader-page">
        <div className="reader-message">
          <BookOpen size={45} />

          <h1>No Chapters Available</h1>

          <Link to={`/books/${book.slug}`}>
            Back to Book Details
          </Link>
        </div>
      </main>
    );
  }

  // Reading progress
  const progress =
    chapters.length > 0
      ? Math.round(
          (completedChapters.length / chapters.length) * 100
        )
      : 0;

  const isCompleted = completedChapters.includes(activeIndex);

  // Current chapter content
  const chapterContent =
    getBookChapter(book.slug, activeChapter.slug) ||
    activeChapter;

  const content =
    chapterContent?.content || "Content coming soon.";

  // Mark chapter completed
  function markCompleted() {
    setCompletedChapters((previous) => {
      if (previous.includes(activeIndex)) {
        return previous;
      }

      return [...previous, activeIndex];
    });
  }

  // Chapter navigation
  function goToChapter(index) {
    if (index >= 0 && index < chapters.length) {
      setActiveIndex(index);
      setShowChapters(false);
    }
  }

  return (
    <main className="book-reader-page">
      <div className="reader-container">

        {/* Top Navigation */}
        <header className="reader-topbar">
          <Link
            to={`/books/${book.slug}`}
            className="reader-back-link"
          >
            <ArrowLeft size={17} />
            <span>Book Details</span>
          </Link>

          <button
            type="button"
            className="reader-chapters-toggle"
            aria-expanded={showChapters}
            onClick={() =>
              setShowChapters((previous) => !previous)
            }
          >
            <List size={18} />
            Chapters
          </button>
        </header>

        {/* Reading Progress */}
        <section className="reader-progress-section">
          <div className="reader-progress-labels">
            <span>YOUR READING PROGRESS</span>
            <span>{progress}% completed</span>
          </div>

          <div
            className="reader-progress-track"
            role="progressbar"
            aria-label="Book reading progress"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="reader-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        <div className="reader-layout">

          {/* Chapter Sidebar */}
          <aside
            className={`reader-sidebar ${
              showChapters ? "reader-sidebar-open" : ""
            }`}
          >
            <div className="reader-sidebar-heading">
              <span>CONTENTS</span>
              <strong>{chapters.length} Chapters</strong>
            </div>

            <div className="reader-sidebar-book">
              <BookOpen size={18} />
              <span>{book.title}</span>
            </div>

            <nav
              className="reader-chapter-nav"
              aria-label="Book chapters"
            >
              {chapters.map((chapter, index) => {
                const completed =
                  completedChapters.includes(index);

                return (
                  <button
                    type="button"
                    key={chapter.id || chapter.slug}
                    className={`reader-chapter-link ${
                      activeIndex === index
                        ? "reader-chapter-active"
                        : ""
                    }`}
                    aria-current={
                      activeIndex === index ? "step" : undefined
                    }
                    onClick={() => goToChapter(index)}
                  >
                    <span className="reader-chapter-number">
                      {completed ? (
                        <Check size={15} />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>

                    <span className="reader-chapter-title">
                      {chapter.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Chapter Content */}
          <article className="reader-content">
            <div className="reader-chapter-meta">
              <span>CHAPTER {activeIndex + 1}</span>
              <span>
                {activeChapter.readTime || "Reading"}
              </span>
            </div>

            <h1 className="reader-chapter-heading">
              {activeChapter.title}
            </h1>

            <div className="reader-chapter-divider" />

            <div className="reader-book-content">
              {Array.isArray(content) ? (
                content.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                String(content)
                  .split(/\n\s*\n/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
              )}
            </div>

            {/* Mark Complete */}
            <div className="reader-completion">
              <button
                type="button"
                className={`reader-complete-btn ${
                  isCompleted ? "completed" : ""
                }`}
                onClick={markCompleted}
                disabled={isCompleted}
              >
                <Check size={17} />

                {isCompleted
                  ? "Chapter Completed"
                  : "Mark Chapter as Complete"}
              </button>
            </div>

            {/* Previous / Next */}
            <footer className="reader-navigation">
              <button
                type="button"
                className="reader-nav-btn"
                disabled={activeIndex === 0}
                onClick={() => goToChapter(activeIndex - 1)}
              >
                <ArrowLeft size={17} />

                <span>
                  <small>PREVIOUS</small>
                  Previous Chapter
                </span>
              </button>

              {activeIndex < chapters.length - 1 ? (
                <button
                  type="button"
                  className="reader-nav-btn reader-nav-next"
                  onClick={() => goToChapter(activeIndex + 1)}
                >
                  <span>
                    <small>NEXT</small>
                    Next Chapter
                  </span>

                  <ArrowRight size={17} />
                </button>
              ) : (
                <Link
                  to={`/books/${book.slug}`}
                  className="reader-finish-link"
                >
                  Finish Book
                  <Check size={17} />
                </Link>
              )}
            </footer>
          </article>
        </div>
      </div>
    </main>
  );
}
