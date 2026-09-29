import { useEffect, useState } from "react";

const KEY = "gems24-theme";

/** Saved choice wins; otherwise follow the device's appearance. */
export function prefersDark() {
  const saved = localStorage.getItem(KEY);
  if (saved) return saved === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function useTheme() {
  const [dark, setDarkState] = useState(prefersDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Only persist when the user makes a manual choice.
  const setDark = (next) =>
    setDarkState((d) => {
      const v = typeof next === "function" ? next(d) : next;
      localStorage.setItem(KEY, v ? "dark" : "light");
      return v;
    });

  return { dark, setDark, toggle: () => setDark((d) => !d) };
}