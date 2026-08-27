import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyHead } from "@/lib/head";
import { routeSeo } from "@/lib/seo";

/**
 * Route-level metadata safety net: every screen gets a correct title, unique
 * description and the right robots directive even when it renders no <Seo/>.
 * Pages with richer data render <Seo/> themselves, which runs afterwards.
 */
export default function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    applyHead(routeSeo(pathname));
  }, [pathname]);

  return null;
}