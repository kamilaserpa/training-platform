-- =============================================
-- 00-RESET-DATABASE.sql
-- ⚠️  ATENÇÃO: ESTE SCRIPT APAGA TODOS OS DADOS
-- =============================================
-- Execute este script para limpar completamente 
-- o banco e preparar para a recriação total

\echo '🚨 INICIANDO RESET COMPLETO DO BANCO DE DADOS...'

-- Desabilitar triggers temporariamente para evitar erros de dependência
SET session_replication_role = replica;

-- 1. REMOVER TODAS AS POLÍTICAS RLS
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- 2. REMOVER TODAS AS FUNÇÕES CUSTOMIZADAS
DO $$
DECLARE
    func RECORD;
BEGIN
    FOR func IN 
        SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p 
        LEFT JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND p.proname NOT LIKE 'pg_%'
        AND p.proname NOT LIKE 'sql_%'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE', 
                      func.nspname, func.proname, func.args);
    END LOOP;
END $$;

-- 3. DESABILITAR RLS EM TODAS AS TABELAS
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE IF EXISTS %I.%I DISABLE ROW LEVEL SECURITY', 
                      tbl.schemaname, tbl.tablename);
    END LOOP;
END $$;

-- 4. REMOVER TODAS AS TABELAS (SCHEMA V2 + V1)
-- Schema v2 tables (ordem para evitar erros de FK)
DROP TABLE IF EXISTS exercise_prescriptions CASCADE;
DROP TABLE IF EXISTS training_block_movement_patterns CASCADE;
DROP TABLE IF EXISTS training_blocks CASCADE;
DROP TABLE IF EXISTS trainings CASCADE;
DROP TABLE IF EXISTS training_weeks CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS week_focuses CASCADE;
DROP TABLE IF EXISTS movement_patterns CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Schema v1 tables (tabelas antigas que podem existir)
DROP TABLE IF EXISTS bloco_exercicios CASCADE;
DROP TABLE IF EXISTS bloco_padrao_movimento CASCADE;
DROP TABLE IF EXISTS blocos_treino CASCADE;
DROP TABLE IF EXISTS treinos CASCADE;
DROP TABLE IF EXISTS semanas CASCADE;
DROP TABLE IF EXISTS exercicios CASCADE;
DROP TABLE IF EXISTS padroes_movimento CASCADE;
DROP TABLE IF EXISTS tipos_treino CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Backup tables (caso existam)
DROP TABLE IF EXISTS backup_profiles CASCADE;
DROP TABLE IF EXISTS backup_exercicios CASCADE;
DROP TABLE IF EXISTS backup_semanas CASCADE;
DROP TABLE IF EXISTS backup_treinos CASCADE;
DROP TABLE IF EXISTS backup_blocos_treino CASCADE;
DROP TABLE IF EXISTS backup_bloco_exercicios CASCADE;
DROP TABLE IF EXISTS backup_bloco_padrao_movimento CASCADE;
DROP TABLE IF EXISTS backup_padroes_movimento CASCADE;
DROP TABLE IF EXISTS backup_tipos_treino CASCADE;

-- 5. REMOVER TODOS OS TIPOS CUSTOMIZADOS
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS week_status CASCADE;
DROP TYPE IF EXISTS share_status CASCADE;
DROP TYPE IF EXISTS block_type CASCADE;
DROP TYPE IF EXISTS prescription_type CASCADE;

-- 6. REMOVER TODAS AS SEQUÊNCIAS ÓRFÃS
DO $$
DECLARE
    seq RECORD;
BEGIN
    FOR seq IN 
        SELECT schemaname, sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP SEQUENCE IF EXISTS %I.%I CASCADE', 
                      seq.schemaname, seq.sequencename);
    END LOOP;
END $$;

-- 7. LIMPAR POSSÍVEIS ÍNDICES ÓRFÃOS
DO $$
DECLARE
    idx RECORD;
BEGIN
    FOR idx IN 
        SELECT schemaname, indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname NOT LIKE 'pg_%'
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I.%I CASCADE', 
                      idx.schemaname, idx.indexname);
    END LOOP;
END $$;

-- Reabilitar triggers
SET session_replication_role = DEFAULT;

-- 8. VERIFICAÇÃO FINAL
SELECT 
    'Tabelas Restantes' as tipo,
    COUNT(*) as quantidade
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'Funções Restantes' as tipo,
    COUNT(*) as quantidade
FROM pg_proc p 
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public' 
AND p.proname NOT LIKE 'pg_%'
AND p.proname NOT LIKE 'sql_%'

UNION ALL

SELECT 
    'Tipos Restantes' as tipo,
    COUNT(*) as quantidade
FROM pg_type t
LEFT JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
AND t.typname NOT LIKE 'pg_%'
AND t.typtype = 'e'; -- Apenas ENUMs

\echo '✅ RESET COMPLETO FINALIZADO!'
\echo '📋 Próximo passo: Execute 01-create-types.sql'