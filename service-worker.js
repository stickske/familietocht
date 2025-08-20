const CACHE_DATA = 'geo-photo-cache-v1';
const FILES_TO_CACHE = [
  'index.html',
  'pois.json',
  'ding.mp3',
  'start.mp3',
  'manifest.json'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_DATA);

      // Basisbestanden
      await cache.addAll(FILES_TO_CACHE);

      // POI-afbeeldingen dynamisch toevoegen
      try {
        const response = await fetch('pois.json');
        const pois = await response.json();

        for (const poi of pois) {
          const imgUrl = 'img/' + poi.name + ".jpg";
          try {
            await cache.add(imgUrl);
          } catch (err) {
            console.warn('Kon afbeelding niet cachen:', imgUrl, err);
          }
        }
      } catch (err) {
        console.warn('Kon POI-afbeeldingen niet ophalen:', err);
      }
    })()
  );

  self.skipWaiting();
});


self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if(key !== CACHE_DATA) return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request))
  );
});
