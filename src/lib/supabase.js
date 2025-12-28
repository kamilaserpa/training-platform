// Configuração do cliente Supabase
import { createClient } from '@supabase/supabase-js'

// IMPORTANTE: Substitua estas variáveis pelas suas credenciais do Supabase
// Você encontrará essas informações no painel do Supabase: Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Log de diagnóstico
console.log('🔧 [Supabase] Inicializando cliente...')
console.log('🔧 [Supabase] URL:', supabaseUrl)
console.log('🔧 [Supabase] KEY:', supabaseAnonKey?.substring(0, 20) + '...')

// Verificar se as credenciais foram configuradas
if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseUrl.includes('seu-projeto')) {
    console.error('❌ [Supabase] ERRO: VITE_SUPABASE_URL não configurado!')
    console.error('   Configure o arquivo .env com suas credenciais reais do Supabase')
    console.error('   Veja: CRIAR-ENV.md')
}

if (supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY' || supabaseAnonKey.includes('sua-chave')) {
    console.error('❌ [Supabase] ERRO: VITE_SUPABASE_ANON_KEY não configurado!')
    console.error('   Configure o arquivo .env com suas credenciais reais do Supabase')
    console.error('   Veja: CRIAR-ENV.md')
}

// Cria o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Testar conexão ao inicializar
supabase.auth.getSession()
    .then(({ _, error }) => {
    if (error) {
        console.error('❌ [Supabase] Erro ao testar conexão:', error.message)
    } else {
        console.log('✅ [Supabase] Cliente inicializado com sucesso')
    }
})
    .catch((err) => {
    console.error('❌ [Supabase] Exceção ao testar conexão:', err)
})



