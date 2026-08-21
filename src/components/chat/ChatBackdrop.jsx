import React from "react";

/**
 * Full-screen doodle wallpaper for chat (dark mode only).
 * `lighten` blending drops the artwork's own dark backdrop so the doodles sit
 * directly on the app's background colour.
 */
export default function ChatBackdrop() {
  return (
    <div
      aria-hidden
      className="hidden dark:block fixed inset-0 -z-10 bg-background pointer-events-none"
      style={{
        backgroundImage:
          "url('https://media.base44.com/images/public/6a661583e07cf311ecceee39/85d370d63_Gems24-chat-bg-dark.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "320px 320px",
        backgroundBlendMode: "lighten",
      }}
    />
  );
}