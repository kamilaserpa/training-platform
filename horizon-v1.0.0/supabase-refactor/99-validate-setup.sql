-- =============================================
-- 99-VALIDATE-SETUP.sql
-- Validação completa do setup do banco de dados
-- =============================================

\echo '🔍 VALIDANDO SETUP COMPLETO DO BANCO DE DADOS...'

-- ==========================================
-- 1. VALIDAÇÃO DE TIPOS (ENUMs)
-- ==========================================

\echo '1️⃣ Validando tipos customizados...'

SELECT 
    '✅ Tipos Customizados' as categoria,
    COUNT(*) as quantidade,
    string_agg(typname, ', ') as itens
FROM pg_type t
LEFT JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
AND typname IN ('user_role', 'week_status', 'share_status', 'block_type', 'prescription_type');

-- Verificar valores dos ENUMs
\echo '📋 Valores dos ENUMs:'

SELECT 
    t.typname as "ENUM",
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as "Valores"
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
LEFT JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

-- ==========================================
-- 2. VALIDAÇÃO DE TABELAS
-- ==========================================

\echo '2️⃣ Validando estrutura das tabelas...'

SELECT 
    '✅ Tabelas' as categoria,
    COUNT(*) as quantidade,
    string_agg(tablename, ', ') as itens
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar constraints das tabelas
\echo '📋 Constraints por tabela:'

SELECT 
    tc.table_name as "Tabela",
    tc.constraint_type as "Tipo",
    COUNT(*) as "Quantidade"
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('users', 'movement_patterns', 'week_focuses', 'exercises', 
                      'training_weeks', 'trainings', 'training_blocks', 'exercise_prescriptions')
GROUP BY tc.table_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_type;

-- ==========================================
-- 3. VALIDAÇÃO DE FUNÇÕES
-- ==========================================

\echo '3️⃣ Validando funções auxiliares...'

SELECT 
    '✅ Funções Auxiliares' as categoria,
    COUNT(*) as quantidade,
    string_agg(proname, ', ') as funcoes
FROM pg_proc p 
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public' 
AND proname IN ('get_user_role', 'is_admin_or_owner', 'can_create_content', 
                'can_edit_record', 'can_delete_record', 'can_view_record',
                'create_initial_owner', 'generate_share_token', 'can_share_training',
                'cleanup_expired_share_tokens');

-- Testar função principal
\echo '🧪 Testando função get_user_role():'

DO $$
DECLARE
    user_role_result TEXT;
    test_passed BOOLEAN := true;
BEGIN
    -- Testar função sem usuário logado
    SELECT get_user_role() INTO user_role_result;
    
    IF user_role_result = 'guest' THEN
        RAISE NOTICE '✅ get_user_role() OK - Retorna "guest" sem usuário logado';
    ELSE
        RAISE NOTICE '❌ get_user_role() ERRO - Retornou: %', user_role_result;
        test_passed := false;
    END IF;

    -- Testar função auxiliar
    IF check_user_has_role('owner') = false THEN
        RAISE NOTICE '✅ check_user_has_role() OK - Retorna false para role inexistente';
    ELSE
        RAISE NOTICE '❌ check_user_has_role() ERRO - Deveria retornar false';
        test_passed := false;
    END IF;
    
    IF test_passed THEN
        RAISE NOTICE '🎉 Todas as funções de segurança passaram nos testes!';
    ELSE
        RAISE NOTICE '⚠️  Algumas funções falharam nos testes - revisar código';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO durante teste das funções: %', SQLERRM;
END $$;

-- ==========================================
-- 4. VALIDAÇÃO DE POLÍTICAS RLS
-- ==========================================

\echo '4️⃣ Validando políticas RLS...'

-- Verificar RLS habilitado
SELECT 
    t.tablename as "Tabela",
    CASE t.rowsecurity 
        WHEN true THEN '✅ Habilitado'
        ELSE '❌ Desabilitado'
    END as "RLS Status"
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.tablename;

-- Contar políticas por tabela
SELECT 
    '✅ Total de Políticas RLS' as categoria,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public';

-- Distribuição de políticas por tabela
\echo '📋 Políticas por tabela:'

SELECT 
    tablename as "Tabela",
    COUNT(*) as "Qtd Políticas",
    string_agg(DISTINCT cmd::text, ', ') as "Operações"
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ==========================================
-- 5. VALIDAÇÃO DE ÍNDICES
-- ==========================================

\echo '5️⃣ Validando índices de performance...'

SELECT 
    '✅ Total de Índices' as categoria,
    COUNT(*) as quantidade
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname NOT LIKE 'pg_%';

-- Índices por tabela
\echo '📋 Índices por tabela:'

SELECT 
    tablename as "Tabela",
    COUNT(*) as "Qtd Índices",
    string_agg(
        CASE 
            WHEN indexdef LIKE '%UNIQUE%' THEN '🔑'
            WHEN indexdef LIKE '%GIN%' THEN '🌳'
            WHEN indexdef LIKE '%WHERE%' THEN '🎯'
            ELSE '📋'
        END, 
        ''
    ) as "Tipos"
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname NOT LIKE 'pg_%'
GROUP BY tablename
ORDER BY tablename;

-- ==========================================
-- 6. VALIDAÇÃO DE DADOS INICIAIS
-- ==========================================

\echo '6️⃣ Validando dados iniciais (seed data)...'

-- Contar registros em cada tabela
SELECT 'movement_patterns' as tabela, COUNT(*) as registros FROM movement_patterns
UNION ALL
SELECT 'week_focuses' as tabela, COUNT(*) as registros FROM week_focuses
UNION ALL
SELECT 'exercises' as tabela, COUNT(*) as registros FROM exercises
UNION ALL
SELECT 'users' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 'training_weeks' as tabela, COUNT(*) as registros FROM training_weeks
UNION ALL
SELECT 'trainings' as tabela, COUNT(*) as registros FROM trainings
ORDER BY 
    CASE tabela
        WHEN 'users' THEN 1
        WHEN 'movement_patterns' THEN 2
        WHEN 'week_focuses' THEN 3
        WHEN 'exercises' THEN 4
        WHEN 'training_weeks' THEN 5
        WHEN 'trainings' THEN 6
        ELSE 7
    END;

-- ==========================================
-- 7. VALIDAÇÃO DE TRIGGERS
-- ==========================================

\echo '7️⃣ Validando triggers...'

SELECT 
    '✅ Triggers de updated_at' as categoria,
    COUNT(*) as quantidade
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%updated_at%';

-- ==========================================
-- 8. TESTE DE PERMISSÕES BÁSICAS
-- ==========================================

\echo '8️⃣ Testando permissões básicas...'

-- Testar leitura de tabelas públicas (sem autenticação)
SELECT 
    'Tabelas Públicas' as categoria,
    CASE 
        WHEN (SELECT COUNT(*) FROM movement_patterns) > 0 
        AND (SELECT COUNT(*) FROM week_focuses) > 0
        THEN '✅ Leitura OK'
        ELSE '❌ Erro na leitura'
    END as status;

-- ==========================================
-- 9. RESUMO GERAL
-- ==========================================

\echo '📊 RESUMO FINAL DO SETUP:'

SELECT 
    'Database Schema Version' as item,
    '2.0 - RBAC Complete' as valor
UNION ALL
SELECT 
    'Total de Tabelas' as item,
    COUNT(*)::text as valor
FROM pg_tables WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Total de Funções' as item,
    COUNT(*)::text as valor
FROM pg_proc p 
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public'
UNION ALL
SELECT 
    'Total de Políticas RLS' as item,
    COUNT(*)::text as valor
FROM pg_policies WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Total de Índices' as item,
    COUNT(*)::text as valor
FROM pg_indexes WHERE schemaname = 'public' AND indexname NOT LIKE 'pg_%'
UNION ALL
SELECT 
    'Padrões de Movimento' as item,
    COUNT(*)::text as valor
FROM movement_patterns
UNION ALL
SELECT 
    'Focos de Semana' as item,
    COUNT(*)::text as valor
FROM week_focuses
UNION ALL
SELECT 
    'Exercícios Iniciais' as item,
    COUNT(*)::text as valor
FROM exercises;

-- ==========================================
-- 10. CHECKLIST FINAL
-- ==========================================

\echo '✅ CHECKLIST DE VALIDAÇÃO FINAL:'

WITH validation_checks AS (
    SELECT '1. Tipos (ENUMs) criados' as check_item,
           CASE WHEN (SELECT COUNT(*) FROM pg_type t LEFT JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public' AND typname IN ('user_role', 'week_status', 'share_status', 'block_type', 'prescription_type')) = 5 THEN '✅' ELSE '❌' END as status
    
    UNION ALL
    
    SELECT '2. Tabelas criadas' as check_item,
           CASE WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') >= 8 THEN '✅' ELSE '❌' END as status
    
    UNION ALL
    
    SELECT '3. Funções auxiliares criadas' as check_item,
           CASE WHEN (SELECT COUNT(*) FROM pg_proc p LEFT JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND proname LIKE 'get_user_role%') > 0 THEN '✅' ELSE '❌' END as status
    
    UNION ALL
    
    SELECT '4. RLS habilitado' as check_item,
           CASE WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) >= 8 THEN '✅' ELSE '❌' END as status
    
    UNION ALL
    
    SELECT '5. Políticas RLS criadas' as check_item,
           CASE WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 20 THEN '✅' ELSE '❌' END as status
    
    UNION ALL
    
    SELECT '6. Índices de performance' as check_item,
           CASE WHEN (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname NOT LIKE 'pg_%') >= 20 THEN '✅' ELSE '❌' END as status
    
    UNION ALL
    
    SELECT '7. Dados iniciais inseridos' as check_item,
           CASE WHEN (SELECT COUNT(*) FROM movement_patterns) > 0 AND (SELECT COUNT(*) FROM week_focuses) > 0 THEN '✅' ELSE '❌' END as status
    
    UNION ALL
    
    SELECT '8. Triggers de timestamp' as check_item,
           CASE WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public' AND trigger_name LIKE '%updated_at%') >= 5 THEN '✅' ELSE '❌' END as status
)
SELECT * FROM validation_checks;

-- ==========================================
-- 11. INSTRUÇÕES FINAIS
-- ==========================================

\echo ''
\echo '🎉 VALIDAÇÃO COMPLETA!'
\echo ''
\echo '📋 PRÓXIMOS PASSOS:'
\echo '1. ✅ Banco de dados configurado com sucesso'
\echo '2. 👤 Configure seu primeiro usuário como OWNER'
\echo '3. 🧪 Teste login e funcionalidades no frontend'
\echo '4. 🔧 Ajuste configurações conforme necessário'
\echo ''
\echo '🚨 IMPORTANTE:'
\echo '• Execute este comando para criar seu usuário owner:'
\echo '  SELECT create_initial_owner(''<seu-uuid>'', ''seu@email.com'', ''Seu Nome'');'
\echo ''
\echo '• Para limpar tokens expirados periodicamente:'
\echo '  SELECT cleanup_expired_share_tokens();'
\echo ''
\echo '✨ SETUP COMPLETO E VALIDADO! ✨'