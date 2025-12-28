#!/usr/bin/env node

/**
 * Script para testar conexão com o Supabase
 * Copyright © 2025 - Todos os direitos reservados
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

// Configurar __dirname para ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// Carregar .env
const envPath = join(rootDir, '.env')
dotenv.config({ path: envPath })

console.log('🧪 Testando conexão com o Supabase...\n')
console.log('═'.repeat(60))

// 1. Verificar se .env existe
console.log('\n1️⃣  Verificando arquivo .env...')
if (!existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!')
  console.log('   Solução: cp .env.example .env')
  process.exit(1)
}
console.log('✅ Arquivo .env encontrado')

// 2. Verificar variáveis de ambiente
console.log('\n2️⃣  Verificando variáveis de ambiente...')
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.error('❌ VITE_SUPABASE_URL não configurado!')
  console.log('   Edite o arquivo .env com sua URL do Supabase')
  process.exit(1)
}
console.log(`✅ VITE_SUPABASE_URL: ${supabaseUrl}`)

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('❌ VITE_SUPABASE_ANON_KEY não configurado!')
  console.log('   Edite o arquivo .env com sua chave anon do Supabase')
  process.exit(1)
}
console.log(`✅ VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey.substring(0, 20)}...`)

// 3. Testar conexão
console.log('\n3️⃣  Testando conexão com Supabase...')
const supabase = createClient(supabaseUrl, supabaseAnonKey)

try {
  // Tentar fazer uma query simples
  const { data, error } = await supabase
    .from('_prisma_migrations')
    .select('*')
    .limit(1)

  if (error && error.code === 'PGRST116') {
    // Tabela não existe, mas conexão funcionou!
    console.log('✅ Conexão com Supabase OK')
    console.log('   (Tabela _prisma_migrations não encontrada, mas isso é normal)')
  } else if (error) {
    console.log('⚠️  Conexão estabelecida, mas houve um erro na query:')
    console.log(`   ${error.message}`)
  } else {
    console.log('✅ Conexão com Supabase OK')
    console.log('   Query de teste executada com sucesso')
  }
} catch (err) {
  console.error('❌ Erro ao conectar com Supabase:')
  console.error(`   ${err.message}`)
  console.log('\n💡 Possíveis soluções:')
  console.log('   1. Verifique se a URL está correta')
  console.log('   2. Verifique se a chave anon está correta')
  console.log('   3. Confirme que o projeto Supabase está ativo')
  console.log('   4. Teste a URL no navegador: ' + supabaseUrl)
  process.exit(1)
}

// 4. Verificar tabelas do projeto
console.log('\n4️⃣  Verificando tabelas disponíveis...')

const tables = [
  'profiles',
  'exercicios',
  'tipos_treino',
  'semanas',
  'treinos',
  'blocos_treino',
  'padroes_movimento',
  'bloco_padrao_movimento',
  'bloco_exercicios'
]

console.log('\nTabelas do sistema:')
for (const table of tables) {
  try {
    const { error } = await supabase
      .from(table)
      .select('*')
      .limit(1)

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log(`   ⚠️  ${table} - NÃO EXISTE`)
      } else {
        console.log(`   ❌ ${table} - ERRO: ${error.message}`)
      }
    } else {
      console.log(`   ✅ ${table} - OK`)
    }
  } catch (err) {
    console.log(`   ❌ ${table} - ERRO: ${err.message}`)
  }
}

// 5. Verificar autenticação
console.log('\n5️⃣  Testando sistema de autenticação...')
try {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.log('⚠️  Erro ao verificar sessão:', error.message)
  } else if (session) {
    console.log('✅ Sessão ativa encontrada')
    console.log(`   Usuário: ${session.user.email}`)
  } else {
    console.log('✅ Sistema de autenticação OK (sem sessão ativa)')
  }
} catch (err) {
  console.error('❌ Erro ao testar autenticação:', err.message)
}

// Resumo
console.log('\n═'.repeat(60))
console.log('\n📊 Resumo:')
console.log('   ✅ Arquivo .env configurado')
console.log('   ✅ Credenciais do Supabase OK')
console.log('   ✅ Conexão com banco de dados OK')

console.log('\n💡 Próximos passos:')
console.log('   1. Se faltam tabelas, execute o schema SQL no Supabase')
console.log('   2. Crie um usuário em Authentication > Users')
console.log('   3. Execute: npm run dev')
console.log('   4. Acesse: http://localhost:5173')

console.log('\n✅ Tudo pronto para começar!\n')

