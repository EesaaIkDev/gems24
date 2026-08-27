import { SITE } from "@/lib/seo";

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const setLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"][data-seo="1"]`);
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    el.setAttribute("data-seo", "1");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const setJsonLd = (data) => {
  document.head.querySelectorAll('script[data-seo-jsonld="1"]').forEach((n) => n.remove());
  (Array.isArray(data) ? data : [data]).filter(Boolean).forEach((block) => {
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-seo-jsonld", "1");
    el.textContent = JSON.stringify(block);
    document.head.appendChild(el);
  });
};

/** Writes one page's search + social metadata into <head>. */
export function applyHead({ title, description, canonical, robots, image, type = "website", jsonLd }) {
  if (title) document.title = title;
  setMeta("name", "description", description);
  setMeta("name", "robots", robots || "index, follow");
  setLink("canonical", canonical);

  setMeta("property", "og:site_name", SITE.name);
  setMeta("property", "og:type", type);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", canonical || SITE.url);
  setMeta("property", "og:image", image || SITE.socialImage);
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", image || SITE.socialImage);

  setJsonLd(jsonLd);
}