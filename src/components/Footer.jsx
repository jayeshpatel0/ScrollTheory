
import { Link } from "react-router-dom";
import "./Footer.css";

const footerLinks = [
  { name: "Home", path: "/" },
  { name: "Articles", path: "/articles" },
  { name: "Magazine", path: "/magazine" },
  { name: "Books", path: "/books" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="st-footer">
      <div className="st-footer-main">

        {/* BRAND */}
        <div className="st-footer-brand">
          <Link to="/" className="st-footer-logo">
            <span className="st-footer-logo-icon">S.</span>
            <span>ScrollTheory</span>
          </Link>

          <p className="st-footer-tagline">
            Read beyond the scroll.
          </p>

          <p className="st-footer-description">
            A space for thoughtful stories, fresh perspectives
            and ideas that make you pause, think and discover.
          </p>

          <Link to="/about" className="st-footer-discover">
            Discover our story <span>↗</span>
          </Link>
        </div>

        {/* QUICK LINKS */}
        <div className="st-footer-column">
          <h3>EXPLORE</h3>

          <nav aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* CATEGORIES */}
        <div className="st-footer-column">
          <h3>DISCOVER</h3>

          <nav aria-label="Discover links">
            <Link to="/articles?category=MIND%20%26%20CULTURE">
              Mind & Culture
            </Link>

            <Link to="/articles?category=TECHNOLOGY">
              Technology
            </Link>

            <Link to="/articles?category=LIFESTYLE">
              Lifestyle
            </Link>

            <Link to="/magazine">
              Latest Edition
            </Link>

            <Link to="/books">
              Reading List
            </Link>
          </nav>
        </div>

        {/* CONTACT */}
        <div className="st-footer-column st-footer-contact">
          <h3>LET'S CONNECT</h3>

          <p>
            Have a story idea or something on your mind?
            Our editorial door is open.
          </p>

          <Link to="/contact" className="st-footer-contact-button">
            Talk to our editors <span>↗</span>
          </Link>

          <p className="st-footer-note">
            Stories, ideas and conversations worth sharing.
          </p>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="st-footer-bottom">
        <p>
          © {year} ScrollTheory. All rights reserved.
        </p>

        <p className="st-footer-bottom-center">
          Made for curious minds.
        </p>

        <Link to="/" className="st-back-top">
          Back to home ↑
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
