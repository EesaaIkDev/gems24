import React, { useRef } from "react";
import { ImagePlus } from "lucide-react";

export default function AttachPhotoButton({ onPick, disabled }) {
  const input = useRef(null);
  return (
    <>
      <button
        type="button"
        aria-label="Send a photo"
        disabled={disabled}
        onClick={() => input.current?.click()}
        className="neu-raised-sm flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-foreground hover:text-primary disabled:opacity-50"
      >
        <ImagePlus className="w-5 h-5" />
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onPick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </>
  );
}