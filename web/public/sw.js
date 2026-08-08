const { cache: CACHE, shell: SHELL } = self.GESTIO_BUILD ?? { cache: "gestio-shell-dev", shell: ["/"] };

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== location.origin || url.search || !["document", "script", "style"].includes(event.request.destination)) return;
  event.respondWith(
    fetch(event.request)
      .then(async response => {
        if (response.ok) await (await caches.open(CACHE)).put(event.request, response.clone());
        return response;
      })
      .catch(async () => await caches.match(event.request)
        ?? (event.request.destination === "document" ? await caches.match("/") : undefined)
        ?? new Response("Gestio n’est pas encore disponible hors connexion. Ouvrez l’application une fois en ligne.", { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } }))
  );
});
