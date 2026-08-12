import React, { useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import useOnline from "@/hooks/useOnline";
import { subscribePending } from "@/lib/offlineSync";

/** Thin status strip: offline mode, or queued changes waiting to sync. */
export default function OfflineBanner() {
  const online = useOnline();
  const [pending, setPending] = useState(0);

  useEffect(() => subscribePending(setPending), []);

  if (online && !pending) return null;

  const offline = !online;
  return (
    <div
      className="flex items-center justify-center gap-2 bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground"
      style={{ paddingTop: "calc(var(--safe-top) + 0.375rem)" }}
      role="status"
    >
      {offline ? <CloudOff className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
      {offline
        ? pending
          ? `Offline — ${pending} change${pending > 1 ? "s" : ""} will sync later`
          : "Offline — showing saved data"
        : `Syncing ${pending} change${pending > 1 ? "s" : ""}…`}
    </div>
  );
}