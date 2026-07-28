import React from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { LOGO_URL } from "@/lib/gems";
import { haptic } from "@/lib/despia";

export default function AppHeader() {
  return (
    <header
      className="glass-chrome absolute inset-x-0 top-0 z-40 border-b border-border/60"
      style={{
        paddingTop: "var(--safe-top)",
        paddingLeft: "var(--safe-left)",
        paddingRight: "var(--safe-right)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4" style={{ height: "var(--header-h)" }}>
        <Link to="/" className="tap-scale flex items-center gap-2" onClick={() => haptic("light")}>
          <img src={LOGO_URL} alt="" aria-hidden="true" className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight">
            Gems<span className="text-primary">24</span>
          </span>
        </Link>
        <Link
          to="/settings"
          onClick={() => haptic("light")}
          className="tap-scale flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}