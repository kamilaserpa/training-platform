// Service Worker otimizado para PWA - Evita erros de message channel
const CACHE_NAME = 'training-platform-v2'
const urlsToCache = [
  '/',
  '/index.html',
]

// Skip waiting para ativar imediatamente
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...')
  self.skipWaiting() // Ativa imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
      console.log('[SW] Cache aberto')
      return cache.addAll(urlsToCache).catch(err => {
        console.warn('[SW] Erro ao cachear:', err)
        // Não falha a instalação se não conseguir cachear
      })
    })
  )
})

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
      .then(() => {
      // Assume controle de todas as páginas imediatamente
      return self.clients.claim()
    })
  )
})

// Interceptação de requisições - Network First para desenvolvimento
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  // Ignora requisições não-http (chrome-extension://, etc)
  if (!request.url.startsWith('http')) {
    return
  }
  // Ignora requisições para APIs externas (Supabase, etc)
  if (url.hostname !== location.hostname && !url.hostname.includes('localhost')) {
    return
  }
  // Ignora hot reload do Vite em desenvolvimento
  if (url.pathname.includes('/@vite') || url.pathname.includes('/@fs')) {
    return
  }
  // Strategy: Network First, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
      // Clona a resposta pois ela só pode ser usada uma vez
      const responseToCache = response.clone()

      // Só cacheia respostas OK de HTML, CSS, JS
      if (response.status === 200 &&
      (request.destination === 'document' ||
      request.destination === 'script' ||
      request.destination === 'style')) {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache)
        })
      }

      return response
    })
      .catch((error) => {
      console.log('[SW] Fetch falhou, tentando cache:', request.url)
      // Se a rede falhar, tenta buscar do cache
      return caches.match(request)
        .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        // Se não tiver no cache, retorna erro
        throw error
      })
    })
  )
})

// Listener para mensagens (previne erro de message channel)
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data)
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  // Responde imediatamente para evitar timeout
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({ success: true })
  }
})



