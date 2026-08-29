import { useCallback, useEffect, useRef, useState } from "react";
import { haptic } from "@/lib/despia";

const THRESHOLD = 70;   // px of pull needed to trigger a refresh
const MAX_PULL = 110;   // px the indicator can travel
const RESIST = 0.5;     // rubber-band factor

/**
 * iOS-style pull-to-refresh on a scroll container. The gesture only starts
 * when the container is already at the very top, so normal scrolling is
 * untouched.
 */
export default function usePullToRefresh(ref, onRefresh) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const armed = useRef(false);
  const startY = useRef(0);
  const passed = useRef(false);

  const run = useCallback(async () => {
    setRefreshing(true);
    haptic("light");
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
      setPull(0);
    }
  }, [onRefresh]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onStart = (e) => {
      if (refreshing || e.touches.length !== 1) return;
      armed.current = el.scrollTop <= 0;
      startY.current = e.touches[0].clientY;
      passed.current = false;
    };

    const onMove = (e) => {
      if (!armed.current || refreshing) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) {
        armed.current = false;
        setPull(0);
        return;
      }
      const next = Math.min(MAX_PULL, dy * RESIST);
      if (next >= THRESHOLD && !passed.current) {
        passed.current = true;
        haptic("light");
      }
      setPull(next);
    };

    const onEnd = () => {
      if (!armed.current) return;
      armed.current = false;
      if (passed.current) run();
      else setPull(0);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [ref, refreshing, run]);

  return { pull, refreshing, progress: Math.min(1, pull / THRESHOLD) };
}