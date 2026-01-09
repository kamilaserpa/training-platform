-- ==========================================
-- TRAINING PLATFORM - RLS POLICIES
-- Versão: 2.0.0 (Multi-Tenant)
-- Data: Janeiro 2026
-- ==========================================

-- ==========================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_focus ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_block_movement_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- POLÍTICAS: users
-- Isolamento por workspace
-- ==========================================

-- SELECT: Owner vê ele mesmo + usuários do workspace | Admin vê viewers do workspace
CREATE POLICY "users_select_policy"
ON users FOR SELECT
USING (
  -- Ver a si mesmo
  auth.uid() = id
  OR
  -- Owner vê usuários criados por ele
  (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner'
    )
  )
  OR
  -- Admin vê apenas viewers do mesmo workspace
  (
    role = 'viewer'
    AND owner_id IN (
      SELECT owner_id FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- INSERT: Apenas owners podem criar admins/viewers
CREATE POLICY "users_insert_policy"
ON users FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'owner'
  )
  AND owner_id = auth.uid()
  AND role IN ('admin', 'viewer')
);

-- UPDATE: Owner pode atualizar ele mesmo + usuários do workspace
CREATE POLICY "users_update_policy"
ON users FOR UPDATE
USING (
  auth.uid() = id
  OR
  (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner'
    )
  )
)
WITH CHECK (
  auth.uid() = id
  OR
  auth.uid() = owner_id
);

-- DELETE: Owner pode deletar usuários do workspace (exceto ele mesmo)
CREATE POLICY "users_delete_policy"
ON users FOR DELETE
USING (
  auth.uid() = owner_id
  AND auth.uid() != id
  AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner'
  )
);

-- ==========================================
-- POLÍTICAS: week_focus
-- Apenas owner vê seus próprios focos
-- ==========================================

-- SELECT: Ver apenas focos criados pelo owner do workspace
CREATE POLICY "week_focus_select_policy"
ON week_focus FOR SELECT
USING (
  created_by = auth.uid()
  OR
  created_by IN (
    SELECT id FROM users 
    WHERE id = auth.uid() OR owner_id = auth.uid()
  )
);

-- INSERT: Apenas owners podem criar
CREATE POLICY "week_focus_insert_policy"
ON week_focus FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- UPDATE: Apenas quem criou pode atualizar
CREATE POLICY "week_focus_update_policy"
ON week_focus FOR UPDATE
USING (
  created_by = auth.uid()
)
WITH CHECK (
  created_by = auth.uid()
);

-- DELETE: Apenas quem criou pode deletar
CREATE POLICY "week_focus_delete_policy"
ON week_focus FOR DELETE
USING (
  created_by = auth.uid()
);

-- ==========================================
-- POLÍTICAS: movement_patterns
-- Apenas owner vê seus próprios padrões
-- ==========================================

-- SELECT
CREATE POLICY "movement_patterns_select_policy"
ON movement_patterns FOR SELECT
USING (
  created_by = auth.uid()
  OR
  created_by IN (
    SELECT id FROM users 
    WHERE id = auth.uid() OR owner_id = auth.uid()
  )
);

-- INSERT
CREATE POLICY "movement_patterns_insert_policy"
ON movement_patterns FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- UPDATE
CREATE POLICY "movement_patterns_update_policy"
ON movement_patterns FOR UPDATE
USING (
  created_by = auth.uid()
)
WITH CHECK (
  created_by = auth.uid()
);

-- DELETE
CREATE POLICY "movement_patterns_delete_policy"
ON movement_patterns FOR DELETE
USING (
  created_by = auth.uid()
);

-- ==========================================
-- POLÍTICAS: exercises
-- Apenas owner vê seus próprios exercícios
-- ==========================================

-- SELECT
CREATE POLICY "exercises_select_policy"
ON exercises FOR SELECT
USING (
  created_by = auth.uid()
  OR
  created_by IN (
    SELECT id FROM users 
    WHERE id = auth.uid() OR owner_id = auth.uid()
  )
);

-- INSERT
CREATE POLICY "exercises_insert_policy"
ON exercises FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- UPDATE
CREATE POLICY "exercises_update_policy"
ON exercises FOR UPDATE
USING (
  created_by = auth.uid()
)
WITH CHECK (
  created_by = auth.uid()
);

-- DELETE
CREATE POLICY "exercises_delete_policy"
ON exercises FOR DELETE
USING (
  created_by = auth.uid()
);

-- ==========================================
-- POLÍTICAS: training_weeks
-- Apenas owner vê suas próprias semanas
-- ==========================================

-- SELECT
CREATE POLICY "training_weeks_select_policy"
ON training_weeks FOR SELECT
USING (
  created_by = auth.uid()
  OR
  created_by IN (
    SELECT id FROM users 
    WHERE id = auth.uid() OR owner_id = auth.uid()
  )
);

-- INSERT
CREATE POLICY "training_weeks_insert_policy"
ON training_weeks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- UPDATE
CREATE POLICY "training_weeks_update_policy"
ON training_weeks FOR UPDATE
USING (
  created_by = auth.uid()
)
WITH CHECK (
  created_by = auth.uid()
);

-- DELETE
CREATE POLICY "training_weeks_delete_policy"
ON training_weeks FOR DELETE
USING (
  created_by = auth.uid()
);

-- ==========================================
-- POLÍTICAS: trainings
-- Owner vê seus treinos + treinos públicos compartilhados
-- ==========================================

-- SELECT: Ver treinos do workspace OU treinos públicos
CREATE POLICY "trainings_select_policy"
ON trainings FOR SELECT
USING (
  -- Treinos criados pelo owner do workspace
  created_by = auth.uid()
  OR
  created_by IN (
    SELECT id FROM users 
    WHERE id = auth.uid() OR owner_id = auth.uid()
  )
  OR
  -- Treinos públicos (via token)
  share_status = 'public'
);

-- INSERT
CREATE POLICY "trainings_insert_policy"
ON trainings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- UPDATE
CREATE POLICY "trainings_update_policy"
ON trainings FOR UPDATE
USING (
  created_by = auth.uid()
)
WITH CHECK (
  created_by = auth.uid()
);

-- DELETE
CREATE POLICY "trainings_delete_policy"
ON trainings FOR DELETE
USING (
  created_by = auth.uid()
);

-- ==========================================
-- POLÍTICAS: training_blocks
-- Herda permissões do training pai
-- ==========================================

-- SELECT: Ver blocos de treinos acessíveis
CREATE POLICY "training_blocks_select_policy"
ON training_blocks FOR SELECT
USING (
  training_id IN (
    SELECT id FROM trainings
    WHERE created_by = auth.uid()
    OR created_by IN (
      SELECT id FROM users 
      WHERE id = auth.uid() OR owner_id = auth.uid()
    )
    OR share_status = 'public'
  )
);

-- INSERT: Criar blocos em treinos próprios
CREATE POLICY "training_blocks_insert_policy"
ON training_blocks FOR INSERT
WITH CHECK (
  training_id IN (
    SELECT id FROM trainings WHERE created_by = auth.uid()
  )
);

-- UPDATE: Atualizar blocos de treinos próprios
CREATE POLICY "training_blocks_update_policy"
ON training_blocks FOR UPDATE
USING (
  training_id IN (
    SELECT id FROM trainings WHERE created_by = auth.uid()
  )
)
WITH CHECK (
  training_id IN (
    SELECT id FROM trainings WHERE created_by = auth.uid()
  )
);

-- DELETE: Deletar blocos de treinos próprios
CREATE POLICY "training_blocks_delete_policy"
ON training_blocks FOR DELETE
USING (
  training_id IN (
    SELECT id FROM trainings WHERE created_by = auth.uid()
  )
);

-- ==========================================
-- POLÍTICAS: exercise_prescriptions
-- Herda permissões do training_block pai
-- ==========================================

-- SELECT
CREATE POLICY "exercise_prescriptions_select_policy"
ON exercise_prescriptions FOR SELECT
USING (
  training_block_id IN (
    SELECT tb.id FROM training_blocks tb
    JOIN trainings t ON tb.training_id = t.id
    WHERE t.created_by = auth.uid()
    OR t.created_by IN (
      SELECT id FROM users 
      WHERE id = auth.uid() OR owner_id = auth.uid()
    )
    OR t.share_status = 'public'
  )
);

-- INSERT
CREATE POLICY "exercise_prescriptions_insert_policy"
ON exercise_prescriptions FOR INSERT
WITH CHECK (
  training_block_id IN (
    SELECT tb.id FROM training_blocks tb
    JOIN trainings t ON tb.training_id = t.id
    WHERE t.created_by = auth.uid()
  )
);

-- UPDATE
CREATE POLICY "exercise_prescriptions_update_policy"
ON exercise_prescriptions FOR UPDATE
USING (
  training_block_id IN (
    SELECT tb.id FROM training_blocks tb
    JOIN trainings t ON tb.training_id = t.id
    WHERE t.created_by = auth.uid()
  )
)
WITH CHECK (
  training_block_id IN (
    SELECT tb.id FROM training_blocks tb
    JOIN trainings t ON tb.training_id = t.id
    WHERE t.created_by = auth.uid()
  )
);

-- DELETE
CREATE POLICY "exercise_prescriptions_delete_policy"
ON exercise_prescriptions FOR DELETE
USING (
  training_block_id IN (
    SELECT tb.id FROM training_blocks tb
    JOIN trainings t ON tb.training_id = t.id
    WHERE t.created_by = auth.uid()
  )
);

-- ==========================================
-- POLÍTICAS: training_block_movement_patterns
-- Herda permissões do training_block pai
-- ==========================================

-- SELECT
CREATE POLICY "tbmp_select_policy"
ON training_block_movement_patterns FOR SELECT
USING (
  training_block_id IN (
    SELECT tb.id FROM training_blocks tb
    JOIN trainings t ON tb.training_id = t.id
    WHERE t.created_by = auth.uid()
    OR t.created_by IN (
      SELECT id FROM users 
      WHERE id = auth.uid() OR owner_id = auth.uid()
    )
    OR t.share_status = 'public'
  )
);

-- INSERT
CREATE POLICY "tbmp_insert_policy"
ON training_block_movement_patterns FOR INSERT
WITH CHECK (
  training_block_id IN (
    SELECT tb.id FROM training_blocks tb
    JOIN trainings t ON tb.training_id = t.id
    WHERE t.created_by = auth.uid()
  )
);

-- DELETE
CREATE POLICY "tbmp_delete_policy"
ON training_block_movement_patterns FOR DELETE
USING (
  training_block_id IN (
    SELECT tb.id FROM training_blocks tb
    JOIN trainings t ON tb.training_id = t.id
    WHERE t.created_by = auth.uid()
  )
);

-- ==========================================
-- POLÍTICAS: user_permissions
-- Apenas owner gerencia permissões
-- ==========================================

-- SELECT: Ver permissões do workspace
CREATE POLICY "user_permissions_select_policy"
ON user_permissions FOR SELECT
USING (
  user_id = auth.uid()
  OR
  granted_by = auth.uid()
  OR
  user_id IN (
    SELECT id FROM users WHERE owner_id = auth.uid()
  )
);

-- INSERT: Apenas owner pode conceder permissões
CREATE POLICY "user_permissions_insert_policy"
ON user_permissions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'owner'
  )
);

-- UPDATE: Apenas owner pode atualizar permissões
CREATE POLICY "user_permissions_update_policy"
ON user_permissions FOR UPDATE
USING (
  granted_by = auth.uid()
)
WITH CHECK (
  granted_by = auth.uid()
);

-- DELETE: Apenas owner pode remover permissões
CREATE POLICY "user_permissions_delete_policy"
ON user_permissions FOR DELETE
USING (
  granted_by = auth.uid()
);

-- ==========================================
-- VERIFICAÇÕES
-- ==========================================

-- Verificar RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS command
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Contar políticas por tabela
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================

DO $$
DECLARE
  v_table_count INTEGER;
  v_policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_table_count
  FROM pg_tables 
  WHERE schemaname = 'public' AND rowsecurity = true;
  
  SELECT COUNT(*) INTO v_policy_count
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  RAISE NOTICE '✅ RLS configurado com sucesso!';
  RAISE NOTICE '🔐 Tabelas com RLS: %', v_table_count;
  RAISE NOTICE '📋 Total de políticas: %', v_policy_count;
  RAISE NOTICE '🎯 Próximo passo: Execute 03-seed-data.sql (opcional)';
END $$;
