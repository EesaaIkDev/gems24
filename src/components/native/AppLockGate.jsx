import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Fingerprint } from "lucide-react";
import { isNative, isAppLockEnabled, verifyBiometrics } from "@/lib/despia";

export default function AppLockGate({ children }) {
  const locked = isNative && isAppLockEnabled();
  const [unlocked, setUnlocked] = useState(!locked);
  const [failed, setFailed] = useState(false);

  const unlock = async () => {
    setFailed(false);
    const ok = await verifyBiometrics().catch(() => false);
    if (ok) setUnlocked(true);
    else setFailed(true);
  };

  useEffect(() => {
    if (locked) unlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (unlocked) return children;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
        <Fingerprint className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h1 className="text-lg font-semibold">Gems24 is locked</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {failed ? "Authentication failed. Try again." : "Verify your identity to continue."}
        </p>
      </div>
      <Button className="h-12 px-8" onClick={unlock}>
        Unlock
      </Button>
    </div>
  );
}