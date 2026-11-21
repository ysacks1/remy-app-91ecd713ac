/* Remy's Music Room — offline-first cache plus web push */
const CACHE = "remy-music-room-v4";
const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/config.js",
  "./js/vendor/supabase.js",
  "./js/storage.js",
  "./js/audio.js",
  "./js/hum.js",
  "./js/auth.js",
  "./js/sync.js",
  "./js/push.js",
  "./js/customize.js",
  "./js/app.js",
  "./manifest.json",
  "./icons/favicon.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "Remy's Music Room", body: "Something new for Remy", tag: "family" };
  try {
    if (event.data) data = Object.assign(data, event.data.json());
  } catch { /* ignore */ }
  event.waitUntil(
    self.registration.showNotification(data.title || "Remy's Music Room", {
      body: data.body || "Something new for Remy",
      tag: data.tag || "family",
      icon: "./icons/icon-192.png",
      badge: "./icons/icon-192.png",
      data
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if ("focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
