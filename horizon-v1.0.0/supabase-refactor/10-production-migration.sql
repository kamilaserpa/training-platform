-- =============================================
-- 10-PRODUCTION-MIGRATION.sql
-- Script para migrar de desenvolvimento para produção
-- Execute este script quando tiver autenticação completa
-- =============================================

\echo '🚀 MIGRANDO PARA CONFIGURAÇÃO DE PRODUÇÃO...'

-- ==========================================
-- 1. TORNAR created_by OBRIGATÓRIO NOVAMENTE
-- ==========================================

-- Primeiro, atualizar registros sem created_by para um usuário padrão
-- ATENÇÃO: Você deve definir um UUID de usuário válido aqui
UPDATE training_weeks 
SET created_by = (
    SELECT id FROM users 
    WHERE role = 'owner' 
    LIMIT 1
)
WHERE created_by IS NULL;

UPDATE exercises 
SET created_by = (
    SELECT id FROM users 
    WHERE role = 'owner' 
    LIMIT 1
)
WHERE created_by IS NULL;

UPDATE trainings 
SET created_by = (
    SELECT id FROM users 
    WHERE role = 'owner' 
    LIMIT 1
)
WHERE created_by IS NULL;

-- Agora tornar as colunas NOT NULL
ALTER TABLE training_weeks ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE exercises ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE trainings ALTER COLUMN created_by SET NOT NULL;

\echo '✅ Campos created_by agora são obrigatórios'

-- ==========================================
-- 2. OTIMIZAR SCHEMA EXERCISE_PRESCRIPTIONS
-- ==========================================

\echo '📊 Otimizando schema de prescrições de exercícios...'

-- Adicionar coluna duration_seconds se não existir
ALTER TABLE exercise_prescriptions 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Adicionar constraint para duration_seconds
DO $$ 
BEGIN
    -- Remover constraint anterior se existir
    ALTER TABLE exercise_prescriptions 
    DROP CONSTRAINT IF EXISTS check_duration_seconds;
    
    -- Adicionar nova constraint
    ALTER TABLE exercise_prescriptions 
    ADD CONSTRAINT check_duration_seconds 
    CHECK (duration_seconds IS NULL OR duration_seconds > 0);
END $$;

-- Comentário para documentar o campo
COMMENT ON COLUMN exercise_prescriptions.duration_seconds IS 
'Duração do exercício em segundos - usado principalmente para exercícios de tempo determinado como isometrias ou cardio';

\echo '✅ Schema de prescrições otimizado - duration_seconds adicionado'

-- ==========================================
-- 3. ATUALIZAR POLÍTICAS PARA PRODUÇÃO
-- ==========================================

-- Remover políticas flexíveis de desenvolvimento
DROP POLICY IF EXISTS "training_weeks_select_policy" ON training_weeks;
DROP POLICY IF EXISTS "training_weeks_insert_policy" ON training_weeks;
DROP POLICY IF EXISTS "training_weeks_update_policy" ON training_weeks;
DROP POLICY IF EXISTS "training_weeks_delete_policy" ON training_weeks;

DROP POLICY IF EXISTS "exercises_select_policy" ON exercises;
DROP POLICY IF EXISTS "exercises_insert_policy" ON exercises;
DROP POLICY IF EXISTS "exercises_update_policy" ON exercises;
DROP POLICY IF EXISTS "exercises_delete_policy" ON exercises;

-- Criar políticas de produção mais restritivas
-- TRAINING_WEEKS - Apenas próprios registros
CREATE POLICY "training_weeks_select_production" ON training_weeks
    FOR SELECT TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "training_weeks_insert_production" ON training_weeks
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "training_weeks_update_production" ON training_weeks
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "training_weeks_delete_production" ON training_weeks
    FOR DELETE TO authenticated
    USING (created_by = auth.uid());

-- EXERCISES - Apenas próprios registros
CREATE POLICY "exercises_select_production" ON exercises
    FOR SELECT TO authenticated
    USING (created_by = auth.uid());

CREATE POLICY "exercises_insert_production" ON exercises
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "exercises_update_production" ON exercises
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "exercises_delete_production" ON exercises
    FOR DELETE TO authenticated
    USING (created_by = auth.uid());

\echo '✅ Políticas de produção implementadas'

-- ==========================================
-- 4. VALIDAÇÃO FINAL
-- ==========================================

-- Verificar se não há registros órfãos
SELECT 
    'Validação Final' as info,
    'Training Weeks sem created_by' as tipo,
    COUNT(*) as quantidade
FROM training_weeks 
WHERE created_by IS NULL

UNION ALL

SELECT 
    'Validação Final' as info,
    'Exercises sem created_by' as tipo,
    COUNT(*) as quantidade
FROM exercises 
WHERE created_by IS NULL;

-- Verificar se o campo duration_seconds foi adicionado
SELECT 
    'Schema Update' as info,
    'duration_seconds column exists' as tipo,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exercise_prescriptions' 
        AND column_name = 'duration_seconds'
    ) THEN 1 ELSE 0 END as quantidade;

-- Verificar políticas ativas
SELECT 
    'Políticas de Produção' as info,
    tablename,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('training_weeks', 'exercises')
AND policyname LIKE '%production%'
GROUP BY tablename;

\echo '🎉 MIGRAÇÃO PARA PRODUÇÃO CONCLUÍDA!'
\echo 'ℹ️  Agora o sistema exige autenticação adequada para todas as operações'