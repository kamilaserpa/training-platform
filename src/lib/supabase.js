// Configuração do cliente Supabase
import { createClient } from '@supabase/supabase-js'

// IMPORTANTE: Substitua estas variáveis pelas suas credenciais do Supabase
// Você encontrará essas informações no painel do Supabase: Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Cria o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

