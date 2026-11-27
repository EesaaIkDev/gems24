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

/** Floating frosted-glass tab bar. The selection lens glides between tabs. */
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

  const isActive = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  // The lens sits behind the active tab; the Add button carries its own emphasis.
  const lensIndex = TABS.findIndex((t) => !t.raised && isActive(t.to));

  return (
    <nav
      aria-label="Main"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-50"
      style={{
        paddingBottom: "calc(var(--safe-bottom) + 0.5rem)",
        paddingLeft: "calc(var(--safe-left) + 0.75rem)",
        paddingRight: "calc(var(--safe-right) + 0.75rem)",
      }}
    >
      <div
        className="glass-frost pointer-events-auto mx-auto max-w-md rounded-full px-1"
        style={{ height: "calc(var(--tabbar-h) - 0.5rem)" }}
      >
      <div className="relative grid h-full grid-cols-5">
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-1 left-0 w-1/5 px-0.5 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)] ${lensIndex < 0 ? "opacity-0" : ""}`}
          style={{ transform: `translateX(${Math.max(lensIndex, 0) * 100}%)` }}
        >
          <span className="block h-full rounded-full bg-primary/[0.12]" />
        </span>
        {TABS.map(({ to, label, icon: Icon, raised }) => {
          const active = isActive(to);
          const unread = label === "Chats" && badge > 0;

          if (raised) {
            return (
              <Link
                key={to}
                to={to}
                onClick={(e) => onTab(e, to)}
                aria-label="Add a gemstone listing"
                aria-current={active ? "page" : undefined}
                className="glass-press flex flex-col items-center justify-end gap-1 pb-1.5"
              >
                <span className="glass-emerald -mt-5 flex h-12 w-12 items-center justify-center rounded-full">
                  <Plus className="h-6 w-6" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <span className={`text-[0.6875rem] font-medium leading-none ${active ? "text-primary" : "text-muted-foreground"}`}>
                  {label}
                </span>
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
              className="tap-scale relative flex flex-col items-center justify-center gap-0.5"
            >
              <div className="relative">
                <Icon
                  aria-hidden="true"
                  className={`h-[1.375rem] w-[1.375rem] transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                />
                {unread && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] font-bold text-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={`relative text-[0.6875rem] font-medium leading-none transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      </div>
    </nav>
  );
}