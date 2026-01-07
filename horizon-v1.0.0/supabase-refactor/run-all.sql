-- =============================================
-- RUN-ALL.sql  
-- Script mestre para executar toda a reconfiguração do banco
-- VERSÃO 2.3: Schema completo com correções RLS e otimizações
-- =============================================

\echo '🚀 INICIANDO RECONFIGURAÇÃO COMPLETA DO BANCO DE DADOS (v2.3)...'
\echo '✨ Novidades: RLS fixes, duration_seconds, movement patterns, políticas otimizadas'
\echo '⏰ Início:' \echo `date`
\echo ''

-- ==========================================
-- CONFIGURAÇÕES DE EXECUÇÃO
-- ==========================================

-- Habilitar timing para monitorar performance
\timing on

-- Configurar para parar em caso de erro
\set ON_ERROR_STOP on

-- Mostrar comandos executados
\set ECHO all

\echo '⚙️  Configurações aplicadas:'
\echo '• ON_ERROR_STOP: habilitado (para em caso de erro)'
\echo '• TIMING: habilitado (mostra tempo de execução)'
\echo '• ECHO: habilitado (mostra comandos)'
\echo '• MODO: Desenvolvimento (flexível para frontend)'
\echo ''

-- ==========================================
-- ETAPA 0: RESET COMPLETO DO BANCO
-- ==========================================

\echo '🔥 ETAPA 0/8: RESET COMPLETO DO BANCO DE DADOS'
\echo '⚠️  ATENÇÃO: Todos os dados existentes serão PERMANENTEMENTE removidos!'
\echo '⚠️  Pressione CTRL+C nos próximos 5 segundos para cancelar...'

-- Pausa de 5 segundos para permitir cancelamento
SELECT pg_sleep(5);

\echo '🗑️  Executando reset do banco...'
\i 00-reset-database.sql
\echo '✅ Reset concluído!'
\echo ''

-- ==========================================
-- ETAPA 1: CRIAÇÃO DE TIPOS
-- ==========================================

\echo '📋 ETAPA 1/8: CRIANDO TIPOS CUSTOMIZADOS (ENUMs)'
\i 01-create-types.sql
\echo '✅ Tipos customizados criados!'
\echo ''

-- ==========================================
-- ETAPA 2: CRIAÇÃO DE TABELAS
-- ==========================================

\echo '🏗️  ETAPA 2/8: CRIANDO ESTRUTURA DAS TABELAS (created_by nullable para dev)'
\i 02-create-tables.sql
\echo '✅ Tabelas criadas!'
\echo ''

-- ==========================================
-- ETAPA 3: FUNÇÕES E TRIGGERS
-- ==========================================

\echo '🔄 ETAPA 3/8: CRIANDO FUNÇÕES E TRIGGERS DE AUTO-PREENCHIMENTO'
\i 03-create-functions.sql
\echo '✅ Funções e triggers criados!'
\echo ''

-- ==========================================
-- ETAPA 4: POLÍTICAS RLS FLEXÍVEIS
-- ==========================================

\echo '🔒 ETAPA 4/8: CONFIGURANDO POLÍTICAS RLS FLEXÍVEIS (DESENVOLVIMENTO)'
\i 04-create-policies.sql
\echo '✅ Políticas RLS flexíveis configuradas!'
\echo ''

-- ==========================================
-- ETAPA 5: DADOS INICIAIS
-- ==========================================

\echo '🌱 ETAPA 5/8: INSERINDO DADOS INICIAIS (SEED DATA)'
\i 05-insert-seed-data.sql
\echo '✅ Dados iniciais inseridos!'
\echo ''

-- ==========================================
-- ETAPA 6: ÍNDICES DE PERFORMANCE
-- ==========================================

\echo '⚡ ETAPA 6/9: CRIANDO ÍNDICES DE PERFORMANCE'
\i 06-create-indexes.sql
\echo '✅ Índices de performance criados!'
\echo ''

-- ==========================================
-- ETAPA 7: CORREÇÕES AVANÇADAS DE RLS
-- ==========================================

\echo '🔧 ETAPA 7/9: APLICANDO CORREÇÕES AVANÇADAS DE RLS'
\i 07-rls-fixes.sql
\echo '✅ Correções de RLS aplicadas!'
\echo ''

-- ==========================================
-- ETAPA 7: VALIDAÇÃO FINAL
-- ==========================================

\echo '🔍 ETAPA 8/9: VALIDAÇÃO FINAL DO SETUP (DESENVOLVIMENTO)'
\i 99-validate-setup.sql
\echo ''

-- ==========================================
-- ETAPA 8: INFORMAÇÕES DE MIGRAÇÃO
-- ==========================================

\echo '📋 ETAPA 9/9: INFORMAÇÕES SOBRE MIGRAÇÃO PARA PRODUÇÃO'
\echo ''
\echo '🧪 BANCO CONFIGURADO PARA DESENVOLVIMENTO:'
\echo '• created_by pode ser NULL (triggers preenchem automaticamente)'
\echo '• Políticas RLS flexíveis (funcionam sem autenticação completa)'
\echo '• RLS permanece habilitado (segurança preservada)'
\echo ''
\echo '🚀 QUANDO PRONTO PARA PRODUÇÃO, EXECUTE:'
\echo '   \\i 10-production-migration.sql'
\echo ''
\echo '💡 ESTE COMANDO IRÁ:'
\echo '• Tornar created_by obrigatório (NOT NULL)'
\echo '• Substituir políticas flexíveis por restritivas'
\echo '• Validar integridade completa dos dados'
\echo ''

-- ==========================================
-- RESUMO FINAL DE EXECUÇÃO
-- ==========================================

\echo ''
\echo '🎉 RECONFIGURAÇÃO COMPLETA FINALIZADA (MODO DESENVOLVIMENTO)!'
\echo '⏰ Término:' \echo `date`
\echo ''

-- Estatísticas finais
\echo '📊 ESTATÍSTICAS FINAIS:'

SELECT 
    'Total de Tabelas Criadas' as metrica,
    COUNT(*)::text as valor
FROM pg_tables WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Total de Políticas RLS' as metrica,
    COUNT(*)::text as valor
FROM pg_policies WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Total de Funções Criadas' as metrica,
    COUNT(*)::text as valor
FROM pg_proc p 
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public'
UNION ALL
SELECT 
    'Total de Índices' as metrica,
    COUNT(*)::text as valor
FROM pg_indexes WHERE schemaname = 'public' AND indexname NOT LIKE 'pg_%'
UNION ALL
SELECT 
    'Padrões de Movimento' as metrica,
    COUNT(*)::text as valor
FROM movement_patterns
UNION ALL
SELECT 
    'Exercícios Disponíveis' as metrica,
    COUNT(*)::text as valor
FROM exercises;

-- ==========================================
-- INSTRUÇÕES DE PÓS-SETUP
-- ==========================================

\echo ''
\echo '📋 PRÓXIMOS PASSOS OBRIGATÓRIOS:'
\echo ''
\echo '1️⃣ CRIAR USUÁRIO OWNER:'
\echo '   Execute no SQL Editor do Supabase:'
\echo '   SELECT create_initial_owner(''<UUID-DO-SEU-USER>'', ''seu@email.com'', ''Seu Nome'');'
\echo ''
\echo '2️⃣ CONFIGURAR FRONTEND:'
\echo '   • Atualize as chaves da API do Supabase'
\echo '   • Teste o login/logout'
\echo '   • Verifique permissões de cada role'
\echo ''
\echo '3️⃣ MANUTENÇÃO PERIÓDICA:'
\echo '   • Execute limpeza de tokens: SELECT cleanup_expired_share_tokens();'
\echo '   • Monitore logs de erro'
\echo '   • Faça backup regular dos dados'
\echo ''
\echo '🚨 IMPORTANTE:'
\echo '• Todos os dados anteriores foram REMOVIDOS'
\echo '• O banco agora usa Role-Based Access Control (RBAC)'
\echo '• Roles disponíveis: owner, admin, viewer, guest'
\echo '• RLS está habilitado em todas as tabelas'
\echo ''
\echo '✅ SETUP COMPLETO E VALIDADO!'
\echo '🎊 Seu banco de dados está pronto para uso!'

-- Desabilitar configurações de debug
\timing off
\set ECHO none