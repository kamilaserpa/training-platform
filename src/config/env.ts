// Configuração de ambiente
export const config = {
  // Modo mock para desenvolvimento (padrão é true para facilitar desenvolvimento)
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === undefined,

  // Configurações do Supabase
  SUPABASE: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
  },

  // Logs de debug
  DEBUG: import.meta.env.NODE_ENV === 'development',
};

// Log da configuração atual
if (config.DEBUG) {
  console.log('🔧 [Config] Configuração atual:', {
    useMock: config.USE_MOCK,
    supabaseUrl: config.SUPABASE.url,
    hasSupabaseKey: config.SUPABASE.anonKey !== 'placeholder-key',
  });
}
