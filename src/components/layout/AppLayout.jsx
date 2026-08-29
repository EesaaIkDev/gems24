import React, { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigationType, useOutlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";
import PageTransition from "./PageTransition";
import useTheme from "@/hooks/useTheme";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import useMessageNotifications from "@/hooks/useMessageNotifications";
import useSwipeBack from "@/hooks/useSwipeBack";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import PullIndicator from "./PullIndicator";
import { queryClientInstance } from "@/lib/query-client";
import AppLockGate from "@/components/native/AppLockGate";
import { registerPush } from "@/lib/despia";
import OfflineBanner from "@/components/common/OfflineBanner";
import { setSyncErrorHandler } from "@/lib/offlineSync";
import { useToast } from "@/components/ui/use-toast";

export default function AppLayout() {
  useTheme();
  const { user, trader } = useCurrentTrader();
  const unreadMessages = useMessageNotifications(trader?.id);
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const outlet = useOutlet();
  const scrollRef = useRef(null);

  useSwipeBack(scrollRef);
  const { toast } = useToast();

  // Pull down at the top of any page to refetch everything on screen.
  const refreshApp = useCallback(async () => {
    window.dispatchEvent(new Event("app:refresh"));
    await queryClientInstance.invalidateQueries();
    await new Promise((r) => setTimeout(r, 600));
  }, []);
  const { pull, progress, refreshing } = usePullToRefresh(scrollRef, refreshApp);

  useEffect(() => {
    setSyncErrorHandler(() =>
      toast({
        title: "A change couldn't be saved",
        description: "It was undone — please try again.",
        variant: "destructive",
      })
    );
    return () => setSyncErrorHandler(null);
  }, [toast]);

  useEffect(() => {
    registerPush(user?.id);
  }, [user?.id]);

  return (
    <AppLockGate>
      <div className="relative flex h-full flex-col overflow-hidden bg-background">
        <AppHeader />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-40">
          <OfflineBanner />
        </div>

        <PullIndicator pull={pull} progress={progress} refreshing={refreshing} />

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