import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";
import useTheme from "@/hooks/useTheme";
import useCurrentTrader from "@/hooks/useCurrentTrader";
import AppLockGate from "@/components/native/AppLockGate";
import { registerPush } from "@/lib/despia";

export default function AppLayout() {
  useTheme();
  const { user, trader } = useCurrentTrader();
  const [newEnquiries, setNewEnquiries] = useState(0);

  useEffect(() => {
    if (!trader?.id) return setNewEnquiries(0);
    base44.entities.Enquiry.filter({ owner_trader_id: trader.id, status: "new" }).then((rows) =>
      setNewEnquiries(rows.length)
    );
  }, [trader?.id]);

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
        <BottomNav badge={newEnquiries} />
      </div>
    </AppLockGate>
  );
}