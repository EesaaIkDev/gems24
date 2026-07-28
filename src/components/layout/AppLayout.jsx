import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";
import useTheme from "@/hooks/useTheme";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import useMessageNotifications from "@/hooks/useMessageNotifications";
import AppLockGate from "@/components/native/AppLockGate";
import { registerPush } from "@/lib/despia";

export default function AppLayout() {
  useTheme();
  const { user, trader } = useCurrentTrader();
  const unreadMessages = useMessageNotifications(trader?.id);

  useEffect(() => {
    registerPush(user?.id);
  }, [user?.id]);

  return (
    <AppLockGate>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-6xl mx-auto pb-24">
          <Outlet />
        </main>
        <BottomNav badge={unreadMessages} />
      </div>
    </AppLockGate>
  );
}