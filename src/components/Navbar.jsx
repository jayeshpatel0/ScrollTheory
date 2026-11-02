
import { useState, useEffect, useRef } from "react";
import {
  NavLink,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  UserRound,
  History,
  BookOpen
} from "lucide-react";

import { useReaderAuth } from "../context/ReaderAuthContext";
import "./Navbar.css";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Articles", path: "/articles" },
  { name: "Magazine", path: "/magazine" },
  { name: "Books", path: "/books" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, loading, logout } = useReaderAuth();
  const profileRef = useRef(null);

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const isArticlePage =
    location.pathname.startsWith("/articles/");

  const isActive = (path) => {
    if (path === "/articles") {
      return (
        location.pathname === "/articles" ||
        isArticlePage
      );
    }

    return location.pathname === path;
  };

  // Close dropdown on outside click / Escape
  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // Close menus when navigating
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/", { replace: true });
  }

  const readerName =
    user?.name || user?.email || "Reader";

  const initials = readerName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="st-navbar">
      <div className="st-navbar-inner">

        {/* LOGO */}
        <Link
          to="/"
          className="st-logo"
          onClick={closeMenu}
          aria-label="ScrollTheory home"
        >
          <span className="st-logo-icon">S.</span>

          <span className="st-logo-text">
            Scroll<span>Theory</span>
            <small>READ BEYOND THE SCROLL.</small>
          </span>
        </Link>

        {/* MAIN NAVIGATION */}
        <nav
          className={`st-nav ${menuOpen ? "st-nav-open" : ""
            }`}
          id="st-navigation"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => {
            const active = isActive(link.path);

            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={() =>
                  `st-nav-link ${active ? "st-nav-active" : ""
                  }`
                }
                aria-current={
                  active ? "page" : undefined
                }
                onClick={closeMenu}
              >
                {link.name}
              </NavLink>
            );
          })}

          {/* MOBILE AUTH LINKS */}
          {!loading && (
            <div className="st-mobile-auth">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="st-mobile-auth-link"
                    onClick={closeMenu}
                  >
                    My Profile
                  </Link>

                  <Link
                    to="/saved-articles"
                    className="st-mobile-auth-link"
                    onClick={closeMenu}
                  >
                    Saved Articles
                  </Link>

                  <Link
                    to="/reading-history"
                    className="st-mobile-auth-link"
                    onClick={closeMenu}
                  >
                    Reading History
                  </Link>

                  <button
                    type="button"
                    className="st-mobile-auth-link st-mobile-logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="st-mobile-auth-link"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    className="st-mobile-auth-link"
                    onClick={closeMenu}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          )}

          {/* MOBILE CTA */}
          <Link
            to="/articles"
            className="st-mobile-cta"
            onClick={closeMenu}
          >
            Start Reading <span>↗</span>
          </Link>
        </nav>

        {/* DESKTOP RIGHT SECTION */}
        <div className="st-navbar-actions">

          {/* AUTHENTICATION */}
          {!loading && (
            user ? (
              <div
                className="st-profile-wrapper"
                ref={profileRef}
              >
                <button
                  type="button"
                  className="st-profile-trigger"
                  onClick={() =>
                    setProfileOpen((prev) => !prev)
                  }
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="Open reader profile menu"
                >
                  <span className="st-profile-avatar">
                    {initials}
                  </span>

                  <span className="st-profile-name">
                    {readerName}
                  </span>

                  <span
                    className={`st-profile-chevron ${profileOpen ? "is-open" : ""
                      }`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>

                {profileOpen && (
                  <div className="st-profile-dropdown">

                    {/* PROFILE INFO */}
                    <div className="st-profile-info">
                      <span className="st-profile-avatar st-avatar-large">
                        {initials}
                      </span>

                      <div className="st-profile-details">
                        <strong>{readerName}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>

                    <div className="st-profile-divider" />

                    {/* MY PROFILE */}
                    <Link
                      to="/profile"
                      className="st-dropdown-link"
                      onClick={closeMenu}
                    >
                      <UserRound size={16} />
                      My Profile
                    </Link>
                    <Link
                      to="/reader/dashboard"
                      className="st-dropdown-link"
                      onClick={closeMenu}
                    >
                      <BookOpen size={16} />
                      Dashboard
                    </Link>

                    {/* SAVED ARTICLES */}
                    <Link
                      to="/saved-articles"
                      className="st-dropdown-link"
                      onClick={closeMenu}
                    >
                      <span aria-hidden="true">▤</span>
                      Saved Articles
                    </Link>

                    {/* READING HISTORY */}
                    <Link
                      to="/reading-history"
                      className="st-dropdown-link"
                      onClick={closeMenu}
                    >
                      <History size={16} />
                      Reading History
                    </Link>

                    <div className="st-profile-divider" />

                    {/* LOGOUT */}
                    <button
                      type="button"
                      className="st-dropdown-link st-dropdown-logout"
                      onClick={handleLogout}
                    >
                      <span aria-hidden="true">↪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="st-auth-actions">
                <Link
                  to="/login"
                  className="st-login-link"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="st-register-button"
                >
                  Join Us <span>↗</span>
                </Link>
              </div>
            )
          )}

          {/* DESKTOP CTA */}
          <Link
            to="/articles"
            className="st-nav-cta"
          >
            Start Reading
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          className={`st-menu-toggle ${menuOpen ? "is-open" : ""
            }`}
          onClick={() =>
            setMenuOpen((prev) => !prev)
          }
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="st-navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {menuOpen && (
        <button
          type="button"
          className="st-menu-overlay"
          aria-label="Close navigation menu"
          onClick={closeMenu}
          tabIndex={-1}
        />
      )}
    </header>
  );
}

export default Navbar;
