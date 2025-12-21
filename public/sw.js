
const CACHE_NAME = 'lapaas-mindset-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/logo.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch((err) => console.log('Cache install failed', err))
  );
});

// Activate Event - cleanup old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event - Cache First, then Network (for assets)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Notification Click Event - redirects to specific page if URL is provided
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Get the URL from notification data (if provided)
  const notificationData = event.notification.data;
  const targetUrl = notificationData && notificationData.url ? notificationData.url : '/home';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, navigate it to the target URL and focus
      if (clientList.length > 0) {
        let client = clientList[0];
        // Prefer looking for a focused client or just take the first one
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        // Navigate to the target URL
        client.navigate(targetUrl);
        return client.focus();
      }
      // If no window is open, open a new one with the target URL
      return clients.openWindow(targetUrl);
    })
  );
});