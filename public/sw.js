/* Gems24 service worker — always fresh online, cache only as offline fallback.
   Bump CACHE on every release: activate deletes every other cache. */
const CACHE = "gems24-v1";
const SHELL = "/";
const OFFLINE_URL = "/offline.html";
const DOC_TIMEOUT = 3000;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([SHELL, OFFLINE_URL]))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

const isHashedAsset = (url) => url.pathname.startsWith("/assets/");

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

/* Network-first with a hard timeout. Documents are fetched with no-store so no
   browser or CDN copy can shadow a new build. */
async function networkFirst(request, { isDocument, preloadResponse }) {
  const cache = await caches.open(CACHE);
  const cacheKey = isDocument ? new Request(request.url, { headers: request.headers }) : request;

  try {
    const network = preloadResponse
      ? await preloadResponse
      : await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("timeout")), DOC_TIMEOUT);
          fetch(isDocument ? new Request(request, { cache: "no-store" }) : request)
            .then((res) => {
              clearTimeout(timer);
              resolve(res);
            })
            .catch((err) => {
              clearTimeout(timer);
              reject(err);
            });
        });
    if (network && network.ok) cache.put(cacheKey, network.clone());
    if (network) return network;
    throw new Error("no response");
  } catch {
    const hit = (await cache.match(cacheKey)) || (await cache.match(request));
    if (hit) return hit;
    if (isDocument) {
      return (await cache.match(SHELL)) || (await cache.match(OFFLINE_URL)) || Response.error();
    }
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isHashedAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  const isDocument = request.mode === "navigate" || request.destination === "document";
  event.respondWith(
    networkFirst(request, { isDocument, preloadResponse: isDocument ? event.preloadResponse : null })
  );
});
