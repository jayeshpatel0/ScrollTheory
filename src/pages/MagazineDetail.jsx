
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CalendarDays } from "lucide-react";

import { getMagazineBySlug } from "../data/libraryData";
import "./MagazineDetail.css";

export default function MagazineDetail() {
  const { slug } = useParams();
  const magazine = getMagazineBySlug(slug);

  if (!magazine) {
    return (
      <main className="magazine-detail-page">
        <div className="magazine-detail-message">
          <h1>Magazine Not Found</h1>
          <p>This magazine may not exist or has been removed.</p>
          <Link to="/magazines">Explore Magazines</Link>
        </div>
      </main>
    );
  }

  const isPublished = magazine.status === "published";

  return (
    <main className="magazine-detail-page">
      <div className="magazine-detail-container">
        <Link to="/magazines" className="magazine-back-link">
          <ArrowLeft size={17} />
          All Magazines
        </Link>

        <section className="magazine-detail-card">
          <div className="magazine-detail-cover">
            {magazine.cover ? (
              <img
                src={magazine.cover}
                alt={magazine.title}
              />
            ) : (
              <div className="magazine-cover-placeholder">
                <BookOpen size={55} />
                <span>SCROLLTHEORY</span>
                <h2>{magazine.title}</h2>
                <p>{magazine.issue || "MAGAZINE"}</p>
              </div>
            )}
          </div>

          <div className="magazine-detail-info">
            <span className="magazine-detail-category">
              {magazine.category || "Magazine"}
            </span>

            <p className="magazine-detail-issue">
              {magazine.issue || "SCROLLTHEORY EDITION"}
            </p>

            <h1>{magazine.title}</h1>

            {magazine.subtitle && (
              <h3>{magazine.subtitle}</h3>
            )}

            <p className="magazine-detail-description">
              {magazine.description ||
                magazine.excerpt ||
                "Discover thoughtful stories, fresh ideas and perspectives in this ScrollTheory magazine."}
            </p>

            <div className="magazine-detail-meta">
              <span>
                <CalendarDays size={17} />
                {magazine.releaseDate
                  ? new Date(
                      `${magazine.releaseDate}T00:00:00`
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Release date coming soon"}
              </span>

              <span className="magazine-status">
                {isPublished ? "Published" : "Coming Soon"}
              </span>
            </div>

            {isPublished ? (
              <p className="magazine-detail-note">
                This magazine is published. Reading access
                will depend on the available magazine content.
              </p>
            ) : (
              <div className="magazine-upcoming-note">
                <CalendarDays size={20} />
                <div>
                  <strong>Coming Soon</strong>
                  <p>
                    This magazine is not available for reading yet.
                  </p>
                </div>
              </div>
            )}

            <Link
              to="/magazines"
              className="magazine-detail-button"
            >
              <ArrowLeft size={17} />
              Back to Magazines
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
