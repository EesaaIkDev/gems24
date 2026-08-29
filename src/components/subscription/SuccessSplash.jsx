import React, { useEffect } from "react";
import { createPortal } from "react-dom";

/** Full-screen confirmation: the loupe finishes inspecting, then a tick draws. */
export default function SuccessSplash({ title = "Payment complete", subtitle, onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 3600);
    return () => clearTimeout(t);
  }, [onDone]);

  // Portalled to <body> so no page transform, header or tab bar can offset or
  // clip it — it always lands dead centre of the screen.
  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background px-8 text-center">
      <div className="h-[140px] w-[140px]">
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible" aria-hidden="true">
          <g className="gs-loading-group">
            <g className="gs-shake">
              <polygon className="gs-gem" points="39,36 61,36 68,48 50,66 32,48" />
            </g>
            <g className="gs-sparkle s1" style={{ transformOrigin: "44px 40px" }}>
              <polygon points="44,37 45.5,39.5 44,42 42.5,39.5" />
            </g>
            <g className="gs-sparkle s2" style={{ transformOrigin: "62px 44px" }}>
              <polygon points="62,41 63.5,43.5 62,46 60.5,43.5" />
            </g>
            <g className="gs-sparkle s3" style={{ transformOrigin: "50px 58px" }}>
              <polygon points="50,55 51.5,57.5 50,60 48.5,57.5" />
            </g>
            <g className="gs-glass">
              <circle className="gs-ring" cx="50" cy="48" r="30" />
              <g className="gs-handle">
                <g className="gs-handle-retract">
                  <line x1="73" y1="71" x2="87" y2="85" />
                </g>
              </g>
            </g>
          </g>
          <circle className="gs-success-circle" cx="50" cy="48" r="30" />
          <path className="gs-check" d="M36,50 L46,60 L66,36" />
        </svg>
      </div>
      <h2 className="mt-6 font-heading text-xl font-bold">{title}</h2>
      {subtitle && <p className="mt-2 max-w-xs text-sm text-muted-foreground">{subtitle}</p>}
    </div>,
    document.body
  );
}