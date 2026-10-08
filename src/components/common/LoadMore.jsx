import React, { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

/**
 * Infinite-scroll trigger: loads the next page as it scrolls into view, with a
 * tap target as a fallback. `watch` re-arms it after each page, so a short
 * filtered list keeps filling until the screen is full or nothing is left.
 */
export default function LoadMore({ hasMore, loading, onLoad, watch }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore || loading || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => entries[0]?.isIntersecting && onLoad(), {
      rootMargin: "400px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, onLoad, watch]);

  if (!hasMore) return null;
  return (
    <div ref={ref} className="flex justify-center py-4">
      <button
        type="button"
        onClick={onLoad}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-medium text-primary disabled:text-muted-foreground"
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {loading ? "Loading…" : "Load more"}
      </button>
    </div>
  );
}
