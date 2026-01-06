// Configuração do cliente Supabase
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

// Criar o cliente Supabase
export const supabase = createClient(config.SUPABASE.url, config.SUPABASE.anonKey);

// Exportar flag de mock para uso nos serviços
export const useMock = config.USE_MOCK;

// Testar conexão apenas quando não está em modo mock
if (!useMock) {
  if (config.DEBUG) {
    console.log('🔧 [Supabase] Inicializando cliente...');
  }

  if (
    config.SUPABASE.url === 'https://placeholder.supabase.co' ||
    config.SUPABASE.url.includes('seu-projeto')
  ) {
    console.error('❌ [Supabase] ERRO: VITE_SUPABASE_URL não configurado!');
    console.error('   Configure o arquivo .env com suas credenciais reais do Supabase');
  }

  if (
    config.SUPABASE.anonKey === 'placeholder-key' ||
    config.SUPABASE.anonKey.includes('sua-chave')
  ) {
    console.error('❌ [Supabase] ERRO: VITE_SUPABASE_ANON_KEY não configurado!');
    console.error('   Configure o arquivo .env com suas credenciais reais do Supabase');
  }

  supabase.auth
    .getSession()
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ [Supabase] Erro ao testar conexão:', error.message);
      } else if (config.DEBUG) {
        console.log('✅ [Supabase] Cliente inicializado com sucesso!');
      }
    })
    .catch((error) => {
      console.error('❌ [Supabase] Erro inesperado:', error);
    });
} else if (config.DEBUG) {
  console.log('🎭 [Supabase] Modo mock ativado - usando dados simulados');
}
