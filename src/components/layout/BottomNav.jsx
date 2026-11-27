import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { haptic } from "@/lib/despia";
import NumberFlow from "@number-flow/react";
import { GlassLayer } from "@/components/liquid-glass/glass-layer";
import { GlassLens } from "@/components/liquid-glass/glass-lens";
import { NavIcons } from "@/components/navigation/icons";

const TABS = [
  { to: "/", label: "Home", icon: NavIcons.Home },
  { to: "/gemstones", label: "Gemstones", icon: NavIcons.Gemstones },
  { to: "/add", label: "Add", icon: Plus, raised: true },
  { to: "/messages", label: "Chats", icon: NavIcons.Chats },
  { to: "/profile", label: "Profile", icon: NavIcons.Profile },
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
  // The glass lens sits behind the active tab; the Add button carries its own emphasis.
  const activeTo = TABS.find((t) => !t.raised && isActive(t.to))?.to ?? null;

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
        data-glass-host=""
        className="glass-frost pointer-events-auto mx-auto max-w-md rounded-full px-1"
        style={{ height: "calc(var(--tabbar-h) - 0.5rem)" }}
      >
        <GlassLayer material="tinted" tint={0.4} swell={false} />
        <GlassLens value={activeTo} />
        <div role="radiogroup" aria-label="Main sections" className="relative grid h-full grid-cols-5">
          {TABS.map(({ to, label, icon: IconData, raised }) => {
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
                    <Plus className="h-6 w-6 text-white" strokeWidth={2.25} aria-hidden="true" />
                  </span>
                  <span className={`text-[0.6875rem] font-medium leading-none ${active ? "text-foreground" : "text-muted-foreground"}`}>
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
                role="radio"
                aria-checked={active}
                className="tap-scale relative flex flex-col items-center justify-center gap-0.5"
              >
                {active && (
                  <span
                    aria-hidden="true"
                    data-glass-highlight=""
                    className="pointer-events-none absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent [[data-glass-moving]_&]:opacity-0"
                  />
                )}
                <div className="relative z-20 flex h-6 w-6 items-center justify-center">
                  {/* Inactive icon */}
                  <span
                    className={`absolute transition-all duration-200 ${active ? "opacity-0 scale-75" : "opacity-100 scale-100"}`}
                    aria-hidden={active}
                  >
                    <IconData.Inactive className="h-6 w-6 text-muted-foreground" />
                  </span>
                  {/* Active icon */}
                  <span
                    className={`absolute transition-all duration-200 ${active ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                    aria-hidden={!active}
                  >
                    <IconData.Active className="h-6 w-6" />
                  </span>
                  {unread && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive px-1 text-[0.625rem] font-bold text-white">
                      {badge > 9 ? "9+" : <NumberFlow value={badge} />}
                    </span>
                  )}
                </div>
                <span className={`relative text-[0.6875rem] font-medium leading-none transition-colors ${active ? "text-foreground" : "text-muted-foreground"}`}>
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