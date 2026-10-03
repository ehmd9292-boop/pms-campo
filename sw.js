// Service worker del PMS Campo: la página y Leaflet quedan guardados; los datos (fichas, plan) se piden a la red y, sin red, se usa la copia
// guardada; las miniaturas y los mapas de fondo se guardan al verlos o al descargarlos con "Sin conexión" (tope de teselas para no llenar el celular).
const CACHE='pms-campo-v3'; const BASE=['./Campo.html','./manifest.json','./icono.svg','https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(BASE.map(u=>c.add(u)))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.pathname.includes('/api/'))return;
 const esTile=/tile|arcgisonline|openstreetmap/.test(u.hostname+u.pathname); const esDato=/\/datos\/[^/]+\.json(\.gz)?$/.test(u.pathname); const esPag=u.pathname.endsWith('Campo.html')||u.pathname.endsWith('/');
 if(esPag||esDato){   // red primero (datos nuevos), si no hay red la copia guardada
  const key=esPag?'./Campo.html':e.request;e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(key,cp));}return r;}).catch(()=>caches.match(key)));return;}
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok||r.type==='opaque'){const cp=r.clone();caches.open(CACHE).then(c=>{if(!esTile)c.put(e.request,cp);else c.keys().then(ks=>{if(ks.length<60000)c.put(e.request,cp);});});}return r;}).catch(()=>hit)));});
