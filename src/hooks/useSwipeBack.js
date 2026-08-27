import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { haptic } from "@/lib/despia";

const EDGE = 60;      // px from the left edge that starts the gesture
const DISTANCE = 60;  // px of travel needed to trigger back

/** iOS-style edge swipe-back on the given element. */
export default function useSwipeBack(ref, enabled = true) {
  const navigate = useNavigate();

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onStart = (e) => {
      const t = e.touches[0];
      tracking = t.clientX <= EDGE;
      startX = t.clientX;
      startY = t.clientY;
    };

    const onEnd = (e) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      if (dx > DISTANCE && dy < 60 && window.history.length > 1) {
        haptic("light");
        navigate(-1);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [ref, enabled, navigate]);
}