import { useCallback, useEffect, useRef, useState } from "react";
import { haptic } from "@/lib/despia";

const THRESHOLD = 64; // px of pull needed to trigger a refresh
const MAX_PULL = 120; // asymptotic max travel
const HOLD = 56;      // where the indicator rests while refreshing

// Smooth rubber band: linear-ish at first, easing toward MAX_PULL.
const rubber = (dy) => MAX_PULL * (1 - Math.exp(-dy / (MAX_PULL * 1.6)));

/**
 * iOS-style pull-to-refresh on a scroll container. Starts only when the
 * container is at the very top; updates are batched per animation frame.
 */
export default function usePullToRefresh(ref, onRefresh) {
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const armed = useRef(false);
  const startY = useRef(0);
  const passed = useRef(false);
  const frame = useRef(0);

  const run = useCallback(async () => {
    setRefreshing(true);
    setPull(HOLD);
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
      if (dy <= 0 || el.scrollTop > 0) {
        armed.current = false;
        setDragging(false);
        setPull(0);
        return;
      }
      const next = rubber(dy);
      if (next >= THRESHOLD && !passed.current) {
        passed.current = true;
        haptic("light");
      } else if (next < THRESHOLD) {
        passed.current = false;
      }
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        setDragging(true);
        setPull(next);
      });
    };

    const onEnd = () => {
      if (!armed.current) return;
      armed.current = false;
      cancelAnimationFrame(frame.current);
      setDragging(false);
      if (passed.current) run();
      else setPull(0);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      cancelAnimationFrame(frame.current);
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [ref, refreshing, run]);

  return { pull, dragging, refreshing, progress: Math.min(1, pull / THRESHOLD) };
}