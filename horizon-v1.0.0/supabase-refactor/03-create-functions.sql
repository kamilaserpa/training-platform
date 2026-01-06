-- =============================================
-- 03-CREATE-FUNCTIONS.sql
-- Criação de funções auxiliares para o sistema
-- =============================================

\echo '⚙️  CRIANDO FUNÇÕES AUXILIARES...'

-- ==========================================
-- 1. FUNÇÃO PARA AUTO-PREENCHER created_by
-- ⚠️  FUNÇÃO CRÍTICA: Preenche automaticamente created_by quando necessário
-- ==========================================
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

COMMENT ON FUNCTION auto_fill_created_by() IS 'Preenche automaticamente o campo created_by com auth.uid() quando não fornecido';

-- ==========================================
-- 2. FUNÇÃO PARA OBTER ROLE DO USUÁRIO
-- ⚠️  IMPORTANTE: Usa SECURITY DEFINER para contornar RLS
-- ==========================================
CREATE OR REPLACE FUNCTION get_user_role() 
RETURNS TEXT AS $$
DECLARE
    user_role_val TEXT;
BEGIN
    -- Usar query direta sem RLS para evitar recursão infinita
    SELECT role::TEXT INTO user_role_val
    FROM users 
    WHERE id = auth.uid();
    
    RETURN COALESCE(user_role_val, 'guest');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'guest'; -- Em caso de erro, assume guest
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION get_user_role() IS 'Retorna a role do usuário autenticado atual (contorna RLS para evitar recursão)';

-- ==========================================
-- 3. FUNÇÃO AUXILIAR PARA VERIFICAR ROLE SEM RECURSÃO
-- ⚠️  Uso interno apenas - para políticas RLS
-- ==========================================
CREATE OR REPLACE FUNCTION check_user_has_role(target_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role::TEXT = target_role
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION check_user_has_role(TEXT) IS 'Verifica se usuário possui role específica (uso interno em políticas RLS)';

-- ==========================================
-- 2. FUNÇÃO PARA VERIFICAR SE USUÁRIO É OWNER/ADMIN
-- ==========================================
CREATE OR REPLACE FUNCTION is_admin_or_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('owner', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION is_admin_or_owner() IS 'Verifica se o usuário atual é owner ou admin';

-- ==========================================
-- 3. FUNÇÃO PARA VERIFICAR SE USUÁRIO PODE CRIAR CONTEÚDO
-- ==========================================
CREATE OR REPLACE FUNCTION can_create_content()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('owner', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION can_create_content() IS 'Verifica se o usuário pode criar novo conteúdo';

-- ==========================================
-- 4. FUNÇÃO PARA VERIFICAR SE USUÁRIO PODE EDITAR REGISTRO
-- ==========================================
CREATE OR REPLACE FUNCTION can_edit_record(record_owner UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val TEXT;
BEGIN
    user_role_val := get_user_role();
    
    RETURN CASE 
        WHEN user_role_val IN ('owner', 'admin') THEN true
        WHEN user_role_val = 'viewer' AND auth.uid() = record_owner THEN true
        ELSE false
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION can_edit_record(UUID) IS 'Verifica se o usuário pode editar um registro específico';

-- ==========================================
-- 5. FUNÇÃO PARA VERIFICAR SE USUÁRIO PODE DELETAR REGISTRO
-- ==========================================
CREATE OR REPLACE FUNCTION can_delete_record(record_owner UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val TEXT;
BEGIN
    user_role_val := get_user_role();
    
    RETURN user_role_val IN ('owner', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION can_delete_record(UUID) IS 'Verifica se o usuário pode deletar um registro (apenas owner/admin)';

-- ==========================================
-- 6. FUNÇÃO PARA VERIFICAR SE USUÁRIO PODE VER REGISTRO
-- ==========================================
CREATE OR REPLACE FUNCTION can_view_record(record_owner UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val TEXT;
BEGIN
    user_role_val := get_user_role();
    
    RETURN CASE 
        WHEN user_role_val IN ('owner', 'admin') THEN true
        WHEN user_role_val = 'viewer' AND auth.uid() = record_owner THEN true
        ELSE false
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION can_view_record(UUID) IS 'Verifica se o usuário pode visualizar um registro';

-- ==========================================
-- 7. FUNÇÃO PARA CRIAR USUÁRIO INICIAL (OWNER)
-- ==========================================
CREATE OR REPLACE FUNCTION create_initial_owner(
    user_id UUID,
    user_email TEXT,
    user_name TEXT
)
RETURNS void AS $$
BEGIN
    INSERT INTO users (id, email, name, role, created_at, updated_at)
    VALUES (user_id, user_email, user_name, 'owner', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        role = 'owner',
        updated_at = NOW()
    WHERE users.role != 'owner'; -- Só atualiza se não for owner já
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION create_initial_owner(UUID, TEXT, TEXT) IS 'Cria ou atualiza usuário como owner (para setup inicial)';

-- ==========================================
-- 8. FUNÇÃO PARA GERAR TOKEN DE COMPARTILHAMENTO
-- ==========================================
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS UUID AS $$
BEGIN
    RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

-- Comentário da função
COMMENT ON FUNCTION generate_share_token() IS 'Gera um novo token UUID para compartilhamento';

-- ==========================================
-- 9. FUNÇÃO PARA VALIDAR SE TREINO PODE SER COMPARTILHADO
-- ==========================================
CREATE OR REPLACE FUNCTION can_share_training(training_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    training_owner UUID;
BEGIN
    SELECT created_by INTO training_owner
    FROM trainings 
    WHERE id = training_id;
    
    RETURN can_edit_record(training_owner);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION can_share_training(UUID) IS 'Verifica se o usuário pode compartilhar um treino específico';

-- ==========================================
-- 10. FUNÇÃO DE LIMPEZA DE TOKENS EXPIRADOS
-- ==========================================
CREATE OR REPLACE FUNCTION cleanup_expired_share_tokens()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    UPDATE trainings 
    SET 
        share_status = 'private',
        share_token = generate_share_token(),
        share_expires_at = NULL
    WHERE share_expires_at < NOW()
    AND share_status != 'private';
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário da função
COMMENT ON FUNCTION cleanup_expired_share_tokens() IS 'Remove tokens de compartilhamento expirados e retorna quantidade limpa';

-- ==========================================
-- TRIGGERS PARA AUTO-PREENCHIMENTO DE created_by
-- ==========================================

\echo '🔄 CRIANDO TRIGGERS PARA AUTO-PREENCHIMENTO...'

-- Trigger para training_weeks
DROP TRIGGER IF EXISTS trigger_auto_fill_created_by_training_weeks ON training_weeks;
CREATE TRIGGER trigger_auto_fill_created_by_training_weeks
    BEFORE INSERT ON training_weeks
    FOR EACH ROW
    EXECUTE FUNCTION auto_fill_created_by();

-- Trigger para exercises
DROP TRIGGER IF EXISTS trigger_auto_fill_created_by_exercises ON exercises;
CREATE TRIGGER trigger_auto_fill_created_by_exercises
    BEFORE INSERT ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION auto_fill_created_by();

-- Trigger para trainings (quando existir)
DROP TRIGGER IF EXISTS trigger_auto_fill_created_by_trainings ON trainings;
CREATE TRIGGER trigger_auto_fill_created_by_trainings
    BEFORE INSERT ON trainings
    FOR EACH ROW
    EXECUTE FUNCTION auto_fill_created_by();

\echo '✅ Triggers de auto-preenchimento criados com sucesso!'

\echo '✅ FUNÇÕES AUXILIARES CRIADAS COM SUCESSO!'

-- Verificação
SELECT 
    n.nspname as "Schema",
    p.proname as "Função",
    pg_get_function_result(p.oid) as "Retorno",
    CASE 
        WHEN p.prosecdef THEN '🔒 DEFINER'
        ELSE '👤 INVOKER'
    END as "Segurança"
FROM pg_proc p 
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid 
WHERE n.nspname = 'public' 
AND p.proname NOT LIKE 'update_%_updated_at%'
ORDER BY p.proname;

\echo '📋 Próximo passo: Execute 04-create-policies.sql'