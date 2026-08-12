/* Service worker registration for the Despia native shell / PWA.
   Never registers inside the Base44 editor preview (iframe) — and cleans up
   any worker that a previous session left behind there. */

const inEditorPreview = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

export default function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  if (inEditorPreview()) {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});
    return;
  }

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // A new worker took over — reload so the fresh build is what runs.
    window.location.reload();
  });

  navigator.serviceWorker
    .register("/sw.js", { scope: "/", updateViaCache: "none" })
    .then((registration) => {
      const check = () => registration.update().catch(() => {});
      check();
      window.addEventListener("focus", check);
      window.addEventListener("online", check);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") check();
      });
    })
    .catch(() => {});
}