import React, { useEffect, useRef } from "react";
import { useLocation, useNavigationType, useOutlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";
import PageTransition from "./PageTransition";
import useTheme from "@/hooks/useTheme";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import useMessageNotifications from "@/hooks/useMessageNotifications";
import useSwipeBack from "@/hooks/useSwipeBack";
import AppLockGate from "@/components/native/AppLockGate";
import { registerPush } from "@/lib/despia";

export default function AppLayout() {
  useTheme();
  const { user, trader } = useCurrentTrader();
  const unreadMessages = useMessageNotifications(trader?.id);
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const outlet = useOutlet();
  const scrollRef = useRef(null);

  useSwipeBack(scrollRef);

  useEffect(() => {
    registerPush(user?.id);
  }, [user?.id]);

  return (
    <AppLockGate>
      <div className="relative flex h-full flex-col overflow-hidden bg-background">
        <AppHeader />

        <div
          id="app-scroll"
          ref={scrollRef}
          className="app-scroll"
          style={{
            paddingTop: "calc(var(--safe-top) + var(--header-h) + 1rem)",
            paddingBottom: "calc(var(--safe-bottom) + var(--tabbar-h) + 1.5rem)",
            paddingLeft: "var(--safe-left)",
            paddingRight: "var(--safe-right)",
          }}
        >
          <main className="mx-auto max-w-6xl">
            <AnimatePresence mode="popLayout" initial={false}>
              <PageTransition key={pathname} direction={navigationType === "POP" ? -1 : 1}>
                {outlet}
              </PageTransition>
            </AnimatePresence>
          </main>
        </div>

        <BottomNav badge={unreadMessages} />
      </div>
    </AppLockGate>
  );
}