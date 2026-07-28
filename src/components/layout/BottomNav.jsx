import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageSquare, Gem, User } from "lucide-react";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/directory", label: "Directory", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/my-listings", label: "Listings", icon: Gem },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav({ badge = 0 }) {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className="relative flex flex-col items-center justify-center gap-1 h-16 transition-colors"
            >
              <div className="relative">
                <Icon
                  className={`w-[22px] h-[22px] transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                />
                {label === "Messages" && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}