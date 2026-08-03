const cacheName = "gestio-shell";

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== location.origin || url.search || !["document", "script", "style"].includes(event.request.destination)) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) caches.open(cacheName).then(cache => cache.put(event.request, response.clone()));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
