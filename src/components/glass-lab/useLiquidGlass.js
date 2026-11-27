import { useEffect, useState } from "react";

// The MIT Liquid Glass files (github.com/bilalgursen/liquid-glass) are copied verbatim into
// src/components/liquid-glass/. Only the zero-dependency components are loaded here; the
// glob is empty until the folder exists, so the build never breaks without it.
const modules = import.meta.glob([
  "/src/components/liquid-glass/glass-card.tsx",
  "/src/components/liquid-glass/glass-badge.tsx",
  "/src/components/liquid-glass/glass-slide-to-confirm.tsx",
]);

export const LIQUID_GLASS_INSTALLED = Object.keys(modules).length === 3;

export function hasWebGL2() {
  return !!document.createElement("canvas").getContext("webgl2");
}

/** Loads the glass components on demand; null until they are ready (or not installed). */
export default function useLiquidGlass() {
  const [lib, setLib] = useState(null);
  useEffect(() => {
    if (!LIQUID_GLASS_INSTALLED) return;
    Promise.all(Object.values(modules).map((load) => load())).then((mods) =>
      setLib(Object.assign({}, ...mods))
    );
  }, []);
  return lib;
}