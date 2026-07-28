import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageSquare, Gem, User } from "lucide-react";
import { haptic } from "@/lib/despia";

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
    <nav
      aria-label="Main"
      className="glass-chrome absolute inset-x-0 bottom-0 z-40 border-t border-border/60"
      style={{
        paddingBottom: "var(--safe-bottom)",
        paddingLeft: "var(--safe-left)",
        paddingRight: "var(--safe-right)",
      }}
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          const unread = label === "Messages" && badge > 0;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => haptic("light")}
              aria-label={unread ? `${label}, ${badge} unread` : label}
              aria-current={active ? "page" : undefined}
              className="tap-scale relative flex flex-col items-center justify-center gap-1"
              style={{ height: "var(--tabbar-h)" }}
            >
              <div className="relative">
                <Icon
                  aria-hidden="true"
                  className={`h-[1.375rem] w-[1.375rem] ${active ? "text-primary" : "text-muted-foreground"}`}
                />
                {unread && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] font-bold text-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={`text-[0.625rem] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}