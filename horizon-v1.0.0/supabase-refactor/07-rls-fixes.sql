-- =============================================
-- 07-rls-fixes.sql  
-- Correções avançadas de RLS para evitar recursão
-- Execute APÓS 04-create-policies.sql se houver problemas
-- =============================================

\echo '🔧 APLICANDO CORREÇÕES AVANÇADAS DE RLS...'

-- ==========================================
-- 1. CORREÇÕES PARA TABELA USERS (Anti-Recursão)
-- ==========================================

\echo '👥 Corrigindo políticas da tabela users...'

-- Remover políticas problemáticas que podem causar recursão
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;  
DROP POLICY IF EXISTS "users_delete_policy" ON users;

-- Políticas ULTRA SIMPLES (sem subconsultas)
-- SELECT: Usuário só vê próprio registro
CREATE POLICY "users_select_own" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- UPDATE: Usuário só pode atualizar próprio registro
CREATE POLICY "users_update_own" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- DELETE: Ninguém pode deletar (segurança máxima)
CREATE POLICY "users_no_delete" ON users
    FOR DELETE TO authenticated
    USING (false);

\echo '✅ Políticas de users corrigidas - sem recursão'

-- ==========================================
-- 2. POLÍTICAS FLEXÍVEIS PARA TRAINING_WEEKS
-- ==========================================

\echo '📅 Aplicando políticas flexíveis para training_weeks...'

-- Permitir temporarily created_by NULL (desenvolvimento)
ALTER TABLE training_weeks ALTER COLUMN created_by DROP NOT NULL;

-- Remover políticas existentes
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'training_weeks'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol_name) || ' ON training_weeks';
    END LOOP;
END $$;

-- POLÍTICAS FLEXÍVEIS PARA DESENVOLVIMENTO
CREATE POLICY "training_weeks_select_flexible" ON training_weeks
    FOR SELECT TO authenticated
    USING (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL
    );

CREATE POLICY "training_weeks_insert_flexible" ON training_weeks
    FOR INSERT TO authenticated
    WITH CHECK (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL
    );

CREATE POLICY "training_weeks_update_flexible" ON training_weeks
    FOR UPDATE TO authenticated
    USING (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL
    )
    WITH CHECK (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL
    );

CREATE POLICY "training_weeks_delete_flexible" ON training_weeks
    FOR DELETE TO authenticated
    USING (
        created_by = auth.uid() OR 
        created_by IS NULL OR
        auth.uid() IS NULL
    );

\echo '✅ Políticas flexíveis aplicadas - desenvolvimento friendly'

-- ==========================================
-- 3. FUNÇÃO AUTO-PREENCHIMENTO CREATED_BY
-- ==========================================

\echo '🔄 Criando função de auto-preenchimento...'

-- Função para auto-preencher created_by
CREATE OR REPLACE FUNCTION auto_fill_created_by()
RETURNS TRIGGER AS $$
BEGIN
    -- Se created_by não foi fornecido, tentar preencher com auth.uid()
    IF NEW.created_by IS NULL THEN
        NEW.created_by := auth.uid();
    END IF;
    
    -- Se ainda é null (desenvolvimento), deixar null mesmo
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela
DROP TRIGGER IF EXISTS trigger_auto_fill_created_by ON training_weeks;
CREATE TRIGGER trigger_auto_fill_created_by
    BEFORE INSERT ON training_weeks
    FOR EACH ROW
    EXECUTE FUNCTION auto_fill_created_by();

\echo '✅ Auto-preenchimento de created_by configurado'

-- ==========================================
-- 4. POLÍTICAS PÚBLICAS PARA MOVEMENT_PATTERNS
-- ==========================================

\echo '🎯 Configurando políticas públicas para movement_patterns...'

-- Remover políticas existentes
DO $$
DECLARE pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'movement_patterns'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol_name) || ' ON movement_patterns';
    END LOOP;
END $$;

-- Criar políticas públicas (mais permissivas)
CREATE POLICY "movement_patterns_select_public" ON movement_patterns 
    FOR SELECT TO authenticated 
    USING (true);

CREATE POLICY "movement_patterns_insert_public" ON movement_patterns 
    FOR INSERT TO authenticated 
    WITH CHECK (true);

CREATE POLICY "movement_patterns_update_public" ON movement_patterns 
    FOR UPDATE TO authenticated 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "movement_patterns_delete_public" ON movement_patterns 
    FOR DELETE TO authenticated 
    USING (true);

\echo '✅ Movement patterns configurado como dados públicos'

-- ==========================================
-- 5. VALIDAÇÃO DAS CORREÇÕES
-- ==========================================

\echo '🧪 Validando correções aplicadas...'

-- Verificar políticas criadas
SELECT 
    'Políticas Corrigidas' as categoria,
    tablename,
    COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'training_weeks', 'movement_patterns')
GROUP BY tablename
ORDER BY tablename;

-- Testar inserção básica
INSERT INTO training_weeks (
    name,
    week_focus_id,
    start_date,
    end_date,
    status
) VALUES (
    'Teste RLS Fix',
    (SELECT id FROM week_focuses LIMIT 1),
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    'draft'
);

-- Verificar se funcionou
SELECT 
    'Teste de Inserção' as resultado,
    CASE 
        WHEN EXISTS (SELECT 1 FROM training_weeks WHERE name = 'Teste RLS Fix')
        THEN '✅ Inserção bem-sucedida'
        ELSE '❌ Falha na inserção'
    END as status;

-- Limpar teste
DELETE FROM training_weeks WHERE name = 'Teste RLS Fix';

\echo '🎉 CORREÇÕES DE RLS APLICADAS COM SUCESSO!'
\echo '⚠️  IMPORTANTE: Para produção, considere tornar created_by NOT NULL novamente'
\echo '⚠️  IMPORTANTE: Remover condições "auth.uid() IS NULL" em produção'