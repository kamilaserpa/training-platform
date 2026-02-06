// Training Platform PWA Service Worker (Vite + React)
// Goals: aggressive immutable caches, offline navigation, SW auto-update,
// versioned caches, stale-while-revalidate, exclude Supabase, avoid non-GET.
// iOS Fix: Network-ONLY for navigation (no HTML cache) to prevent PWA hang

const CACHE_PREFIX = 'tp-pwa';
// Versão do SW: Siga versionamento semântico (major.minor.patch)
// - Patch (x.x.1): Bug fixes, ajustes menores
// - Minor (x.1.x): Novas features, mudanças compatíveis
// - Major (1.x.x): Breaking changes, refatorações grandes
const SW_VERSION = '1.0.3'; // Fix immutable asset detection under subpath (GitHub Pages)
const STATIC_CACHE = `${CACHE_PREFIX}-static-${SW_VERSION}`; // images, fonts, manifest
const IMMUTABLE_CACHE = `${CACHE_PREFIX}-immutable-${SW_VERSION}`; // hashed build assets
const CORE_CACHE = `${CACHE_PREFIX}-core-${SW_VERSION}`; // core assets (NO HTML)

// Respect Vite base and GitHub Pages scope, e.g. /training-platform/
const APP_BASE = self.registration.scope;
const BASE_PATHNAME = (() => {
  try {
    const p = new URL(APP_BASE).pathname;
    return p.endsWith('/') ? p : p + '/';
  } catch {
    return '/';
  }
})();

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Core assets to pre-cache (NO HTML - causes iOS PWA issues)
const CORE_ASSETS = [
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

// Vite builds outputs under /assets/ (chunks, CSS, images). Treat those as immutable.
// Support both dot-hash and hyphen-hash patterns used by Vite.
const isImmutableAsset = (url) => {
  if (!isSameOrigin(url)) return false;
  const p = url.pathname;
  const assetsBase = `${BASE_PATHNAME}assets/`;
  if (!p.startsWith(assetsBase)) return false;
  // Common hashed patterns (dot or hyphen): file.[hash].ext OR file-[hash].ext
  const dotHash = new RegExp(`^${escapeRegExp(assetsBase)}[^/]+\\.[a-zA-Z0-9]{8,}\\.[^/]+$`).test(p);
  const hyphenHash = new RegExp(`^${escapeRegExp(assetsBase)}[^/]+-[a-zA-Z0-9]{8,}\\.[^/]+$`).test(p);
  // Fallback: treat JS/CSS in /assets as immutable even if pattern changes
  const jsCss = new RegExp(`^${escapeRegExp(assetsBase)}.*\\.(js|css)$`, 'i').test(p);
  return dotHash || hyphenHash || jsCss;
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
  event.waitUntil(
    (async () => {
      try {
        const expectedCaches = new Set([
          STATIC_CACHE,
          IMMUTABLE_CACHE,
          CORE_CACHE,
        ]);
        const keys = await caches.keys();
        await Promise.all(
          keys.map((key) => {
            if (!expectedCaches.has(key) && key.startsWith(CACHE_PREFIX)) {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            }
          })
        );
        console.log(`[SW v${SW_VERSION}] Activated - HTML caching disabled for iOS PWA fix`);
      } catch (err) {
        console.error('[SW] Activate failed:', err);
      }
      await self.clients.claim();
    })()
  );
});

// Allow client to request immediate activation of waiting SW
self.addEventListener('message', (event) => {
  try {
    const data = event?.data;
    if (data && data.type === 'SKIP_WAITING') {
      // Activate new SW immediately
      self.skipWaiting();
    }
  } catch (err) {
    // noop
  }
});

// Fetch strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isMethodCacheable(request)) return; // Only cache GET

  const url = toURL(request);

  // Never interfere with Supabase requests
  if (isSupabase(url)) return;

  // CRITICAL iOS FIX v5: Network-ONLY for navigation (no cache)
  // Caching HTML causes iOS PWA to hang on subsequent visits
  if (isNavigate(request) || (isSameOrigin(url) && isHTMLRequest(request))) {
    event.respondWith(handleNavigateNetworkOnly(request));
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

// Network-ONLY for navigation (iOS PWA fix v5)
// Do NOT cache HTML - causes iOS standalone mode to hang
async function handleNavigateNetworkOnly(request) {
  console.log('[SW] Navigation request:', request.url);

  try {
    // Direct network fetch with generous timeout for iOS
    const networkResp = await Promise.race([
      fetch(request, {
        cache: 'no-cache', // Force fresh fetch
        credentials: 'same-origin'
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), 5000)
      )
    ]);

    console.log('[SW] Navigation response:', networkResp.status);

    // Return response WITHOUT caching
    // This prevents iOS PWA hang on subsequent visits
    return networkResp;

  } catch (error) {
    console.error('[SW] Navigation failed:', error);

    // Only show offline page on complete network failure
    return new Response(
      `<!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Sem Conexão</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px;
          }
          h1 { font-size: 2rem; margin: 0 0 1rem; }
          p { font-size: 1.1rem; opacity: 0.9; margin: 0 0 2rem; }
          button {
            padding: 12px 32px;
            font-size: 1rem;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <h1>📡 Sem Conexão</h1>
        <p>Verifique sua conexão com a internet e tente novamente.</p>
        <button onclick="window.location.reload()">Tentar Novamente</button>
      </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 503,
      }
    );
  }
}

// Note: Removed findCachedHTML - we don't cache HTML anymore (iOS fix)

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
