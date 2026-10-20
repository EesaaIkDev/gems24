import { useEffect } from "react";
import { haptic } from "@/lib/despia";

/** Error haptic each time an error message appears (no-op on the web). */
export default function useErrorHaptic(error) {
  useEffect(() => {
    if (error) haptic("error");
  }, [error]);
}
