import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Fingerprint, Smartphone } from "lucide-react";
import {
  isNative,
  isAppLockEnabled,
  enableAppLock,
  disableAppLock,
  getAppVersion,
} from "@/lib/despia";

export default function NativeSettings() {
  const [lock, setLock] = useState(isAppLockEnabled());
  const [version, setVersion] = useState(null);

  useEffect(() => {
    getAppVersion().then((v) => v && setVersion(`${v.versionNumber} (${v.bundleNumber})`));
  }, []);

  if (!isNative) return null;

  const toggle = async (next) => {
    if (next) await enableAppLock();
    else await disableAppLock();
    setLock(next);
  };

  return (
    <div className="rounded-2xl bg-card border border-border divide-y divide-border">
      <div className="p-4 flex items-center gap-3">
        <Fingerprint className="w-[18px] h-[18px] text-primary" />
        <div className="flex-1">
          <p className="text-sm font-medium">Biometric app lock</p>
          <p className="text-xs text-muted-foreground">Require Face ID or fingerprint to open Gems24.</p>
        </div>
        <Switch checked={lock} onCheckedChange={toggle} />
      </div>
      {version && (
        <div className="p-4 flex items-center gap-3">
          <Smartphone className="w-[18px] h-[18px] text-muted-foreground" />
          <p className="text-sm font-medium flex-1">App version</p>
          <p className="text-sm text-muted-foreground">{version}</p>
        </div>
      )}
    </div>
  );
}