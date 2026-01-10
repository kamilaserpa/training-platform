// Configuração do cliente Supabase
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

// Criar o cliente Supabase
export const supabase = createClient(config.SUPABASE.url, config.SUPABASE.anonKey);

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

  // Teste de conexão mais rápido
  Promise.race([
    supabase.auth.getSession(),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
  ])
    .then((result: any) => {
      if (result?.error) {
        console.error('Erro ao testar conexão:', result.error.message);
      }
    })
    .catch((error) => {
      console.error('Erro de conexão:', error.message);
    });
}
