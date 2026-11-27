import React from "react";

/** Custom Gems24 navigation icons with active/inactive states */

export const NavIcons = {
  Home: {
    Inactive: ({ className = "" }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    Active: ({ className = "" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        {/* Main house body */}
        <path
          d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          fill="oklch(var(--primary))"
        />
        {/* Roof accent */}
        <path
          d="M3 9l9-7 9 7"
          stroke="oklch(75% 0.12 153)"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Window */}
        <rect
          x="9"
          y="12"
          width="6"
          height="10"
          fill="oklch(75% 0.12 153)"
        />
        {/* Door */}
        <rect
          x="11"
          y="14"
          width="2"
          height="8"
          fill="oklch(55% 0.15 153)"
        />
        {/* Mint accent dot */}
        <circle cx="18" cy="20" r="1.5" fill="oklch(75% 0.12 153)" />
      </svg>
    ),
  },

  Gemstones: {
    Inactive: ({ className = "" }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    Active: ({ className = "" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        {/* Magnifying glass handle */}
        <path
          d="m21 21-4.35-4.35"
          stroke="oklch(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Lens outer ring */}
        <circle
          cx="11"
          cy="11"
          r="8"
          stroke="oklch(var(--primary))"
          strokeWidth="2"
          fill="oklch(55% 0.15 153 / 0.2)"
        />
        {/* Gemstone inside lens */}
        <path
          d="M11 8l2 2-2 5-2-5z"
          fill="oklch(var(--primary))"
        />
        <path
          d="M11 8l2 2h-4z"
          fill="oklch(75% 0.12 153)"
        />
        {/* Mint sparkles */}
        <circle cx="8" cy="14" r="0.5" fill="oklch(75% 0.12 153)" />
        <circle cx="14" cy="14" r="0.5" fill="oklch(75% 0.12 153)" />
      </svg>
    ),
  },

  Chats: {
    Inactive: ({ className = "" }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    Active: ({ className = "" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        {/* Back bubble */}
        <path
          d="M18 11a2 2 0 0 1-2 2H9l-4 4V7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2z"
          fill="oklch(75% 0.12 153)"
        />
        {/* Front bubble */}
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          fill="oklch(var(--primary))"
        />
        {/* Chat dots */}
        <circle cx="12" cy="9" r="1" fill="oklch(75% 0.12 153)" />
        <circle cx="16" cy="9" r="1" fill="oklch(75% 0.12 153)" />
      </svg>
    ),
  },

  Profile: {
    Inactive: ({ className = "" }) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    Active: ({ className = "" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        {/* Body */}
        <path
          d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
          fill="oklch(var(--primary))"
        />
        {/* Head */}
        <circle
          cx="12"
          cy="7"
          r="4"
          fill="oklch(75% 0.12 153)"
        />
        {/* Mint accent */}
        <circle cx="18" cy="18" r="1.5" fill="oklch(75% 0.12 153)" />
      </svg>
    ),
  },
};

/** Add button icon (unchanged) */
export const AddIcon = {
  Inactive: ({ className = "" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Active: ({ className = "" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};