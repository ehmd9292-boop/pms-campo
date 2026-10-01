// Service worker del PMS Campo: guarda la página, Leaflet y los mapas de fondo visitados para abrir sin conexión.
const CACHE='pms-campo-v1'; const BASE=['./Campo.html','./manifest.json','./icono.svg','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(BASE.map(u=>c.add(u)))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.pathname.includes('/api/'))return;
 const esTile=/tile|arcgisonline|openstreetmap/.test(u.hostname+u.pathname);
 if(u.pathname.endsWith('Campo.html')||u.pathname.endsWith('/')){   // la página: red primero (datos nuevos), si no hay red la copia guardada
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./Campo.html',cp));return r;}).catch(()=>caches.match('./Campo.html')));return;}
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open(CACHE).then(c=>{if(!esTile)c.put(e.request,cp);else c.keys().then(ks=>{if(ks.length<3000)c.put(e.request,cp);});});}return r;}).catch(()=>hit)));});
