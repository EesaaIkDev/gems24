import { useEffect, useState } from "react";

export default function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem("gems24-theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("gems24-theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, setDark, toggle: () => setDark((d) => !d) };
}