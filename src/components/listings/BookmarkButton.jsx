import React from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import useSavedListings from "@/hooks/useSavedListings";

/** Clear-glass save control that sits over a listing photo. */
export default function BookmarkButton({ listing, className = "" }) {
  const { isSaved, toggle } = useSavedListings();
  const saved = isSaved(listing.id);

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save gemstone"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(listing);
      }}
      className={`glass-clear glass-press flex h-8 w-8 items-center justify-center rounded-full ${className}`}
    >
      <motion.span
        key={saved ? "on" : "off"}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 520, damping: 14 }}
        className="flex"
      >
        <Bookmark
          className={`h-4 w-4 ${saved ? "fill-primary text-primary" : "text-foreground"}`}
          aria-hidden="true"
        />
      </motion.span>
    </button>
  );
}