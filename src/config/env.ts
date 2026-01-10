// Configuração de ambiente
export const config = {
  // Modo mock para desenvolvimento
  // Se VITE_USE_MOCK não está definido E as credenciais do Supabase estão vazias = mock
  // Se VITE_USE_MOCK='true' = mock
  // Se VITE_USE_MOCK='false' = Supabase
  // Se credenciais válidas do Supabase = Supabase (padrão produção)
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true' || 
    (import.meta.env.VITE_USE_MOCK === undefined && 
     (import.meta.env.VITE_SUPABASE_URL === undefined || 
      import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co' ||
      import.meta.env.VITE_SUPABASE_ANON_KEY === undefined ||
      import.meta.env.VITE_SUPABASE_ANON_KEY === 'placeholder-key')),

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
