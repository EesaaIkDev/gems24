import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { haptic } from "@/lib/despia";

const TABS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/gemstones", label: "Gemstones", icon: Search },
  { to: "/add", label: "Add", icon: Plus, raised: true },
  { to: "/messages", label: "Chats", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav({ badge = 0 }) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  // Tapping a tab always lands on its clean root; tapping the root again scrolls to top.
  const onTab = (e, to) => {
    e.preventDefault();
    haptic("light");
    if (pathname === to && !search) {
      document.getElementById("app-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const nested = to !== "/" && pathname.startsWith(to + "/");
    navigate(to, { replace: nested, state: null });
  };

  return (
    <nav
      aria-label="Main"
      className="bg-background absolute inset-x-0 bottom-0 z-50 shadow-[0_-4px_12px_hsl(var(--neu-dark))]"
      style={{
        paddingBottom: "var(--safe-bottom)",
        paddingLeft: "var(--safe-left)",
        paddingRight: "var(--safe-right)",
      }}
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ to, label, icon: Icon, raised }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          const unread = label === "Chats" && badge > 0;

          if (raised) {
            return (
              <Link
                key={to}
                to={to}
                onClick={(e) => onTab(e, to)}
                aria-label="Add a gemstone listing"
                className="tap-scale flex flex-col items-center justify-center"
                style={{ height: "var(--tabbar-h)" }}
              >
                <span className="neu-raised -mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary ring-4 ring-background">
                  <Plus className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                </span>
                <span className="mt-1 text-[0.625rem] font-medium text-muted-foreground">Add</span>
              </Link>
            );
          }

          return (
            <Link
              key={to}
              to={to}
              onClick={(e) => onTab(e, to)}
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