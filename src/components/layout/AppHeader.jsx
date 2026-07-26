import React from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { LOGO_URL } from "@/lib/gems";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="Gems24" className="w-9 h-9" />
          <span className="text-xl font-bold tracking-tight">
            Gems<span className="text-primary">24</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/settings"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-secondary transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </header>
  );
}