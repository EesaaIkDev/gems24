import React from "react";

/**
 * Hand-sketched gemstone line art. Every shape is drawn centred on the origin
 * so the background pattern can freely translate / rotate / scale each one.
 * Stroke styling is inherited from the parent <g>.
 */

export const RoundBrilliant = () => (
  <g>
    <circle r="15" />
    <circle r="9" />
    <path d="M-9-9-15-3M9-9 15-3M-9 9-15 3M9 9 15 3M0-9v-6M0 9v6M-9 0h-6M9 0h6" />
    <path d="M-4.5-7.8 0-4l4.5-3.8M-4.5 7.8 0 4l4.5 3.8" />
  </g>
);

export const OvalCut = () => (
  <g>
    <ellipse rx="11" ry="16" />
    <ellipse rx="6" ry="9" />
    <path d="M-6-9-11-4M6-9 11-4M-6 9-11 4M6 9 11 4M0-9v-7M0 9v7" />
  </g>
);

export const EmeraldCut = () => (
  <g>
    <path d="M-6-17h12l6 5v24l-6 5h-12l-6-5v-24Z" />
    <path d="M-4.5-13.5h9l4 3.5v20l-4 3.5h-9l-4-3.5v-20Z" />
    <path d="M-3-10h6l2.5 2v16l-2.5 2h-6l-2.5-2v-16Z" />
  </g>
);

export const CushionCut = () => (
  <g>
    <path d="M-8-15h16a7 7 0 0 1 7 7v16a7 7 0 0 1-7 7h-16a7 7 0 0 1-7-7v-16a7 7 0 0 1 7-7Z" />
    <path d="M-6-10h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-12a4 4 0 0 1-4-4v-12a4 4 0 0 1 4-4Z" />
    <path d="M-15-8-10-10M15-8 10-10M-15 8-10 10M15 8 10 10" />
  </g>
);

export const PearCut = () => (
  <g>
    <path d="M0-19c8 9 13 16 13 22a13 13 0 0 1-26 0c0-6 5-13 13-22Z" />
    <path d="M-8 1c4-6 8-10 8-10s4 4 8 10a8 8 0 0 1-16 0Z" />
    <path d="M0-19v9M-13 3-8 1M13 3 8 1M-6 12-3 9M6 12 3 9" />
  </g>
);

export const MarquiseCut = () => (
  <g>
    <path d="M0-20c8 8 12 15 12 20s-4 12-12 20c-8-8-12-15-12-20s4-12 12-20Z" />
    <path d="M0-11c4 5 6 8 6 11s-2 6-6 11c-4-5-6-8-6-11s2-6 6-11Z" />
    <path d="M-12 0h-0M0-20v9M0 20v-9M-12 0l-6 0M12 0l6 0" />
  </g>
);

export const PrincessCut = () => (
  <g>
    <path d="M-14-14h28v28h-28Z" />
    <path d="M-7-7h14v14h-14Z" />
    <path d="M-14-14 7-7M14-14 7 7M14 14-7 7M-14 14-7-7" />
  </g>
);

export const RadiantCut = () => (
  <g>
    <path d="M-7-14h14l6 5v18l-6 5h-14l-6-5v-18Z" />
    <path d="M-4.5-9h9l3.5 3v12l-3.5 3h-9l-3.5-3v-12Z" />
    <path d="M-13-9-4.5-9M13-9 4.5-9M-13 9-4.5 9M13 9 4.5 9" />
  </g>
);

export const AsscherCut = () => (
  <g>
    <path d="M-8-14h16l6 6v16l-6 6h-16l-6-6v-16Z" />
    <path d="M-5-9.5h10l4 4v11l-4 4h-10l-4-4v-11Z" />
    <path d="M-2.5-5h5l2 2v6l-2 2h-5l-2-2v-6Z" />
    <path d="M-14-8-8-14M14-8 8-14M-14 8-8 14M14 8 8 14" />
  </g>
);

export const HeartCut = () => (
  <g>
    <path d="M0 17c-11-8-17-15-17-22a9 9 0 0 1 17-5 9 9 0 0 1 17 5c0 7-6 14-17 22Z" />
    <path d="M0-10v27M-10-4l5 9M10-4l-5 9" />
  </g>
);

export const HexagonCut = () => (
  <g>
    <path d="M0-16 13-8v16L0 16-13 8v-16Z" />
    <path d="M0-8 7-4v8L0 8-7 4v-8Z" />
    <path d="M0-16v8M13-8 7-4M13 8 7 4M0 16v-8M-13 8-7 4M-13-8-7-4" />
  </g>
);

export const OctagonCut = () => (
  <g>
    <path d="M-6-15h12l9 9v12l-9 9h-12l-9-9v-12Z" />
    <path d="M-3.5-8h7l5 5v6l-5 5h-7l-5-5v-6Z" />
    <path d="M-15-6-8.5-8M15-6 8.5-8M-15 6-8.5 8M15 6 8.5 8" />
  </g>
);

/** Un-cut rough crystal — deliberately irregular. */
export const RoughStone = () => (
  <g>
    <path d="M-12-9-2-16l12 5 4 12-8 11-13-2-5-11Z" />
    <path d="M-2-16-1-3l11-3M-1-3-5 21M-1-3-14-7" />
  </g>
);

/** Brilliant seen from the side — crown, girdle and pavilion. */
export const StoneProfile = () => (
  <g>
    <path d="M-16-8h32l-16 22Z" />
    <path d="M-16-8-10-14h20l6 6M-10-14-6-8M10-14 6-8M-9-8-0 14 9-8" />
  </g>
);

/** Faceting layout diagram — a trade sketch, not a stone. */
export const FacetDiagram = () => (
  <g>
    <circle r="14" strokeDasharray="3 3" />
    <path d="M0-14 12 7-12 7ZM-12-7 12-7 0 14Z" />
  </g>
);

export const Loupe = () => (
  <g>
    <circle cx="-3" cy="-3" r="11" />
    <path d="m5 5 9 9" />
    <path d="M-9-5h12l-6 8Z" />
  </g>
);

export const Tweezers = () => (
  <g>
    <path d="M-5-14 0 6l5-20M0 6l-1 9M0 6l1 9" />
    <path d="M-3-2h6" />
  </g>
);

export const GemTray = () => (
  <g>
    <path d="M-16-6h32l-4 12h-24Z" />
    <path d="M-11-6v12M0-6v12M11-6v12" />
  </g>
);

export const GemScale = () => (
  <g>
    <path d="M0-14v22M-14-8h28M-9-14h18" />
    <path d="M-14-8c0 5 3 8 5 8s5-3 5-8M14-8c0 5-3 8-5 8s-5-3-5-8" />
    <path d="M-6 8h12" />
  </g>
);

export const GemBox = () => (
  <g>
    <path d="M-12-4h24v14h-24Z" />
    <path d="M-12-4-8-12h16l4 8M0-12v14" />
  </g>
);

export const Sparkle = () => (
  <g>
    <path d="M0-9v18M-9 0h18M-5-5 5 5M5-5-5 5" />
  </g>
);

/** The Gems24 mark, redrawn as fine line art: gem inside a loupe. */
export const BrandMark = () => (
  <g>
    <circle cx="-2" cy="-2" r="13" />
    <path d="m7.5 7.5 8 8" />
    <path d="M-10-6h16l-8 11Z" />
    <path d="M-5.5-6-2 5M2-6-2 5" />
  </g>
);

/** Simplified brand accent — a gem cradling the "24". */
export const BrandGem24 = () => (
  <g>
    <path d="M-13-8h26l-13 19Z" />
    <path d="M-6-8-0 11 6-8" />
    <text
      x="0"
      y="-1"
      textAnchor="middle"
      fontSize="7"
      fill="currentColor"
      stroke="none"
      fontFamily="var(--font-display)"
    >
      24
    </text>
  </g>
);

export const BrandWordmark = () => (
  <text
    textAnchor="middle"
    fontSize="11"
    fill="currentColor"
    stroke="none"
    fontFamily="var(--font-display)"
    fontStyle="italic"
  >
    Gems24
  </text>
);

export const BrandG24 = () => (
  <text
    textAnchor="middle"
    fontSize="12"
    fill="currentColor"
    stroke="none"
    fontFamily="var(--font-display)"
  >
    G24
  </text>
);