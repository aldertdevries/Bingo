/* Bingo Caller service worker — maakt de app volledig offline beschikbaar */
const CACHE = 'bingo-cache-v22';
const ASSETS = [
  './',
  './index.html',
  './lib/jspdf.umd.min.js',
  './lib/qrcode.min.js',
  './lib/html5-qrcode.min.js',
  './fonts/playfair-display-800.woff2',
  './icon-512.png'
];

// Installeer: cache alle kern-assets
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); })
  );
});

// Activeer: ruim oude caches op
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Fetch: cache-first, val terug op netwerk; bewaar nieuwe GET-responses
self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(res){
        if(res && res.status===200 && res.type==='basic'){
          var copy=res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      }).catch(function(){
        // offline en niet in cache: voor navigatie val terug op index.html
        if(e.request.mode==='navigate') return caches.match('./index.html');
      });
    })
  );
});
