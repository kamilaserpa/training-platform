// Configuração do cliente Supabase
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import type { Database } from '../types/database.types';

const DEFAULT_SUPABASE_FETCH_TIMEOUT_MS = 20000;

const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(
    () => controller.abort(),
    DEFAULT_SUPABASE_FETCH_TIMEOUT_MS,
  );

  // If the caller provided a signal, propagate it to our controller.
  const providedSignal = init?.signal;
  if (providedSignal) {
    if (providedSignal.aborted) controller.abort();
    else providedSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  // Prefer AbortSignal.any when available to respect both signals.
  const signal =
    providedSignal && typeof (AbortSignal as any)?.any === 'function'
      ? (AbortSignal as any).any([providedSignal, controller.signal])
      : controller.signal;

  try {
    return await fetch(input, {
      ...init,
      signal,
    });
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
};

// Criar o cliente Supabase
const globalForSupabase = globalThis as unknown as { __supabase?: SupabaseClient<Database> };

export const supabase =
  globalForSupabase.__supabase ??
  (globalForSupabase.__supabase = createClient<Database>(config.SUPABASE.url, config.SUPABASE.anonKey, {
    global: {
      fetch: fetchWithTimeout,
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Alguns ambientes/browsers geram AbortError ao usar navigator.locks (Web Locks API).
      // Como o app normalmente roda em uma aba, usamos um lock no-op para evitar esse crash.
      lock: async (_name, _acquireTimeout, fn) => await fn(),
    },
  }));

// Exportar flag de mock para uso nos serviços
export const useMock = config.USE_MOCK;

// Testar conexão apenas quando não está em modo mock
if (!useMock) {
  if (
    config.SUPABASE.url === 'https://placeholder.supabase.co' ||
    config.SUPABASE.url.includes('seu-projeto')
  ) {
    console.error('VITE_SUPABASE_URL não configurado!');
  }

  if (
    config.SUPABASE.anonKey === 'placeholder-key' ||
    config.SUPABASE.anonKey.includes('sua-chave')
  ) {
    console.error('VITE_SUPABASE_ANON_KEY não configurado!');
  }

  // Health-check leve (não usa supabase.auth.* para evitar concorrência/locks no startup)
  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    fetch(`${config.SUPABASE.url}/auth/v1/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        apikey: config.SUPABASE.anonKey,
        Authorization: `Bearer ${config.SUPABASE.anonKey}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          console.error('Erro de conexão: Supabase health-check falhou', res.status);
        }
      })
      .catch((error) => {
        const message = error?.name === 'AbortError' ? 'Timeout' : error?.message;
        console.error('Erro de conexão:', message);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });
  } catch {
    // noop (ambientes sem fetch/window)
  }
}
