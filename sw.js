// Caché sin conexión: la app abre desde el teléfono aunque no haya señal y se actualiza en segundo plano.
const CACHE = 'parcelas-2026-10-23.2';
const BASE = ['./', 'index.html', 'jszip.min.js', 'manifest.webmanifest', 'icono-192.png', 'icono-512.png', 'icono-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const propio = url.origin === location.origin, fuentes = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!propio && !fuentes) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const clave = req.mode === 'navigate' ? 'index.html' : req;
    const guardada = await c.match(clave, { ignoreSearch: true });
    const red = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(clave, r.clone()); return r; }).catch(() => null);
    if (guardada) { e.waitUntil(red); return guardada; }
    return (await red) || new Response('Sin conexión', { status: 503 });
  }));
});
