-- ==========================================
-- TRAINING PLATFORM - DATABASE SCHEMA
-- Versão: 2.0.0 (Multi-Tenant)
-- Data: Janeiro 2026
-- ==========================================

-- ==========================================
-- EXTENSÕES
-- ==========================================

-- UUID para geração de IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgcrypto para funções criptográficas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- ENUMS
-- ==========================================

-- Roles de usuário
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'viewer');

-- Status de compartilhamento de treinos
CREATE TYPE share_status AS ENUM ('private', 'shared', 'public');

-- Tipos de blocos de treino
CREATE TYPE block_type AS ENUM (
  'MOBILIDADE_ARTICULAR',
  'ATIVACAO_CORE',
  'ATIVACAO_NEURAL',
  'TREINO_PRINCIPAL',
  'CONDICIONAMENTO_FISICO'
);

-- Status de semanas de treino
CREATE TYPE week_status AS ENUM ('draft', 'active', 'completed', 'archived');

-- ==========================================
-- TABELAS
-- ==========================================

-- ------------------------------------------
-- TABELA: users
-- Usuários do sistema com suporte multi-tenant
-- ------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Multi-tenancy: ID do owner do workspace
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true, -- Se o usuário está ativo
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT users_owner_hierarchy_check CHECK (
    -- Owner deve ter owner_id NULL
    (role = 'owner' AND owner_id IS NULL) OR
    -- Admin e Viewer devem ter owner_id
    (role IN ('admin', 'viewer') AND owner_id IS NOT NULL)
  )
);

COMMENT ON TABLE users IS 'Usuários do sistema com suporte a multi-tenancy';
COMMENT ON COLUMN users.owner_id IS 'ID do owner que criou este usuário (NULL para owners)';
COMMENT ON COLUMN users.active IS 'Se o usuário está ativo no sistema';

-- ------------------------------------------
-- TABELA: week_focus
-- Focos/objetivos das semanas de treino
-- ------------------------------------------
CREATE TABLE week_focus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  intensity_percentage INTEGER CHECK (intensity_percentage >= 0 AND intensity_percentage <= 100),
  color_hex TEXT NOT NULL DEFAULT '#3B82F6',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT week_focus_name_check CHECK (length(trim(name)) > 0),
  CONSTRAINT week_focus_color_check CHECK (color_hex ~* '^#[0-9A-Fa-f]{6}$')
);

COMMENT ON TABLE week_focus IS 'Focos e objetivos das semanas de treino';
COMMENT ON COLUMN week_focus.intensity_percentage IS 'Percentual de intensidade do foco (0-100)';

-- ------------------------------------------
-- TABELA: movement_patterns
-- Padrões de movimento (ex: Push, Pull, Squat)
-- ------------------------------------------
CREATE TABLE movement_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT movement_patterns_name_check CHECK (length(trim(name)) > 0)
);

COMMENT ON TABLE movement_patterns IS 'Padrões de movimento (Push, Pull, Squat, etc)';

-- ------------------------------------------
-- TABELA: exercises
-- Biblioteca de exercícios
-- ------------------------------------------
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  movement_pattern_id UUID REFERENCES movement_patterns(id) ON DELETE SET NULL,
  muscle_groups TEXT[], -- Array de grupos musculares
  equipment TEXT[], -- Array de equipamentos necessários
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  instructions TEXT,
  video_url TEXT,
  image_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT exercises_name_check CHECK (length(trim(name)) > 0),
  CONSTRAINT exercises_video_url_check CHECK (video_url IS NULL OR video_url ~* '^https?://'),
  CONSTRAINT exercises_image_url_check CHECK (image_url IS NULL OR image_url ~* '^https?://')
);

COMMENT ON TABLE exercises IS 'Biblioteca de exercícios físicos';
COMMENT ON COLUMN exercises.difficulty_level IS 'Nível de dificuldade de 1 (fácil) a 5 (muito difícil)';

-- ------------------------------------------
-- TABELA: training_weeks
-- Semanas de treino
-- ------------------------------------------
CREATE TABLE training_weeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  week_focus_id UUID NOT NULL REFERENCES week_focus(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status week_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT training_weeks_name_check CHECK (length(trim(name)) > 0),
  CONSTRAINT training_weeks_date_check CHECK (end_date >= start_date)
);

COMMENT ON TABLE training_weeks IS 'Semanas de treino com datas e foco';
COMMENT ON COLUMN training_weeks.start_date IS 'Data de início da semana';
COMMENT ON COLUMN training_weeks.end_date IS 'Data de término da semana';

-- ------------------------------------------
-- TABELA: trainings
-- Treinos individuais dentro de semanas
-- ------------------------------------------
CREATE TABLE trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_week_id UUID NOT NULL REFERENCES training_weeks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 10),
  description TEXT,
  estimated_duration_minutes INTEGER CHECK (estimated_duration_minutes > 0),
  movement_pattern_id UUID REFERENCES movement_patterns(id) ON DELETE SET NULL,
  share_status share_status NOT NULL DEFAULT 'private',
  share_token TEXT UNIQUE, -- Token para compartilhamento público
  share_expires_at TIMESTAMPTZ, -- Data de expiração do compartilhamento
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT trainings_name_check CHECK (length(trim(name)) > 0),
  CONSTRAINT trainings_share_token_check CHECK (
    (share_status = 'public' AND share_token IS NOT NULL) OR
    (share_status != 'public' AND share_token IS NULL)
  )
);

COMMENT ON TABLE trainings IS 'Treinos individuais com blocos de exercícios';
COMMENT ON COLUMN trainings.intensity_level IS 'Nível de intensidade de 1 (leve) a 10 (máxima)';
COMMENT ON COLUMN trainings.share_token IS 'Token único para compartilhamento público';

-- ------------------------------------------
-- TABELA: training_blocks
-- Blocos de exercícios dentro de treinos
-- ------------------------------------------
CREATE TABLE training_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  block_type block_type NOT NULL,
  order_index INTEGER NOT NULL,
  instructions TEXT,
  rest_between_exercises_seconds INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT training_blocks_name_check CHECK (length(trim(name)) > 0),
  CONSTRAINT training_blocks_order_check CHECK (order_index >= 0),
  CONSTRAINT training_blocks_rest_check CHECK (rest_between_exercises_seconds >= 0),
  CONSTRAINT training_blocks_unique_order UNIQUE (training_id, order_index)
);

COMMENT ON TABLE training_blocks IS 'Blocos de exercícios (aquecimento, principal, etc)';
COMMENT ON COLUMN training_blocks.order_index IS 'Ordem de execução do bloco no treino';

-- ------------------------------------------
-- TABELA: exercise_prescriptions
-- Prescrições de exercícios dentro de blocos
-- ------------------------------------------
CREATE TABLE exercise_prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_block_id UUID NOT NULL REFERENCES training_blocks(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
  order_index INTEGER NOT NULL,
  sets INTEGER NOT NULL CHECK (sets > 0),
  reps TEXT, -- Pode ser "10", "8-12", "AMRAP", etc
  weight_kg DECIMAL(6,2) CHECK (weight_kg > 0),
  rest_seconds INTEGER CHECK (rest_seconds >= 0),
  duration_seconds INTEGER CHECK (duration_seconds > 0),
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
  percentage_1rm INTEGER CHECK (percentage_1rm >= 0 AND percentage_1rm <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT exercise_prescriptions_order_check CHECK (order_index >= 0),
  CONSTRAINT exercise_prescriptions_unique_order UNIQUE (training_block_id, order_index)
);

COMMENT ON TABLE exercise_prescriptions IS 'Prescrições detalhadas de exercícios';
COMMENT ON COLUMN exercise_prescriptions.reps IS 'Número de repetições (ex: "10", "8-12", "AMRAP")';
COMMENT ON COLUMN exercise_prescriptions.rpe IS 'Taxa de Esforço Percebido (1-10)';
COMMENT ON COLUMN exercise_prescriptions.percentage_1rm IS 'Percentual da carga máxima (1RM)';

-- ------------------------------------------
-- TABELA: training_block_movement_patterns
-- Relacionamento N:N entre blocos e padrões
-- ------------------------------------------
CREATE TABLE training_block_movement_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_block_id UUID NOT NULL REFERENCES training_blocks(id) ON DELETE CASCADE,
  movement_pattern_id UUID NOT NULL REFERENCES movement_patterns(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT training_block_movement_patterns_unique UNIQUE (training_block_id, movement_pattern_id)
);

COMMENT ON TABLE training_block_movement_patterns IS 'Relacionamento entre blocos de treino e padrões de movimento';

-- ------------------------------------------
-- TABELA: user_permissions
-- Permissões granulares de usuários
-- ------------------------------------------
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL, -- ID do recurso (training_week, training, etc)
  resource_type TEXT NOT NULL CHECK (resource_type IN ('training_week', 'training')),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT user_permissions_unique UNIQUE (resource_id, resource_type, user_id),
  CONSTRAINT user_permissions_expiration_check CHECK (
    expires_at IS NULL OR expires_at > granted_at
  )
);

COMMENT ON TABLE user_permissions IS 'Permissões granulares de acesso a recursos';
COMMENT ON COLUMN user_permissions.resource_id IS 'ID do recurso (semana, treino, etc)';
COMMENT ON COLUMN user_permissions.expires_at IS 'Data de expiração da permissão';

-- ==========================================
-- ÍNDICES
-- ==========================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_owner_id ON users(owner_id);
CREATE INDEX idx_users_active ON users(active);

-- Week Focus
CREATE INDEX idx_week_focus_created_by ON week_focus(created_by);

-- Movement Patterns
CREATE INDEX idx_movement_patterns_created_by ON movement_patterns(created_by);

-- Exercises
CREATE INDEX idx_exercises_movement_pattern_id ON exercises(movement_pattern_id);
CREATE INDEX idx_exercises_created_by ON exercises(created_by);
CREATE INDEX idx_exercises_name_trgm ON exercises USING gin(name gin_trgm_ops); -- Full-text search

-- Training Weeks
CREATE INDEX idx_training_weeks_week_focus_id ON training_weeks(week_focus_id);
CREATE INDEX idx_training_weeks_created_by ON training_weeks(created_by);
CREATE INDEX idx_training_weeks_start_date ON training_weeks(start_date);
CREATE INDEX idx_training_weeks_status ON training_weeks(status);

-- Trainings
CREATE INDEX idx_trainings_training_week_id ON trainings(training_week_id);
CREATE INDEX idx_trainings_created_by ON trainings(created_by);
CREATE INDEX idx_trainings_scheduled_date ON trainings(scheduled_date);
CREATE INDEX idx_trainings_share_token ON trainings(share_token);
CREATE INDEX idx_trainings_share_status ON trainings(share_status);

-- Training Blocks
CREATE INDEX idx_training_blocks_training_id ON training_blocks(training_id);
CREATE INDEX idx_training_blocks_order_index ON training_blocks(training_id, order_index);

-- Exercise Prescriptions
CREATE INDEX idx_exercise_prescriptions_block_id ON exercise_prescriptions(training_block_id);
CREATE INDEX idx_exercise_prescriptions_exercise_id ON exercise_prescriptions(exercise_id);
CREATE INDEX idx_exercise_prescriptions_order ON exercise_prescriptions(training_block_id, order_index);

-- Training Block Movement Patterns
CREATE INDEX idx_tbmp_training_block_id ON training_block_movement_patterns(training_block_id);
CREATE INDEX idx_tbmp_movement_pattern_id ON training_block_movement_patterns(movement_pattern_id);

-- User Permissions
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_resource ON user_permissions(resource_id, resource_type);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_week_focus_updated_at BEFORE UPDATE ON week_focus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movement_patterns_updated_at BEFORE UPDATE ON movement_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_weeks_updated_at BEFORE UPDATE ON training_weeks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_blocks_updated_at BEFORE UPDATE ON training_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_prescriptions_updated_at BEFORE UPDATE ON exercise_prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- FUNÇÕES AUXILIARES
-- ==========================================

-- Gerar token único para compartilhamento
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Verificar se usuário é owner de um workspace
CREATE OR REPLACE FUNCTION is_workspace_owner(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obter owner_id de um usuário (para admins/viewers)
CREATE OR REPLACE FUNCTION get_user_owner_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_owner_id UUID;
  v_role user_role;
BEGIN
  SELECT owner_id, role INTO v_owner_id, v_role
  FROM users 
  WHERE id = user_id;
  
  -- Se for owner, retorna o próprio ID
  IF v_role = 'owner' THEN
    RETURN user_id;
  END IF;
  
  -- Se for admin ou viewer, retorna o owner_id
  RETURN v_owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- COMENTÁRIOS FINAIS
-- ==========================================

COMMENT ON SCHEMA public IS 'Training Platform - Schema v2.0.0 (Multi-Tenant)';

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================

-- Verificar criação de tabelas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Schema criado com sucesso!';
  RAISE NOTICE '📊 Total de tabelas: %', (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  );
  RAISE NOTICE '🔐 Próximo passo: Execute 02-rls-policies.sql';
END $$;
