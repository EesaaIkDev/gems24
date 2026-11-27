import React from "react";

// Colourful, scrolling content for the glass to bend. Plain <img> on purpose: the glass
// repaints the page behind it and needs the real (CORS-enabled) image elements.
const PHOTOS = [
  "https://images.unsplash.com/photo-1615655096345-61a54750068d?w=600",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600",
  "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=600",
];

export default function GemBackdrop() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PHOTOS.map((src) => (
        <img key={src} src={src} alt="" crossOrigin="anonymous" className="aspect-square w-full rounded-lg object-cover" />
      ))}
      <div className="col-span-2 h-24 rounded-lg bg-gradient-to-r from-primary via-chart-2 to-chart-4" />
    </div>
  );
}