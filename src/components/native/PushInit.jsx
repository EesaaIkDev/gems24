import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { registerPush, registerGuestPush, requestPushPermission } from "@/lib/despia";

// App-wide: asks for push permission on launch, links guests with an
// anonymous id, then the signed-in user. No-op in a normal web browser.
export default function PushInit() {
  const { user, isLoadingAuth } = useAuth();

  useEffect(() => {
    requestPushPermission();
  }, []);

  useEffect(() => {
    if (isLoadingAuth || user) return;
    const t = setTimeout(() => registerGuestPush(), 800);
    return () => clearTimeout(t);
  }, [isLoadingAuth, user]);

  useEffect(() => {
    const id = user?.id || user?.email;
    if (!id) return;
    // Small delay so the permission call isn't overridden by this navigation.
    const t = setTimeout(() => registerPush(id), 800);
    return () => clearTimeout(t);
  }, [user?.id, user?.email]);

  return null;
}