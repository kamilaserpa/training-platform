// Training Platform PWA Service Worker (Vite + React)
// Goals: aggressive immutable caches, offline navigation, SW auto-update,
// versioned caches, stale-while-revalidate, exclude Supabase, avoid non-GET.

const CACHE_PREFIX = 'tp-pwa';
const CACHE_VERSION = 'v3';
const STATIC_CACHE = `${CACHE_PREFIX}-static-${CACHE_VERSION}`; // images, fonts, manifest
const IMMUTABLE_CACHE = `${CACHE_PREFIX}-immutable-${CACHE_VERSION}`; // hashed build assets
const NAV_CACHE = `${CACHE_PREFIX}-nav-${CACHE_VERSION}`; // index.html fallback for SPA

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
  event.waitUntil(
    (async () => {
      const [navCache, staticCache] = await Promise.all([
        caches.open(NAV_CACHE),
        caches.open(STATIC_CACHE),
      ]);
      await Promise.all([
        navCache.addAll([APP_BASE + 'index.html']),
        staticCache.addAll(CORE_ASSETS),
      ]);
    })()
  );
  self.skipWaiting();
});

// Activate: clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const expectedPrefixes = new Set([
        STATIC_CACHE,
        IMMUTABLE_CACHE,
        NAV_CACHE,
      ]);
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (!expectedPrefixes.has(key) && key.startsWith(CACHE_PREFIX)) {
            return caches.delete(key);
          }
        })
      );
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

  // Navigation requests: network-first, fallback to cached index.html
  if (isNavigate(request) || (isSameOrigin(url) && isHTMLRequest(request))) {
    event.respondWith(handleNavigate(request));
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

async function handleNavigate(request) {
  try {
    const networkResp = await fetch(request);
    // Optionally refresh NAV_CACHE copy of index.html for future offline
    const clone = networkResp.clone();
    if (clone.ok) {
      const navCache = await caches.open(NAV_CACHE);
      await navCache.put(APP_BASE + 'index.html', clone);
    }
    return networkResp;
  } catch (_) {
    // Offline fallback to cached index.html
    const cached = await caches.match(APP_BASE + 'index.html');
    if (cached) return cached;
    // As a last resort, try any cached navigation response
    const navCache = await caches.open(NAV_CACHE);
    const keys = await navCache.keys();
    if (keys.length) return navCache.match(keys[0]);
    return new Response('<h1>Offline</h1>', {
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
