import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyHead } from "@/lib/head";
import { absolute, routeSeo } from "@/lib/seo";

/**
 * Declarative page metadata. Render once per page (or nothing at all, in which
 * case RouteSeo supplies the route default) — the last mount to run wins, and a
 * page's own Seo always mounts after the layout-level default.
 */
export default function Seo({ title, description, canonical, robots, image, type, jsonLd }) {
  const { pathname } = useLocation();
  const fallback = routeSeo(pathname);
  const key = JSON.stringify([title, description, canonical, robots, image, type, jsonLd]);

  useEffect(() => {
    applyHead({
      title: title || fallback.title,
      description: description || fallback.description,
      canonical: canonical === null ? null : canonical || absolute(pathname),
      robots: robots || fallback.robots,
      image,
      type,
      jsonLd,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, pathname]);

  return null;
}