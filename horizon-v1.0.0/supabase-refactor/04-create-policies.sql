-- =============================================
-- 04-CREATE-POLICIES.sql
-- Criação de todas as políticas RLS baseadas em roles
-- =============================================

\echo '🔐 CRIANDO POLÍTICAS RLS BASEADAS EM ROLES...'

-- ==========================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ==========================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_focuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_prescriptions ENABLE ROW LEVEL SECURITY;

\echo '✅ RLS habilitado em todas as tabelas'

-- ==========================================
-- 1. POLÍTICAS PARA TABELA USERS
-- ⚠️  IMPORTANTE: Não usa get_user_role() para evitar recursão
-- ==========================================

-- Leitura: Consulta direta sem recursão
CREATE POLICY "users_select_policy" ON users
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND (u.role IN ('owner', 'admin') OR u.id = users.id)
        )
    );

-- Inserção: Apenas durante signup (handled by trigger)
CREATE POLICY "users_insert_policy" ON users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

-- Atualização: Consulta direta sem recursão
CREATE POLICY "users_update_policy" ON users
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND (u.role IN ('owner', 'admin') OR u.id = users.id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND (
                u.role IN ('owner', 'admin') 
                OR (u.id = users.id AND users.role = u.role) -- Viewer não pode mudar própria role
            )
        )
    );

-- Exclusão: Apenas Owner (consulta direta)
CREATE POLICY "users_delete_policy" ON users
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() 
            AND u.role = 'owner'
        )
    );

-- ==========================================
-- 2. POLÍTICAS PARA MOVEMENT_PATTERNS (Dados Públicos)
-- ==========================================

-- Leitura: Todos usuários autenticados
CREATE POLICY "movement_patterns_select_policy" ON movement_patterns
    FOR SELECT TO authenticated
    USING (true);

-- Inserção: Apenas Owner/Admin
CREATE POLICY "movement_patterns_insert_policy" ON movement_patterns
    FOR INSERT TO authenticated
    WITH CHECK (is_admin_or_owner());

-- Atualização: Apenas Owner/Admin  
CREATE POLICY "movement_patterns_update_policy" ON movement_patterns
    FOR UPDATE TO authenticated
    USING (is_admin_or_owner())
    WITH CHECK (is_admin_or_owner());

-- Exclusão: Apenas Owner
CREATE POLICY "movement_patterns_delete_policy" ON movement_patterns
    FOR DELETE TO authenticated
    USING (get_user_role() = 'owner');

-- ==========================================
-- 3. POLÍTICAS PARA WEEK_FOCUSES (Dados Públicos)
-- ==========================================

-- Leitura: Todos usuários autenticados
CREATE POLICY "week_focuses_select_policy" ON week_focuses
    FOR SELECT TO authenticated
    USING (true);

-- Inserção: Apenas Owner/Admin
CREATE POLICY "week_focuses_insert_policy" ON week_focuses
    FOR INSERT TO authenticated
    WITH CHECK (is_admin_or_owner());

-- Atualização: Apenas Owner/Admin
CREATE POLICY "week_focuses_update_policy" ON week_focuses
    FOR UPDATE TO authenticated
    USING (is_admin_or_owner())
    WITH CHECK (is_admin_or_owner());

-- Exclusão: Apenas Owner
CREATE POLICY "week_focuses_delete_policy" ON week_focuses
    FOR DELETE TO authenticated
    USING (get_user_role() = 'owner');

-- ==========================================
-- 4. POLÍTICAS PARA EXERCISES (Dados Por Usuário - FLEXÍVEL)
-- ==========================================

-- Leitura: Ver próprios registros OU registros sem dono (dev)
CREATE POLICY "exercises_select_policy" ON exercises
    FOR SELECT TO authenticated
    USING (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL -- Para desenvolvimento local
    );

-- Inserção: Permitir criação para usuários autenticados
CREATE POLICY "exercises_insert_policy" ON exercises
    FOR INSERT TO authenticated
    WITH CHECK (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL -- Para desenvolvimento local
    );

-- Atualização: Atualizar próprios registros
CREATE POLICY "exercises_update_policy" ON exercises
    FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL -- Para desenvolvimento local
    )
    WITH CHECK (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL -- Para desenvolvimento local
    );

-- Exclusão: Deletar próprios registros
CREATE POLICY "exercises_delete_policy" ON exercises
    FOR DELETE TO authenticated
    USING (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL -- Para desenvolvimento local
    );

-- ==========================================
-- 5. POLÍTICAS PARA TRAINING_WEEKS (Dados Por Usuário - FLEXÍVEL)
-- ==========================================

-- Leitura: Ver próprios registros OU registros sem dono (dev)
CREATE POLICY "training_weeks_select_policy" ON training_weeks
    FOR SELECT TO authenticated
    USING (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL -- Para desenvolvimento local
    );

-- Inserção: Permitir criação para usuários autenticados
CREATE POLICY "training_weeks_insert_policy" ON training_weeks
    FOR INSERT TO authenticated
    WITH CHECK (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL -- Para desenvolvimento local
    );

-- Atualização: Atualizar próprios registros
CREATE POLICY "training_weeks_update_policy" ON training_weeks
    FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL -- Para desenvolvimento local
    )
    WITH CHECK (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL -- Para desenvolvimento local
    );

-- Exclusão: Deletar próprios registros
CREATE POLICY "training_weeks_delete_policy" ON training_weeks
    FOR DELETE TO authenticated
    USING (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL -- Para desenvolvimento local
    );

-- ==========================================
-- 6. POLÍTICAS PARA TRAININGS (Dados Por Usuário + Compartilhamento)
-- ==========================================

-- Leitura: Ownership + compartilhamento público
CREATE POLICY "trainings_select_policy" ON trainings
    FOR SELECT TO authenticated
    USING (
        can_view_record(created_by)
        OR (share_status = 'public')
        OR (share_status = 'shared' AND share_expires_at > NOW())
    );

-- Leitura para não-autenticados (apenas públicos)
CREATE POLICY "trainings_select_anon_policy" ON trainings
    FOR SELECT TO anon
    USING (share_status = 'public');

-- Inserção: Owner/Admin podem criar
CREATE POLICY "trainings_insert_policy" ON trainings
    FOR INSERT TO authenticated
    WITH CHECK (
        can_create_content() 
        AND auth.uid() = created_by
    );

-- Atualização: Baseada em ownership
CREATE POLICY "trainings_update_policy" ON trainings
    FOR UPDATE TO authenticated
    USING (can_edit_record(created_by))
    WITH CHECK (can_edit_record(created_by));

-- Exclusão: Apenas Owner/Admin
CREATE POLICY "trainings_delete_policy" ON trainings
    FOR DELETE TO authenticated
    USING (can_delete_record(created_by));

-- ==========================================
-- 7. POLÍTICAS PARA TRAINING_BLOCKS (Herdam de Training)
-- ==========================================

-- Leitura: Baseada no training pai
CREATE POLICY "training_blocks_select_policy" ON training_blocks
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM trainings t 
            WHERE t.id = training_id 
            AND (
                can_view_record(t.created_by)
                OR t.share_status = 'public'
                OR (t.share_status = 'shared' AND t.share_expires_at > NOW())
            )
        )
    );

-- Leitura para não-autenticados
CREATE POLICY "training_blocks_select_anon_policy" ON training_blocks
    FOR SELECT TO anon
    USING (
        EXISTS (
            SELECT 1 FROM trainings t 
            WHERE t.id = training_id 
            AND t.share_status = 'public'
        )
    );

-- Inserção: Baseada no training pai
CREATE POLICY "training_blocks_insert_policy" ON training_blocks
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trainings t 
            WHERE t.id = training_id 
            AND can_edit_record(t.created_by)
        )
    );

-- Atualização: Baseada no training pai
CREATE POLICY "training_blocks_update_policy" ON training_blocks
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM trainings t 
            WHERE t.id = training_id 
            AND can_edit_record(t.created_by)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trainings t 
            WHERE t.id = training_id 
            AND can_edit_record(t.created_by)
        )
    );

-- Exclusão: Baseada no training pai
CREATE POLICY "training_blocks_delete_policy" ON training_blocks
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM trainings t 
            WHERE t.id = training_id 
            AND can_delete_record(t.created_by)
        )
    );

-- ==========================================
-- 8. POLÍTICAS PARA EXERCISE_PRESCRIPTIONS (Herdam de Training Block)
-- ==========================================

-- Leitura: Baseada no training avô
CREATE POLICY "exercise_prescriptions_select_policy" ON exercise_prescriptions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM training_blocks tb
            JOIN trainings t ON t.id = tb.training_id
            WHERE tb.id = training_block_id 
            AND (
                can_view_record(t.created_by)
                OR t.share_status = 'public'
                OR (t.share_status = 'shared' AND t.share_expires_at > NOW())
            )
        )
    );

-- Leitura para não-autenticados
CREATE POLICY "exercise_prescriptions_select_anon_policy" ON exercise_prescriptions
    FOR SELECT TO anon
    USING (
        EXISTS (
            SELECT 1 FROM training_blocks tb
            JOIN trainings t ON t.id = tb.training_id
            WHERE tb.id = training_block_id 
            AND t.share_status = 'public'
        )
    );

-- Inserção: Baseada no training avô
CREATE POLICY "exercise_prescriptions_insert_policy" ON exercise_prescriptions
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM training_blocks tb
            JOIN trainings t ON t.id = tb.training_id
            WHERE tb.id = training_block_id 
            AND can_edit_record(t.created_by)
        )
    );

-- Atualização: Baseada no training avô
CREATE POLICY "exercise_prescriptions_update_policy" ON exercise_prescriptions
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM training_blocks tb
            JOIN trainings t ON t.id = tb.training_id
            WHERE tb.id = training_block_id 
            AND can_edit_record(t.created_by)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM training_blocks tb
            JOIN trainings t ON t.id = tb.training_id
            WHERE tb.id = training_block_id 
            AND can_edit_record(t.created_by)
        )
    );

-- Exclusão: Baseada no training avô
CREATE POLICY "exercise_prescriptions_delete_policy" ON exercise_prescriptions
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM training_blocks tb
            JOIN trainings t ON t.id = tb.training_id
            WHERE tb.id = training_block_id 
            AND can_delete_record(t.created_by)
        )
    );

\echo '✅ POLÍTICAS RLS CRIADAS COM SUCESSO!'

-- Verificação
SELECT 
    schemaname as "Schema",
    tablename as "Tabela",
    policyname as "Política",
    cmd as "Operação",
    CASE 
        WHEN roles::text LIKE '%authenticated%' THEN '🔐 Auth'
        WHEN roles::text LIKE '%anon%' THEN '👤 Anon'
        ELSE roles::text
    END as "Roles"
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

\echo '📋 Próximo passo: Execute 05-insert-seed-data.sql'