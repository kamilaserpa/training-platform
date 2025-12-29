// Configuração centralizada de ambiente
// Detecta automaticamente se deve usar mock ou Supabase real

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// Log para debug (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('🔧 [Config] Modo:', USE_MOCK ? 'MOCK' : 'Supabase Real')
}

