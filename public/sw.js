// Training Platform PWA Service Worker (Vite + React)
// Goals: aggressive immutable caches, offline navigation, SW auto-update,
// versioned caches, stale-while-revalidate, exclude Supabase, avoid non-GET.
// iOS Fix: Network-first navigation to prevent loading hang

const CACHE_PREFIX = 'tp-pwa';
const CACHE_VERSION = 'v4'; // Bumped for iOS fix
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

  // CRITICAL iOS FIX: For navigation, use network-only strategy
  // Only use cache if network fails
  if (isNavigate(request) || (isSameOrigin(url) && isHTMLRequest(request))) {
    event.respondWith(handleNavigateNetworkFirst(request));
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

// Simple network-first for navigation (iOS compatible)
async function handleNavigateNetworkFirst(request) {
  try {
    // Try network with reasonable timeout (3 seconds)
    const networkResp = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), 3000)
      )
    ]);

    // Cache successful response for offline use
    if (networkResp.ok) {
      const coreCache = await caches.open(CORE_CACHE);
      coreCache.put(APP_BASE + 'index.html', networkResp.clone()).catch(() => {});
    }

    return networkResp;
  } catch (error) {
    // Network failed, try cache
    const cached = await findCachedHTML();
    if (cached) {
      return cached;
    }

    // Last resort: return offline page
    return new Response(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head><body><h1>No connection</h1><p>Please check your internet connection and try again.</p></body></html>',
      {
        headers: { 'Content-Type': 'text/html' },
        status: 503,
      }
    );
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
