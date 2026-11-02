const CACHE = "orion-v1";
const FILES = ["./orion.html", "./orion.webmanifest",
  "./orion-icon-192.png", "./orion-icon-512.png", "./orion-icon-maskable-512.png"];

self.addEventListener("install", e => {
  // Si algún archivo no existe, no rompe la instalación del resto.
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Primero la red (así te llegan las actualizaciones); si no hay internet, usa lo guardado.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./orion.html")))
  );
});
