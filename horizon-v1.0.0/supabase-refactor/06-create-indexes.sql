-- =============================================
-- 06-CREATE-INDEXES.sql
-- Criação de índices para otimização de performance
-- =============================================

-- ==========================================
-- 1. ÍNDICES PARA TABELA USERS
-- ==========================================

-- Índice para busca por email (já é UNIQUE, mas explícito para performance)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Índice para busca por role (para políticas RLS)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índice para ordenação por data de criação
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);



-- ==========================================
-- 2. ÍNDICES PARA TABELA EXERCISES  
-- ==========================================

-- Índice para busca por criador (usado nas políticas RLS)
CREATE INDEX IF NOT EXISTS idx_exercises_created_by ON exercises(created_by);

-- Índice para busca por padrão de movimento
CREATE INDEX IF NOT EXISTS idx_exercises_movement_pattern ON exercises(movement_pattern_id);

-- Índice para busca por nome (para pesquisa)
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);

-- Índice para busca por nível de dificuldade
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty_level);

-- Índice para busca por grupos musculares (GIN para arrays)
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);

-- Índice para busca por equipamentos (GIN para arrays)
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises USING GIN(equipment);

-- Índice composto para busca do usuário + ordenação por data
CREATE INDEX IF NOT EXISTS idx_exercises_user_created ON exercises(created_by, created_at DESC);



-- ==========================================
-- 3. ÍNDICES PARA TABELA TRAINING_WEEKS
-- ==========================================

-- Índice para busca por criador (usado nas políticas RLS)
CREATE INDEX IF NOT EXISTS idx_training_weeks_created_by ON training_weeks(created_by);

-- Índice para busca por foco da semana
CREATE INDEX IF NOT EXISTS idx_training_weeks_focus ON training_weeks(week_focus_id);

-- Índice para busca por status
CREATE INDEX IF NOT EXISTS idx_training_weeks_status ON training_weeks(status);

-- Índice para busca por data (range de datas)
CREATE INDEX IF NOT EXISTS idx_training_weeks_dates ON training_weeks(start_date, end_date);

-- Índice para busca ativa das semanas atuais
CREATE INDEX IF NOT EXISTS idx_training_weeks_active ON training_weeks(status, start_date) 
    WHERE status = 'active';

-- Índice composto para busca do usuário + ordenação por data
CREATE INDEX IF NOT EXISTS idx_training_weeks_user_date ON training_weeks(created_by, start_date DESC);



-- ==========================================
-- 4. ÍNDICES PARA TABELA TRAININGS
-- ==========================================

-- Índice para busca por criador (usado nas políticas RLS)
CREATE INDEX IF NOT EXISTS idx_trainings_created_by ON trainings(created_by);

-- Índice para busca por semana de treino
CREATE INDEX IF NOT EXISTS idx_trainings_week ON trainings(training_week_id);

-- Índice para busca por data agendada
CREATE INDEX IF NOT EXISTS idx_trainings_scheduled_date ON trainings(scheduled_date);

-- Índice para status de compartilhamento
CREATE INDEX IF NOT EXISTS idx_trainings_share_status ON trainings(share_status);

-- Índice para tokens de compartilhamento válidos
CREATE INDEX IF NOT EXISTS idx_trainings_share_token ON trainings(share_token) 
    WHERE share_status IN ('public', 'shared');

-- Índice para compartilhamentos válidos (não expirados) - removido predicado NOW() por não ser IMMUTABLE
CREATE INDEX IF NOT EXISTS idx_trainings_share_valid ON trainings(share_status, share_expires_at) 
    WHERE share_status = 'shared';

-- Índice composto para busca do usuário + ordenação por data
CREATE INDEX IF NOT EXISTS idx_trainings_user_date ON trainings(created_by, scheduled_date DESC);

-- Índice para limpeza de tokens expirados
CREATE INDEX IF NOT EXISTS idx_trainings_expired_tokens ON trainings(share_expires_at) 
    WHERE share_expires_at IS NOT NULL;



-- ==========================================
-- 5. ÍNDICES PARA TABELA TRAINING_BLOCKS
-- ==========================================

-- Índice para busca por treino
CREATE INDEX IF NOT EXISTS idx_training_blocks_training ON training_blocks(training_id);

-- Índice para ordenação por ordem
CREATE INDEX IF NOT EXISTS idx_training_blocks_order ON training_blocks(training_id, order_index);

-- Índice para busca por tipo de bloco
CREATE INDEX IF NOT EXISTS idx_training_blocks_type ON training_blocks(block_type);



-- ==========================================
-- 6. ÍNDICES PARA TABELA EXERCISE_PRESCRIPTIONS
-- ==========================================

-- Índice para busca por bloco de treino
CREATE INDEX IF NOT EXISTS idx_prescriptions_block ON exercise_prescriptions(training_block_id);

-- Índice para busca por exercício
CREATE INDEX IF NOT EXISTS idx_prescriptions_exercise ON exercise_prescriptions(exercise_id);

-- Índice para ordenação por ordem
CREATE INDEX IF NOT EXISTS idx_prescriptions_order ON exercise_prescriptions(training_block_id, order_index);

-- Índice para busca por número de séries
CREATE INDEX IF NOT EXISTS idx_prescriptions_sets ON exercise_prescriptions(sets);

-- Índice para busca por RPE (intensidade percebida)
CREATE INDEX IF NOT EXISTS idx_prescriptions_rpe ON exercise_prescriptions(rpe) 
    WHERE rpe IS NOT NULL;

-- Índice para busca por percentual de 1RM
CREATE INDEX IF NOT EXISTS idx_prescriptions_percentage ON exercise_prescriptions(percentage_1rm) 
    WHERE percentage_1rm IS NOT NULL;



-- ==========================================
-- 7. ÍNDICES PARA TABELAS DE REFERÊNCIA
-- ==========================================

-- Índice para busca por nome nos padrões de movimento
CREATE INDEX IF NOT EXISTS idx_movement_patterns_name ON movement_patterns(name);

-- Índice para busca por nome nos focos de semana
CREATE INDEX IF NOT EXISTS idx_week_focuses_name ON week_focuses(name);

-- Índice para busca por intensidade nos focos
CREATE INDEX IF NOT EXISTS idx_week_focuses_intensity ON week_focuses(intensity_percentage);



-- ==========================================
-- 8. ÍNDICES DE AUDITORIA (TIMESTAMPS)
-- ==========================================

-- Índices para ordenação por data de criação (relatórios)
CREATE INDEX IF NOT EXISTS idx_exercises_created_at ON exercises(created_at);
CREATE INDEX IF NOT EXISTS idx_training_weeks_created_at ON training_weeks(created_at);
CREATE INDEX IF NOT EXISTS idx_trainings_created_at ON trainings(created_at);

-- Índices para ordenação por data de atualização (sincronização)
CREATE INDEX IF NOT EXISTS idx_exercises_updated_at ON exercises(updated_at);
CREATE INDEX IF NOT EXISTS idx_training_weeks_updated_at ON training_weeks(updated_at);
CREATE INDEX IF NOT EXISTS idx_trainings_updated_at ON trainings(updated_at);



-- ==========================================
-- 9. VERIFICAÇÃO DOS ÍNDICES CRIADOS
-- ==========================================



SELECT 
    schemaname as "Schema",
    tablename as "Tabela", 
    indexname as "Índice",
    CASE 
        WHEN indexdef LIKE '%UNIQUE%' THEN '🔑 Unique'
        WHEN indexdef LIKE '%GIN%' THEN '🌳 GIN'
        WHEN indexdef LIKE '%WHERE%' THEN '🎯 Parcial'
        ELSE '📋 B-tree'
    END as "Tipo"
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname NOT LIKE 'pg_%'
AND indexname NOT LIKE '%pkey'
ORDER BY tablename, indexname;

-- Estatísticas de índices por tabela


SELECT 
    t.tablename as "Tabela",
    COUNT(i.indexname) as "Qtd Índices",
    pg_size_pretty(pg_total_relation_size(c.oid)) as "Tamanho Total"
FROM pg_tables t
LEFT JOIN pg_indexes i ON t.tablename = i.tablename AND t.schemaname = i.schemaname
LEFT JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
GROUP BY t.tablename, c.oid
ORDER BY t.tablename;

