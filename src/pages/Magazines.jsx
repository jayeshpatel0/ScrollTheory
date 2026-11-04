
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { magazines } from "../data/libraryData";
import {
  Search,
  BookOpen,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Sparkles,
  Library,
} from "lucide-react";

import "./Magazines.css";

function formatDate(date) {
  if (!date) return "Coming soon";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function MagazineCard({ magazine }) {
  const isPublished = magazine.status === "published";

  return (
    <article className="magazine-card">
      <Link
        to={`/magazines/${magazine.slug}`}
        className="magazine-cover-link"
        aria-label={`View ${magazine.title}`}
      >
        <div className="magazine-cover">
          {magazine.cover ? (
            <img
              src={magazine.cover}
              alt={`${magazine.title} magazine cover`}
              loading="lazy"
            />
          ) : (
            <div className="magazine-cover-placeholder">
              <span className="cover-brand">
                SCROLLTHEORY
              </span>

              <span className="cover-issue">
                {magazine.issue || "DIGITAL ISSUE"}
              </span>

              <h2>{magazine.title}</h2>

              <p>
                {magazine.subtitle ||
                  "Ideas worth your time."}
              </p>

              <span className="cover-category">
                {magazine.category}
              </span>

              <span className="cover-decoration">
                ST.
              </span>
            </div>
          )}

          <span
            className={`magazine-status ${
              isPublished ? "published" : "upcoming"
            }`}
          >
            {isPublished ? "Published" : "Coming soon"}
          </span>

          <span className="magazine-open-icon">
            <ArrowUpRight size={20} />
          </span>
        </div>
      </Link>

      <div className="magazine-card-body">
        <div className="magazine-card-meta">
          <span>
            {magazine.issue || "Digital Magazine"}
          </span>

          <span className="meta-dot">•</span>

          <span>{magazine.category}</span>
        </div>

        <Link
          to={`/magazines/${magazine.slug}`}
          className="magazine-title-link"
        >
          <h3>{magazine.title}</h3>
        </Link>

        <p className="magazine-excerpt">
          {magazine.excerpt}
        </p>

        <div className="magazine-card-info">
          <span>
            <Clock3 size={14} />
            {magazine.readTime || "Read at your pace"}
          </span>

          <span>
            <CalendarDays size={14} />
            {isPublished
              ? "Available now"
              : formatDate(magazine.releaseDate)}
          </span>
        </div>

        <Link
          to={`/magazines/${magazine.slug}`}
          className="magazine-card-action"
        >
          {isPublished
            ? "Explore issue"
            : "View upcoming issue"}

          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}

function Magazines() {
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");

  // Public listing: drafts are never shown.
  const publicMagazines = useMemo(() => {
    return magazines.filter((magazine) =>
      ["published", "upcoming"].includes(
        magazine.status
      )
    );
  }, []);

  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(
        publicMagazines.map(
          (magazine) => magazine.category
        )
      ),
    ];
  }, [publicMagazines]);

  const filteredMagazines = useMemo(() => {
    const query = search.trim().toLowerCase();

    return publicMagazines.filter((magazine) => {
      const matchesSearch = [
        magazine.title,
        magazine.subtitle,
        magazine.category,
        magazine.excerpt,
        magazine.issue,
        magazine.author,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);

      const matchesStatus =
        activeStatus === "all" ||
        magazine.status === activeStatus;

      const matchesCategory =
        activeCategory === "all" ||
        magazine.category === activeCategory;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    publicMagazines,
    search,
    activeStatus,
    activeCategory,
  ]);

  const publishedCount = publicMagazines.filter(
    (item) => item.status === "published"
  ).length;

  const upcomingCount = publicMagazines.filter(
    (item) => item.status === "upcoming"
  ).length;

  const featuredMagazine = publicMagazines.find(
    (item) =>
      item.featured &&
      item.status === "published"
  );

  return (
    <main className="magazines-page">

      {/* HERO */}
      <section className="magazines-hero">
        <div className="magazines-hero-copy">
          <span className="magazines-eyebrow">
            <Sparkles size={14} />
            THE SCROLLTHEORY EDITIONS
          </span>

          <h1>
            Stories, gathered
            <br />
            with <em>intention.</em>
          </h1>

          <p>
            Thoughtfully curated digital magazines.
            One theme, many perspectives, and ideas
            worth coming back to.
          </p>

          <a
            href="#magazine-library"
            className="magazines-hero-button"
          >
            Explore the editions
            <ArrowUpRight size={18} />
          </a>

          <div className="magazines-hero-stats">
            <div>
              <strong>{publishedCount}</strong>
              <span>Published</span>
            </div>

            <div className="stats-divider" />

            <div>
              <strong>{upcomingCount}</strong>
              <span>Upcoming</span>
            </div>

            <div className="stats-divider" />

            <div>
              <strong>Digital</strong>
              <span>Reading editions</span>
            </div>
          </div>
        </div>

        <div className="magazines-hero-art">
          <div className="hero-art-glow" />

          <div className="hero-back-cover">
            <span>SCROLLTHEORY</span>
          </div>

          <div className="hero-front-cover">
            <span className="hero-cover-brand">
              SCROLLTHEORY
            </span>

            <span className="hero-cover-issue">
              IDEAS FOR A FULLER LIFE
            </span>

            <div className="hero-cover-center">
              <span>THE ART OF</span>
              <strong>
                Paying
                <br />
                Attention
              </strong>
            </div>

            <span className="hero-cover-bottom">
              MIND · CULTURE · EVERYDAY LIFE
            </span>
          </div>

          <span className="hero-art-caption">
            A quieter kind of reading.
          </span>
        </div>
      </section>

      {/* FEATURED ISSUE */}
      {featuredMagazine && (
        <section className="magazines-featured">
          <div className="featured-copy">
            <span className="magazines-eyebrow">
              EDITOR'S PICK
            </span>

            <h2>{featuredMagazine.title}</h2>

            <p>
              {featuredMagazine.excerpt}
            </p>

            <Link
              to={`/magazines/${featuredMagazine.slug}`}
              className="magazines-featured-link"
            >
              Read this edition
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="featured-note">
            <BookOpen size={24} />

            <span>
              {featuredMagazine.issue ||
                "SCROLLTHEORY EDITION"}
            </span>

            <strong>
              {featuredMagazine.readTime ||
                "A thoughtful read"}
            </strong>

            <p>
              Curated stories.
              Fresh perspectives.
              Time well spent.
            </p>
          </div>
        </section>
      )}

      {/* LIBRARY */}
      <section
        className="magazines-library"
        id="magazine-library"
      >
        <div className="magazines-section-heading">
          <div>
            <span className="magazines-eyebrow">
              THE COLLECTION
            </span>

            <h2>
              The magazine shelf.
            </h2>

            <p>
              Find an issue that speaks to you.
            </p>
          </div>

          <span className="magazines-total">
            {filteredMagazines.length}{" "}
            {filteredMagazines.length === 1
              ? "edition"
              : "editions"}
          </span>
        </div>

        {/* SEARCH */}
        <div className="magazines-toolbar">
          <div className="magazines-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search magazines, themes..."
              aria-label="Search magazines"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="magazines-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div
            className="magazines-status-filters"
            aria-label="Filter magazine status"
          >
            {[
              { label: "All editions", value: "all" },
              { label: "Published", value: "published" },
              { label: "Upcoming", value: "upcoming" },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={
                  activeStatus === filter.value
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveStatus(filter.value)
                }
                aria-pressed={
                  activeStatus === filter.value
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="magazines-category-row">
          <span>EXPLORE BY THEME</span>

          <div className="magazines-category-filters">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  activeCategory === category
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveCategory(category)
                }
                aria-pressed={
                  activeCategory === category
                }
              >
                {category === "all"
                  ? "All themes"
                  : category}
              </button>
            ))}
          </div>
        </div>

        {/* MAGAZINE GRID */}
        {filteredMagazines.length > 0 ? (
          <div className="magazines-grid">
            {filteredMagazines.map((magazine) => (
              <MagazineCard
                key={magazine.id}
                magazine={magazine}
              />
            ))}
          </div>
        ) : (
          <div className="magazines-empty">
            <div className="magazines-empty-icon">
              <Library size={28} />
            </div>

            <h3>No editions found.</h3>

            <p>
              Try a different search or change
              your filters.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveStatus("all");
                setActiveCategory("all");
              }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* EDITORIAL NOTE */}
      <section className="magazines-note">
        <span className="magazines-eyebrow">
          A NOTE FROM SCROLLTHEORY
        </span>

        <h2>
          Not everything needs
          <br />
          to be read in a hurry.
        </h2>

        <p>
          Our editions are created for curious
          readers who enjoy slowing down,
          following an idea, and seeing the
          familiar differently.
        </p>

        <Link to="/articles">
          Explore our articles
          <ArrowUpRight size={17} />
        </Link>
      </section>

    </main>
  );
}

export default Magazines;
