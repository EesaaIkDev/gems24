import React from "react";
import { motion } from "framer-motion";
import * as Cut from "./gemCuts";

/**
 * A gem dealer's sketchbook: fine-line gemstone cuts, a few trade tools and
 * occasional Gems24 brand accents, scattered around an empty centre so the
 * wordmark stays the focal point.
 */
const SKETCHES = [
  // Top band
  { C: Cut.RoundBrilliant, x: 34, y: 40, r: -8, s: 0.9 },
  { C: Cut.EmeraldCut, x: 112, y: 36, r: 12, s: 0.8 },
  { C: Cut.PearCut, x: 196, y: 30, r: -14, s: 0.8 },
  { C: Cut.MarquiseCut, x: 274, y: 44, r: 32, s: 0.75 },
  { C: Cut.AsscherCut, x: 352, y: 34, r: -6, s: 0.85 },
  { C: Cut.Sparkle, x: 154, y: 74, r: 0, s: 0.55 },
  { C: Cut.Tweezers, x: 236, y: 78, r: 18, s: 0.9 },

  // Upper-middle band
  { C: Cut.OvalCut, x: 30, y: 116, r: 16, s: 0.85 },
  { C: Cut.HexagonCut, x: 96, y: 104, r: -10, s: 0.75 },
  { C: Cut.BrandMark, x: 320, y: 106, r: 8, s: 0.8 },
  { C: Cut.RoughStone, x: 366, y: 158, r: 14, s: 0.85 },
  { C: Cut.FacetDiagram, x: 60, y: 176, r: 0, s: 0.7 },

  // Sides of the clear centre
  { C: Cut.PrincessCut, x: 26, y: 240, r: 14, s: 0.7 },
  { C: Cut.StoneProfile, x: 74, y: 288, r: -6, s: 0.8 },
  { C: Cut.CushionCut, x: 356, y: 232, r: -12, s: 0.8 },
  { C: Cut.BrandGem24, x: 312, y: 288, r: 6, s: 0.9 },
  { C: Cut.Sparkle, x: 30, y: 318, r: 12, s: 0.5 },

  // Lower band
  { C: Cut.RadiantCut, x: 118, y: 342, r: 10, s: 0.8 },
  { C: Cut.HeartCut, x: 206, y: 352, r: -8, s: 0.7 },
  { C: Cut.OctagonCut, x: 286, y: 344, r: 16, s: 0.8 },
  { C: Cut.Loupe, x: 44, y: 372, r: -12, s: 0.85 },
  { C: Cut.GemTray, x: 176, y: 404, r: 0, s: 0.85 },
  { C: Cut.GemScale, x: 262, y: 400, r: 0, s: 0.75 },
  { C: Cut.GemBox, x: 342, y: 398, r: 8, s: 0.85 },
  { C: Cut.BrandWordmark, x: 84, y: 424, r: -6, s: 0.9 },
  { C: Cut.BrandG24, x: 366, y: 300, r: 10, s: 0.75 },
];

const DOTS = [
  [22, 78], [172, 16], [300, 70], [376, 118], [16, 152], [128, 132],
  [340, 176], [20, 206], [372, 258], [96, 322], [232, 320], [8, 348],
  [154, 380], [318, 372], [216, 428], [58, 410],
];

export default function GemPattern() {
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 text-welcome-text/45"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <svg viewBox="0 0 390 440" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round">
          {SKETCHES.map(({ C, x, y, r, s }, i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
              <C />
            </g>
          ))}
          {DOTS.map(([x, y], i) => (
            <circle key={`d${i}`} cx={x} cy={y} r="1.6" fill="currentColor" stroke="none" />
          ))}
        </g>
      </svg>
    </motion.div>
  );
}