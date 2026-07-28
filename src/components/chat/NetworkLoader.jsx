import React from "react";

const CSS = `
.g24-anim svg { width: 100%; height: 100%; overflow: visible; }
.g24-anim .loading-group { animation: g24-fadeOut 0.4s ease forwards; animation-delay: 2.35s; }
.g24-anim .gem-shake-wrap { transform-box: view-box; transform-origin: 50px 48px; animation: g24-shake 1.95s ease-in-out infinite; }
.g24-anim .gem { fill: #17BF6A; transform-box: view-box; transform-origin: 50px 48px; animation: g24-gemCompress 0.4s ease forwards, g24-gemFade 0.2s ease forwards; animation-delay: 2.35s, 2.75s; }
.g24-anim .glass { transform-box: view-box; transform-origin: 50px 48px; animation: g24-pulse 2.35s ease-in-out infinite; }
.g24-anim .ring { fill: none; stroke: #17BF6A; stroke-width: 5.76; }
.g24-anim .handle { transform-box: view-box; transform-origin: 50px 48px; animation: g24-spin 2.35s linear 1 forwards; }
.g24-anim .handle-retract { transform-box: view-box; transform-origin: 73px 71px; animation: g24-retract 0.4s ease forwards; animation-delay: 2.35s; }
.g24-anim .handle line { stroke: #17BF6A; stroke-width: 5.76; stroke-linecap: round; }
.g24-anim .sparkle { fill: #ffffff; opacity: 0; animation: g24-twinkle 3s ease-in-out infinite; }
.g24-anim .sparkle.s2 { animation-delay: 0.8s; }
.g24-anim .sparkle.s3 { animation-delay: 1.6s; }
.g24-anim .success-circle { fill: none; stroke: #17BF6A; stroke-width: 4; opacity: 0; transform-box: view-box; transform-origin: 50px 48px; animation: g24-popIn 0.4s ease forwards; animation-delay: 2.35s; }
.g24-anim .checkmark { fill: none; stroke: #17BF6A; stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 46; stroke-dashoffset: 46; animation: g24-drawCheck 0.575s ease forwards; animation-delay: 2.75s; }
@keyframes g24-fadeOut { to { opacity: 0; } }
@keyframes g24-popIn { 0% { opacity: 0; transform: scale(0.97); } 100% { opacity: 1; transform: scale(1); } }
@keyframes g24-drawCheck { to { stroke-dashoffset: 0; } }
@keyframes g24-retract { 0% { transform: scale(1); } 100% { transform: scale(0.02); } }
@keyframes g24-gemCompress { 0% { transform: translate(0px, 0px) rotate(0deg) scale(1, 1); } 100% { transform: translate(-9px, 7px) rotate(45deg) scale(0.45, 0.06); } }
@keyframes g24-gemFade { 0% { opacity: 1; } 100% { opacity: 0; } }
@keyframes g24-shake {
  0% { transform: translate(0px, 0px); }
  8% { transform: translate(-0.4px, 0.3px); }
  16% { transform: translate(0.4px, -0.3px); }
  24% { transform: translate(-0.3px, -0.4px); }
  32% { transform: translate(0.3px, 0.3px); }
  40% { transform: translate(-0.4px, 0.2px); }
  48% { transform: translate(0.3px, -0.3px); }
  56% { transform: translate(-0.2px, 0.2px); }
  60%, 100% { transform: translate(0px, 0px); }
}
@keyframes g24-pulse { 0% { transform: scale(1); } 25% { transform: scale(0.93); } 50% { transform: scale(1); } 75% { transform: scale(1.10); } 100% { transform: scale(1); } }
@keyframes g24-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
@keyframes g24-twinkle { 0%, 100% { opacity: 0; transform: scale(0.4); } 50% { opacity: 1; transform: scale(1); } }
`;

/** Gem magnifier → success checkmark animation. */
export default function NetworkLoader({ size = 140 }) {
  return (
    <>
      <style>{CSS}</style>
      <div className="g24-anim" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100">
          <g className="loading-group">
            <g className="gem-shake-wrap">
              <polygon className="gem" points="39,36 61,36 68,48 50,66 32,48" />
            </g>
            <g className="sparkle s1" style={{ transformOrigin: "44px 40px" }}>
              <polygon points="44,37 45.5,39.5 44,42 42.5,39.5" />
            </g>
            <g className="sparkle s2" style={{ transformOrigin: "62px 44px" }}>
              <polygon points="62,41 63.5,43.5 62,46 60.5,43.5" />
            </g>
            <g className="sparkle s3" style={{ transformOrigin: "50px 58px" }}>
              <polygon points="50,55 51.5,57.5 50,60 48.5,57.5" />
            </g>
            <g className="glass">
              <circle className="ring" cx="50" cy="48" r="30" />
              <g className="handle">
                <g className="handle-retract">
                  <line x1="73" y1="71" x2="87" y2="85" />
                </g>
              </g>
            </g>
          </g>
          <circle className="success-circle" cx="50" cy="48" r="30" />
          <path className="checkmark" d="M36,50 L46,60 L66,36" />
        </svg>
      </div>
    </>
  );
}