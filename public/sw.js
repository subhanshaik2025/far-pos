const CACHE = "farpos-v1784967778955"; // unique per build
const ASSETS = ["/", "/index.html", "/manifest.json", "/logo.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting(); // activate immediately, don't wait
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // take control of all open tabs
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.url.includes("google") || e.request.url.includes("script.google")) return;

  // NETWORK-FIRST: always get fresh version, cache as backup
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});

// Listen for skip message from client
self.addEventListener("message", e => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});
