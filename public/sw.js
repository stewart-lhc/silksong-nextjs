// Enhanced Service Worker for Silksong Release Tracker
// Optimized for performance, caching, and compression support

const CACHE_VERSION = '2.0.0';
const CACHE_NAME = `silksong-tracker-v${CACHE_VERSION}`;
const STATIC_CACHE = `silksong-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `silksong-dynamic-v${CACHE_VERSION}`;
const IMAGE_CACHE = `silksong-images-v${CACHE_VERSION}`;
const FONT_CACHE = `silksong-fonts-v${CACHE_VERSION}`;

// Critical assets to cache immediately (above-the-fold content)
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

// Assets to cache on first request
const DYNAMIC_ASSETS = [
  '/timeline',
  '/checklist', 
  '/platforms',
  '/faq',
];

// Enhanced cache strategies with compression support
const CACHE_STRATEGIES = {
  // Images: Cache first with long-term storage
  images: {
    pattern: /\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i,
    strategy: 'cacheFirst',
    cacheName: IMAGE_CACHE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 100,
  },
  // Fonts: Cache first with very long-term storage
  fonts: {
    pattern: /\.(woff|woff2|ttf|eot)$/i,
    strategy: 'cacheFirst',
    cacheName: FONT_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 20,
  },
  // API: Network first with short-term fallback
  api: {
    pattern: /\/api\//,
    strategy: 'networkFirst',
    cacheName: DYNAMIC_CACHE,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50,
  },
  // Static assets: Cache first with update check
  static: {
    pattern: /\.(js|css|html)$/,
    strategy: 'cacheFirstWithUpdate',
    cacheName: STATIC_CACHE,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    maxEntries: 200,
  },
  // Compressed assets: Prefer compressed versions
  compressed: {
    patterns: {
      gzip: /\.(js|css|html|json|xml|txt)\.gz$/i,
      brotli: /\.(js|css|html|json|xml|txt)\.br$/i,
    }
  }
};

// Install event - cache critical assets with compression awareness
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing v${CACHE_VERSION}...`);
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(async (cache) => {
        console.log('[SW] Caching critical assets');
        
        // Cache critical assets with compression preference
        const cachePromises = CRITICAL_ASSETS.map(async (asset) => {
          try {
            // Try to cache compressed versions first if available
            const compressedAssets = [
              `${asset}.br`,
              `${asset}.gz`,
              asset
            ];
            
            for (const compressedAsset of compressedAssets) {
              try {
                const response = await fetch(compressedAsset);
                if (response.ok) {
                  await cache.put(asset, response);
                  console.log(`[SW] Cached ${compressedAsset} for ${asset}`);
                  break;
                }
              } catch (e) {
                // Try next compression format
                continue;
              }
            }
          } catch (error) {
            console.warn(`[SW] Failed to cache ${asset}:`, error);
          }
        });
        
        return Promise.all(cachePromises);
      }),
      
      // Initialize other cache stores
      caches.open(DYNAMIC_CACHE),
      caches.open(IMAGE_CACHE),
      caches.open(FONT_CACHE),
      
      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches and setup cache limits
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating v${CACHE_VERSION}...`);
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName.includes('silksong') && 
              !cacheName.includes(CACHE_VERSION)
            )
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Setup cache size limits
      setupCacheLimits(),
      
      // Take control of all clients
      self.clients.claim(),
    ])
  );
});

// Setup cache size and age limits
async function setupCacheLimits() {
  const cacheConfigs = [
    { name: IMAGE_CACHE, maxEntries: 100, maxAge: 7 * 24 * 60 * 60 * 1000 },
    { name: FONT_CACHE, maxEntries: 20, maxAge: 30 * 24 * 60 * 60 * 1000 },
    { name: DYNAMIC_CACHE, maxEntries: 50, maxAge: 5 * 60 * 1000 },
    { name: STATIC_CACHE, maxEntries: 200, maxAge: 24 * 60 * 60 * 1000 },
  ];

  for (const config of cacheConfigs) {
    try {
      await limitCacheSize(config.name, config.maxEntries);
      await limitCacheAge(config.name, config.maxAge);
    } catch (error) {
      console.error(`[SW] Failed to setup limits for ${config.name}:`, error);
    }
  }
}

// Limit cache by number of entries
async function limitCacheSize(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxEntries) {
    console.log(`[SW] Cleaning ${cacheName}: ${keys.length}/${maxEntries} entries`);
    const keysToDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
  }
}

// Limit cache by age
async function limitCacheAge(cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const now = Date.now();
  
  const deletePromises = keys.map(async (request) => {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      const cacheTime = dateHeader ? new Date(dateHeader).getTime() : now;
      
      if (now - cacheTime > maxAge) {
        console.log(`[SW] Removing expired entry from ${cacheName}:`, request.url);
        return cache.delete(request);
      }
    }
  });
  
  await Promise.all(deletePromises);
}

// Enhanced fetch event with compression and intelligent caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension, data, and other non-HTTP protocols
  if (!url.protocol.startsWith('http')) return;

  // Skip requests with no-cache headers
  if (request.headers.get('cache-control') === 'no-cache') return;

  event.respondWith(handleEnhancedRequest(request));
});

// Enhanced request handler with compression and intelligent caching
async function handleEnhancedRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Determine cache strategy based on resource type
    const strategy = getCacheStrategy(pathname);
    
    if (!strategy) {
      return await fetch(request);
    }

    // Try compressed version first for supported resources
    const compressedResponse = await tryCompressedVersion(request, strategy);
    if (compressedResponse) {
      return compressedResponse;
    }

    // Use appropriate caching strategy
    switch (strategy.strategy) {
      case 'cacheFirst':
        return await cacheFirst(request, strategy.cacheName);
      
      case 'networkFirst':
        return await networkFirst(request, strategy.cacheName);
      
      case 'cacheFirstWithUpdate':
        return await cacheFirstWithUpdate(request, strategy.cacheName);
      
      default:
        return await networkFirst(request, DYNAMIC_CACHE);
    }

  } catch (error) {
    console.error('[SW] Request failed:', error);
    
    return await handleOfflineError(request);
  }
}

// Get cache strategy for a given pathname
function getCacheStrategy(pathname) {
  for (const [key, strategy] of Object.entries(CACHE_STRATEGIES)) {
    if (key !== 'compressed' && strategy.pattern && strategy.pattern.test(pathname)) {
      return strategy;
    }
  }
  
  // Default strategy for pages
  if (pathname === '/' || DYNAMIC_ASSETS.includes(pathname)) {
    return {
      strategy: 'networkFirst',
      cacheName: DYNAMIC_CACHE,
      maxAge: 5 * 60 * 1000,
    };
  }
  
  return null;
}

// Try to fetch compressed version of resource
async function tryCompressedVersion(request, strategy) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Only try compression for appropriate file types
  if (!pathname.match(/\.(js|css|html|json|xml|txt)$/i)) {
    return null;
  }
  
  // Check if browser supports compression
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  const supportsBrotli = acceptEncoding.includes('br');
  const supportsGzip = acceptEncoding.includes('gzip');
  
  if (!supportsBrotli && !supportsGzip) {
    return null;
  }
  
  // Try compressed versions in order of preference
  const compressedVersions = [];
  
  if (supportsBrotli) {
    compressedVersions.push({
      url: `${request.url}.br`,
      encoding: 'br',
      type: 'brotli'
    });
  }
  
  if (supportsGzip) {
    compressedVersions.push({
      url: `${request.url}.gz`,
      encoding: 'gzip',
      type: 'gzip'
    });
  }
  
  for (const compressed of compressedVersions) {
    try {
      const cache = await caches.open(strategy.cacheName);
      let response = await cache.match(compressed.url);
      
      if (!response) {
        response = await fetch(compressed.url);
        if (response.ok) {
          // Add compression headers
          const headers = new Headers(response.headers);
          headers.set('content-encoding', compressed.encoding);
          headers.set('cache-control', 'max-age=31536000'); // 1 year for compressed assets
          
          const compressedResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers,
          });
          
          // Cache the compressed response
          await cache.put(request, compressedResponse.clone());
          return compressedResponse;
        }
      } else {
        console.log(`[SW] Using cached compressed version: ${compressed.type}`);
        return response;
      }
    } catch (error) {
      console.warn(`[SW] Failed to fetch compressed version ${compressed.type}:`, error);
      continue;
    }
  }
  
  return null;
}

// Handle offline errors with fallbacks
async function handleOfflineError(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Try to return cached version
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('[SW] Returning cached fallback for:', pathname);
    return cachedResponse;
  }
  
  // Return appropriate offline fallback based on request type
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
    return new Response('', {
      status: 503,
      statusText: 'Image unavailable offline',
    });
  }
  
  if (pathname.match(/\.(js|css)$/i)) {
    return new Response('/* Resource unavailable offline */', {
      status: 503,
      statusText: 'Resource unavailable',
      headers: new Headers({
        'Content-Type': pathname.endsWith('.js') ? 'application/javascript' : 'text/css',
      }),
    });
  }
  
  // Default offline page
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Offline - Silksong Tracker</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: #fff;
          }
          .offline-message {
            text-align: center;
            padding: 2rem;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
          }
        </style>
      </head>
      <body>
        <div class="offline-message">
          <h1>🌐 You're offline</h1>
          <p>Please check your internet connection and try again.</p>
          <p><strong>Silksong Tracker</strong> requires an internet connection.</p>
        </div>
      </body>
    </html>
  `, {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/html',
    }),
  });
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache first with background update
async function cacheFirstWithUpdate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Background update
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Ignore network errors for background updates
  });

  if (cachedResponse) {
    return cachedResponse;
  }

  return await fetchPromise;
}

// Enhanced message handler for cache management and compression
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    
    case 'CACHE_URLS':
      cacheUrls(payload.urls).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    
    case 'GET_CACHE_STATS':
      getCacheStats().then((stats) => {
        event.ports[0].postMessage({ success: true, data: stats });
      });
      break;
      
    case 'PRELOAD_CRITICAL':
      preloadCriticalResources().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Get cache statistics
async function getCacheStats() {
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, FONT_CACHE];
  const stats = {};
  
  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      stats[cacheName] = {
        entries: keys.length,
        urls: keys.map(req => req.url)
      };
    } catch (error) {
      stats[cacheName] = { entries: 0, error: error.message };
    }
  }
  
  return stats;
}

// Preload critical resources on demand
async function preloadCriticalResources() {
  const cache = await caches.open(STATIC_CACHE);
  
  const preloadPromises = CRITICAL_ASSETS.map(async (asset) => {
    try {
      if (!await cache.match(asset)) {
        const response = await fetch(asset);
        if (response.ok) {
          await cache.put(asset, response);
        }
      }
    } catch (error) {
      console.warn(`[SW] Failed to preload ${asset}:`, error);
    }
  });
  
  await Promise.all(preloadPromises);
  console.log('[SW] Critical resources preloaded');
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((cacheName) => caches.delete(cacheName))
  );
  console.log('[SW] All caches cleared');
}

// Cache specific URLs
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  await Promise.all(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.error('[SW] Failed to cache URL:', url, error);
      }
    })
  );
  console.log('[SW] URLs cached:', urls.length);
}

// Periodic cache cleanup (run on activation)
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, CACHE_NAME];
  
  await Promise.all(
    cacheNames
      .filter((name) => !validCaches.includes(name))
      .map((name) => caches.delete(name))
  );
}