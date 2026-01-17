// Training Platform PWA Service Worker (Vite + React)
// Goals: aggressive immutable caches, offline navigation, SW auto-update,
// versioned caches, stale-while-revalidate, exclude Supabase, avoid non-GET.

const CACHE_PREFIX = 'tp-pwa';
const CACHE_VERSION = 'v3';
const STATIC_CACHE = `${CACHE_PREFIX}-static-${CACHE_VERSION}`; // images, fonts, manifest
const IMMUTABLE_CACHE = `${CACHE_PREFIX}-immutable-${CACHE_VERSION}`; // hashed build assets
const NAV_CACHE = `${CACHE_PREFIX}-nav-${CACHE_VERSION}`; // index.html fallback for SPA
const CORE_CACHE = `${CACHE_PREFIX}-core-${CACHE_VERSION}`; // core assets

// Respect Vite base and GitHub Pages scope, e.g. /training-platform/
const APP_BASE = self.registration.scope;

// Core assets to pre-cache for offline navigation
const CORE_ASSETS = [
  APP_BASE,
  APP_BASE + 'index.html',
  APP_BASE + 'manifest.webmanifest',
  // App icons (static, safe to pre-cache)
  APP_BASE + 'icons/icon-192.png',
  APP_BASE + 'icons/icon-512.png',
];

// Helpers
const isMethodCacheable = (req) => req.method === 'GET';
const toURL = (req) => (typeof req === 'string' ? new URL(req, self.location.href) : new URL(req.url));
const isSameOrigin = (url) => url.origin === self.location.origin;
const isSupabase = (url) => /\.supabase\.(co|com)/.test(url.host);
const isNavigate = (req) => req.mode === 'navigate';
const isHTMLRequest = (req) => req.headers.get('accept')?.includes('text/html');

// Vite builds hashed assets under /assets/ with content hashing. Treat as immutable.
const isImmutableAsset = (url) => {
  if (!isSameOrigin(url)) return false;
  // Match /assets/file.[hash].js|css|png|svg|... (8+ hex chars typical)
  return /\/assets\/.*\.[a-f0-9]{8,}\.[^/]+$/.test(url.pathname);
};

// Static assets we want SWR (icons, images in public, fonts)
const isStaticAsset = (url) => {
  if (!isSameOrigin(url)) return false;
  if (isImmutableAsset(url)) return false;
  return (
    /\.(png|jpg|jpeg|gif|webp|svg|ico|bmp|ttf|otf|woff2?|mp3|mp4)$/i.test(url.pathname) ||
    url.pathname.endsWith('/manifest.webmanifest')
  );
};

// Install: pre-cache core assets and activate immediately
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    (async () => {
      try {
        const coreCache = await caches.open(CORE_CACHE);
        await coreCache.addAll(CORE_ASSETS);
        console.log('[SW] Core assets cached');
      } catch (err) {
        console.error('[SW] Install failed:', err);
        // Continue even if caching fails (important for iOS)
      }
    })()
  );
  self.skipWaiting();
});

// Activate: clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    (async () => {
      try {
        const expectedPrefixes = new Set([
          STATIC_CACHE,
          IMMUTABLE_CACHE,
          NAV_CACHE,
        ]);
        const keys = await caches.keys();
        await Promise.all(
          keys.map((key) => {
            if (!expectedPrefixes.has(key) && key.startsWith(CACHE_PREFIX)) {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            }
          })
        );
        console.log('[SW] Activated');
      } catch (err) {
        console.error('[SW] Activate failed:', err);
      }
      await self.clients.claim();
    })()
  );
});

// Fetch strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isMethodCacheable(request)) return; // Only cache GET

  const url = toURL(request);

  // Never interfere with Supabase requests
  if (isSupabase(url)) return;

  // Navigation requests: network-first with SHORT timeout, fallback to cached index.html
  if (isNavigate(request) || (isSameOrigin(url) && isHTMLRequest(request))) {
    event.respondWith(handleNavigateWithFallback(request));
    return;
  }

  // Immutable build assets: cache-first
  if (isImmutableAsset(url)) {
    event.respondWith(cacheFirst(IMMUTABLE_CACHE, request));
    return;
  }

  // Static assets (icons, images, fonts, manifest): stale-while-revalidate
  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(STATIC_CACHE, request));
    return;
  }

  // Same-origin generic GET: stale-while-revalidate
  if (isSameOrigin(url)) {
    event.respondWith(staleWhileRevalidate(STATIC_CACHE, request));
    return;
  }
  // Cross-origin GETs: bypass (avoid caching APIs/CDNs unless immutable pattern)
});

// Fetch with timeout to avoid hanging
function fetchWithTimeout(request, timeout = 3000) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ]);
}

// New strategy: Try network FIRST with short timeout, then cache, then longer network
async function handleNavigateWithFallback(request) {
  console.log('[SW] Navigate:', request.url);

  // First attempt: quick network request (1 second timeout)
  try {
    const networkResp = await fetchWithTimeout(request, 1000);
    console.log('[SW] Network response OK (fast)');

    // Cache for future use
    if (networkResp.ok) {
      const clone = networkResp.clone();
      const coreCache = await caches.open(CORE_CACHE);
      await coreCache.put(APP_BASE + 'index.html', clone).catch(() => {});
    }
    return networkResp;
  } catch (quickErr) {
    console.log('[SW] Quick network failed:', quickErr.message);
  }

  // Second attempt: try cache immediately
  const cached = await findCachedHTML();
  if (cached) {
    console.log('[SW] Returning cached HTML');
    // Try to update cache in background
    fetch(request).then(async (resp) => {
      if (resp.ok) {
        const coreCache = await caches.open(CORE_CACHE);
        await coreCache.put(APP_BASE + 'index.html', resp.clone()).catch(() => {});
      }
    }).catch(() => {});
    return cached;
  }

  // Third attempt: wait longer for network (5 seconds)
  try {
    console.log('[SW] Trying longer network request...');
    const networkResp = await fetchWithTimeout(request, 5000);
    console.log('[SW] Network response OK (slow)');
    return networkResp;
  } catch (err) {
    console.error('[SW] All attempts failed:', err.message);
    return new Response('<h1>Cannot connect</h1><p>Please check your internet connection</p>', {
      headers: { 'Content-Type': 'text/html' },
      status: 503,
    });
  }
}

// Helper to find cached HTML from any cache
async function findCachedHTML() {
  // Try multiple possible paths
  let cached = await caches.match(APP_BASE + 'index.html');
  if (cached) return cached;

  cached = await caches.match('/index.html');
  if (cached) return cached;

  cached = await caches.match(new URL('index.html', self.location.origin).href);
  if (cached) return cached;

  // Search all caches
  const cacheNames = await caches.keys();
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    for (const key of keys) {
      if (key.url.includes('index.html')) {
        return cache.match(key);
      }
    }
  }

  return null;
}

// OLD function kept for reference but not used
async function handleNavigate(request) {
  console.log('[SW] Navigate:', request.url);

  try {
    const networkResp = await fetchWithTimeout(request, 3000);
    console.log('[SW] Network response OK');
    // Optionally refresh NAV_CACHE copy of index.html for future offline
    const clone = networkResp.clone();
    if (clone.ok) {
      const navCache = await caches.open(NAV_CACHE);
      await navCache.put(APP_BASE + 'index.html', clone);
    }
    return networkResp;
  } catch (err) {
    console.log('[SW] Network failed, trying cache:', err.message);
    // Offline fallback to cached index.html
    // Try multiple possible paths
    let cached = await caches.match(APP_BASE + 'index.html');
    if (cached) {
      console.log('[SW] Returning cached index.html (with base)');
      return cached;
    }

    cached = await caches.match('/index.html');
    if (cached) {
      console.log('[SW] Returning cached /index.html');
      return cached;
    }

    cached = await caches.match(new URL('index.html', self.location.origin).href);
    if (cached) {
      console.log('[SW] Returning cached index.html (origin)');
      return cached;
    }

    // As a last resort, try any cached navigation response
    console.log('[SW] Searching any cached HTML...');
    const navCache = await caches.open(NAV_CACHE);
    const keys = await navCache.keys();
    if (keys.length) {
      console.log('[SW] Found cached nav, using first:', keys[0].url);
      return navCache.match(keys[0]);
    }

    // Try CORE_CACHE as well
    const coreCache = await caches.open(CORE_CACHE);
    const coreKeys = await coreCache.keys();
    const htmlKey = coreKeys.find(k => k.url.includes('index.html'));
    if (htmlKey) {
      console.log('[SW] Found in core cache:', htmlKey.url);
      return coreCache.match(htmlKey);
    }

    console.error('[SW] No cached content available, returning offline page');
    return new Response('<h1>Offline</h1><p>Please check your connection</p>', {
      headers: { 'Content-Type': 'text/html' },
      status: 503,
    });
  }
}

function shouldCacheResponse(response) {
  // Cache only successful or opaque responses
  return response && (response.status === 200 || response.type === 'opaqueredirect' || response.type === 'opaque');
}

async function cacheFirst(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const resp = await fetch(request);
  if (shouldCacheResponse(resp)) await cache.put(request, resp.clone());
  return resp;
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cachedPromise = cache.match(request);
  const networkPromise = fetch(request)
    .then(async (resp) => {
      if (shouldCacheResponse(resp)) await cache.put(request, resp.clone());
      return resp;
    })
    .catch(() => undefined);

  const cached = await cachedPromise;
  return cached || (await networkPromise) || fetch(request);
}
