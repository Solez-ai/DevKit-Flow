// DevKit Flow Service Worker
// Provides offline functionality and intelligent caching

const CACHE_NAME = 'devkit-flow-v1.0.0';
const STATIC_CACHE = 'devkit-flow-static-v1.0.0';
const DYNAMIC_CACHE = 'devkit-flow-dynamic-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Logo.png',
  '/favicon.ico',
  // Add other static assets as needed
];

// Resources to cache on first access
const DYNAMIC_ASSETS = [
  '/api/',
  '/fonts/',
  '/images/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request.url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request.url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleDynamicAsset(request));
  }
});

// Check if request is for a static asset
function isStaticAsset(url) {
  return url.includes('/static/') || 
         url.includes('/assets/') ||
         url.endsWith('.js') ||
         url.endsWith('.css') ||
         url.endsWith('.png') ||
         url.endsWith('.jpg') ||
         url.endsWith('.svg') ||
         url.endsWith('.woff') ||
         url.endsWith('.woff2');
}

// Check if request is for API
function isAPIRequest(url) {
  return url.includes('/api/');
}

// Check if request is navigation
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// Handle static assets - cache first strategy
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Failed to handle static asset', error);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle API requests - network first with cache fallback
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for API request');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Add header to indicate this is from cache
      const response = cachedResponse.clone();
      response.headers.set('X-Served-By', 'ServiceWorker');
      return response;
    }
    
    // Return offline response for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This feature requires an internet connection'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle navigation requests - serve app shell
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Serving app shell for navigation');
    
    const cachedResponse = await caches.match('/index.html');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('App not available offline', { status: 503 });
  }
}

// Handle dynamic assets - stale while revalidate
async function handleDynamicAsset(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse;
  });
  
  // Return cached version immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync-sessions') {
    event.waitUntil(syncSessions());
  } else if (event.tag === 'background-sync-patterns') {
    event.waitUntil(syncPatterns());
  }
});

// Sync sessions when back online
async function syncSessions() {
  try {
    console.log('Service Worker: Syncing sessions...');
    
    // Get pending sessions from IndexedDB
    const pendingSessions = await getPendingSessions();
    
    for (const session of pendingSessions) {
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session)
        });
        
        if (response.ok) {
          await removePendingSession(session.id);
          console.log('Service Worker: Session synced', session.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync session', session.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Sync patterns when back online
async function syncPatterns() {
  try {
    console.log('Service Worker: Syncing patterns...');
    
    // Similar implementation for patterns
    const pendingPatterns = await getPendingPatterns();
    
    for (const pattern of pendingPatterns) {
      try {
        const response = await fetch('/api/patterns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pattern)
        });
        
        if (response.ok) {
          await removePendingPattern(pattern.id);
          console.log('Service Worker: Pattern synced', pattern.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync pattern', pattern.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Pattern sync failed', error);
  }
}

// IndexedDB helpers (simplified - would need full implementation)
async function getPendingSessions() {
  // Implementation would use IndexedDB to get pending sessions
  return [];
}

async function removePendingSession(sessionId) {
  // Implementation would remove session from IndexedDB
  console.log('Removing pending session:', sessionId);
}

async function getPendingPatterns() {
  // Implementation would use IndexedDB to get pending patterns
  return [];
}

async function removePendingPattern(patternId) {
  // Implementation would remove pattern from IndexedDB
  console.log('Removing pending pattern:', patternId);
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/Logo.png',
    badge: '/Logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('DevKit Flow', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  } else if (event.data && event.data.type === 'C