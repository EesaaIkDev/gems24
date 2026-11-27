import React from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { Image } from "@/components/ui/image";
import { LOGO_URL } from "@/lib/gems";
import { haptic } from "@/lib/despia";
import InviteButton from "@/components/referral/InviteButton";

export default function AppHeader() {
  return (
    <header
      className="glass-frost absolute inset-x-0 top-0 z-50 rounded-none border-0 shadow-none"
      style={{
        paddingTop: "var(--safe-top)",
        paddingLeft: "var(--safe-left)",
        paddingRight: "var(--safe-right)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4" style={{ height: "var(--header-h)" }}>
        <Link to="/" className="tap-scale flex items-center" onClick={() => haptic("light")} aria-label="Gems24 home">
          <Image src={LOGO_URL} alt="" className="h-8 w-8" fittingType="fit" />
          <span className="ml-2 font-heading text-lg font-bold tracking-tight">Gems24</span>
        </Link>
        <div className="flex items-center gap-2">
        <InviteButton />
        <Link
          to="/settings"
          onClick={() => haptic("light")}
          className="glass-press flex h-10 w-10 items-center justify-center rounded-full"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5 text-foreground/80" aria-hidden="true" />
        </Link>
        </div>
      </div>
    </header>
  );
}