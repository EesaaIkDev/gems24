import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { registerPush, requestPushPermission } from "@/lib/despia";

// App-wide: asks for push permission on launch and links the signed-in user
// to OneSignal. Does nothing in a normal web browser.
export default function PushInit() {
  const { user } = useAuth();

  useEffect(() => {
    requestPushPermission();
  }, []);

  useEffect(() => {
    const id = user?.id || user?.email;
    if (!id) return;
    // Small delay so the permission call isn't overridden by this navigation.
    const t = setTimeout(() => registerPush(id), 800);
    return () => clearTimeout(t);
  }, [user?.id, user?.email]);

  return null;
}