
import { useEffect } from "react";

const SITE_NAME = "ScrollTheory";
const SITE_URL = "https://scrolltheory.netlify.app";

export default function SEO({
  title,
  description,
  image,
  slug,
  type = "website",
}) {
  useEffect(() => {
    const pageTitle = title
      ? `${title} | ${SITE_NAME}`
      : `${SITE_NAME} – Stories Worth Reading`;

    const pageDescription =
      description ||
      "Discover interesting stories, insights and articles on ScrollTheory.";

    const pageUrl = slug
      ? `${SITE_URL}/articles/${encodeURIComponent(slug)}`
      : window.location.href.split("?")[0];

    const pageImage = image || `${SITE_URL}/og-default.jpg`;

    document.title = pageTitle;

    const setMeta = (selector, attribute, value) => {
      let element = document.head.querySelector(selector);

      if (!element) {
        element = document.createElement("meta");
        const [key, val] = selector
          .replace("meta[", "")
          .replace("]", "")
          .split("=");

        element.setAttribute(
          key.trim(),
          val.replace(/['"]/g, "").trim()
        );

        document.head.appendChild(element);
      }

      element.setAttribute(attribute, value);
    };

    setMeta('meta[name="description"]', "content", pageDescription);

    setMeta('meta[property="og:title"]', "content", pageTitle);
    setMeta('meta[property="og:description"]', "content", pageDescription);
    setMeta('meta[property="og:image"]', "content", pageImage);
    setMeta('meta[property="og:url"]', "content", pageUrl);
    setMeta('meta[property="og:type"]', "content", type);
    setMeta('meta[property="og:site_name"]', "content", SITE_NAME);

    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", pageTitle);
    setMeta('meta[name="twitter:description"]', "content", pageDescription);
    setMeta('meta[name="twitter:image"]', "content", pageImage);

    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = pageUrl;

  }, [title, description, image, slug, type]);

  return null;
}
