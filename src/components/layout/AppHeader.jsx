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
      className="bg-background absolute inset-x-0 top-0 z-50 shadow-[0_4px_12px_hsl(var(--neu-dark))]"
      style={{
        paddingTop: "var(--safe-top)",
        paddingLeft: "var(--safe-left)",
        paddingRight: "var(--safe-right)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4" style={{ height: "var(--header-h)" }}>
        <Link to="/" className="tap-scale flex items-center" onClick={() => haptic("light")} aria-label="Gems24 home">
          <Image src={LOGO_URL} alt="Gems24" className="h-8 w-8" fittingType="fit" />
        </Link>
        <div className="flex items-center gap-1">
        <InviteButton />
        <Link
          to="/settings"
          onClick={() => haptic("light")}
          className="tap-scale flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </Link>
        </div>
      </div>
    </header>
  );
}