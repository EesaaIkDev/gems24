import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";

const isDespia = () =>
  navigator.userAgent.toLowerCase().includes("despia") || typeof window.despia !== "undefined";

function guestId() {
  let id = localStorage.getItem("guest_onesignal_id");
  if (!id) {
    id = "guest_" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("guest_onesignal_id", id);
  }
  return id;
}

// Mounted once above the router, so page navigation never re-triggers it.
export default function PushInit() {
  const { user: currentUser, isLoadingAuth } = useAuth();
  const lastId = useRef(null);

  // 1. Ask for native push permission once on launch.
  useEffect(() => {
    if (isDespia()) window.location.href = "checkNativePushPermissions://";
  }, []);

  // 2–3. Register once auth is resolved, and again only if the id changes (login/logout).
  const userId = currentUser ? currentUser.id || currentUser.email : null;
  useEffect(() => {
    if (!isDespia() || isLoadingAuth) return;
    const id = userId || guestId();
    if (lastId.current === id) return;
    // Short delay so it doesn't cancel the permission request navigation.
    const t = setTimeout(() => {
      lastId.current = id;
      window.location.href = "setonesignalplayerid://?user_id=" + encodeURIComponent(id);
    }, 800);
    return () => clearTimeout(t);
  }, [userId, isLoadingAuth]);

  return null;
}