-- =============================================
-- 01-CREATE-TYPES.sql
-- Criação de todos os tipos customizados (ENUMs)
-- =============================================

\echo '📝 CRIANDO TIPOS CUSTOMIZADOS...'

-- Enum para roles de usuários
CREATE TYPE user_role AS ENUM (
    'owner',    -- Proprietário: acesso total
    'admin',    -- Administrador: acesso total  
    'viewer',   -- Usuário padrão: leitura própria + edição própria
    'guest'     -- Visitante: sem acesso aos dados
);

-- Enum para status de semanas de treino
CREATE TYPE week_status AS ENUM (
    'draft',      -- Rascunho
    'active',     -- Ativa
    'completed',  -- Concluída
    'archived'    -- Arquivada
);

-- Enum para status de compartilhamento
CREATE TYPE share_status AS ENUM (
    'private',    -- Privado
    'public',     -- Público
    'shared'      -- Compartilhado com link
);

-- Enum para tipos de blocos de treino
CREATE TYPE block_type AS ENUM (
    'MOBILIDADE_ARTICULAR',     -- Mobilidade articular
    'ATIVACAO_CORE',           -- Ativação do core
    'ATIVACAO_NEURAL',         -- Ativação neural
    'TREINO_PRINCIPAL',        -- Treino principal
    'CONDICIONAMENTO_FISICO'   -- Condicionamento físico
);

-- Enum para tipos de prescrição de exercícios
CREATE TYPE prescription_type AS ENUM (
    'reps',           -- Repetições
    'time',           -- Tempo
    'distance',       -- Distância
    'weight',         -- Peso
    'percentage'      -- Porcentagem
);

\echo '✅ TIPOS CUSTOMIZADOS CRIADOS COM SUCESSO!'

-- Verificação
SELECT 
    typname as "Tipo",
    CASE typtype
        WHEN 'e' THEN 'ENUM'
        ELSE 'Outro'
    END as "Categoria"
FROM pg_type t
LEFT JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
AND typname IN ('user_role', 'week_status', 'share_status', 'block_type', 'prescription_type')
ORDER BY typname;

\echo '📋 Próximo passo: Execute 02-create-tables.sql'