import '@testing-library/jest-dom/vitest'

// setupTests loaded

// Dexie (IndexedDB) is used for cache-first queries. Vitest/jsdom doesn't provide IndexedDB,
// so we polyfill it for all tests.
import 'fake-indexeddb/auto'

// In Node (Vitest), active timers can keep the process running.
// Some UI libraries (e.g., Snackbar auto-hide) schedule timeouts; we don't want that
// to make `vitest run` hang. Unref timers when possible.
const originalSetTimeout = globalThis.setTimeout
const originalSetInterval = globalThis.setInterval

globalThis.setTimeout = ((handler: any, timeout?: any, ...args: any[]) => {
  const t = originalSetTimeout(handler, timeout, ...args) as any
  t?.unref?.()
  return t
}) as any

globalThis.setInterval = ((handler: any, timeout?: any, ...args: any[]) => {
  const t = originalSetInterval(handler, timeout, ...args) as any
  t?.unref?.()
  return t
}) as any

// MUI + jsdom compatibility
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Some components use ResizeObserver (DataGrid, etc.)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverMock

// Ensure randomUUID exists (used in some flows)
if (!globalThis.crypto) {
  // @ts-expect-error - test shim
  globalThis.crypto = {}
}

if (!('randomUUID' in globalThis.crypto)) {
  // @ts-expect-error - test shim
  globalThis.crypto.randomUUID = () => '00000000-0000-0000-0000-000000000000'
}
