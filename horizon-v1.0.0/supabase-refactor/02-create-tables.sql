-- =============================================
-- 02-CREATE-TABLES.sql
-- Criação de todas as tabelas do sistema
-- =============================================

\echo '🗃️  CRIANDO ESTRUTURA DAS TABELAS...'

-- ==========================================
-- 1. TABELA DE USUÁRIOS
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ==========================================
-- 2. PADRÕES DE MOVIMENTO
-- ==========================================
CREATE TABLE movement_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_name_length CHECK (LENGTH(name) BETWEEN 2 AND 100)
);

-- ==========================================
-- 3. FOCOS DE SEMANA
-- ==========================================
CREATE TABLE week_focuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    intensity_percentage INTEGER CHECK (intensity_percentage BETWEEN 1 AND 100),
    color_hex TEXT DEFAULT '#1976d2',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_color_hex CHECK (color_hex ~* '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT valid_name_length CHECK (LENGTH(name) BETWEEN 2 AND 100)
);

-- ==========================================
-- 4. EXERCÍCIOS
-- ==========================================
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    movement_pattern_id UUID REFERENCES movement_patterns(id) ON DELETE SET NULL,
    muscle_groups TEXT[], -- Array de grupos musculares
    equipment TEXT[],     -- Array de equipamentos necessários
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    instructions TEXT,
    video_url TEXT,
    image_url TEXT,
    
    -- Auditoria (created_by nullable para desenvolvimento)
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_exercise_per_user UNIQUE(name, created_by),
    CONSTRAINT valid_name_length CHECK (LENGTH(name) BETWEEN 2 AND 200),
    CONSTRAINT valid_video_url CHECK (video_url IS NULL OR video_url ~* '^https?://'),
    CONSTRAINT valid_image_url CHECK (image_url IS NULL OR image_url ~* '^https?://')
);

-- ==========================================
-- 5. SEMANAS DE TREINO
-- ==========================================
CREATE TABLE training_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    week_focus_id UUID NOT NULL REFERENCES week_focuses(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status week_status DEFAULT 'draft',
    notes TEXT,
    
    -- Auditoria (created_by nullable para desenvolvimento)
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT valid_name_length CHECK (LENGTH(name) BETWEEN 2 AND 200)
);

-- ==========================================
-- 6. TREINOS (SESSÕES)
-- ==========================================
CREATE TABLE trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_week_id UUID NOT NULL REFERENCES training_weeks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    intensity_level INTEGER CHECK (intensity_level BETWEEN 1 AND 10),
    description TEXT,
    estimated_duration_minutes INTEGER CHECK (estimated_duration_minutes > 0),
    
    -- Compartilhamento
    share_status share_status DEFAULT 'private',
    share_token UUID UNIQUE DEFAULT gen_random_uuid(),
    share_expires_at TIMESTAMPTZ,
    
    -- Auditoria
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_name_length CHECK (LENGTH(name) BETWEEN 2 AND 200),
    CONSTRAINT valid_share_expiry CHECK (
        share_expires_at IS NULL OR 
        share_expires_at > created_at
    )
);

-- ==========================================
-- 7. BLOCOS DE TREINO
-- ==========================================
CREATE TABLE training_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    block_type block_type NOT NULL,
    order_index INTEGER NOT NULL,
    instructions TEXT,
    rest_between_exercises_seconds INTEGER DEFAULT 60 CHECK (rest_between_exercises_seconds >= 0),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_order_per_training UNIQUE(training_id, order_index),
    CONSTRAINT valid_name_length CHECK (LENGTH(name) BETWEEN 2 AND 200),
    CONSTRAINT valid_order_index CHECK (order_index >= 1)
);

-- ==========================================
-- 8. PRESCRIÇÕES DE EXERCÍCIOS
-- ==========================================
CREATE TABLE exercise_prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_block_id UUID NOT NULL REFERENCES training_blocks(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    
    -- Prescrição específica
    sets INTEGER NOT NULL DEFAULT 1 CHECK (sets >= 1),
    reps TEXT, -- Ex: "8-12", "máximo", "30s"
    weight_kg DECIMAL(5,2) CHECK (weight_kg >= 0),
    rest_seconds INTEGER DEFAULT 60 CHECK (rest_seconds >= 0),
    tempo TEXT, -- Ex: "2-1-2-1" (excêntrico-pausa-concêntrico-pausa)
    rpe INTEGER CHECK (rpe BETWEEN 1 AND 10), -- Rate of Perceived Exertion
    percentage_1rm INTEGER CHECK (percentage_1rm BETWEEN 1 AND 100),
    
    -- Observações específicas
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_order_per_block UNIQUE(training_block_id, order_index),
    CONSTRAINT valid_order_index CHECK (order_index >= 1),
    CONSTRAINT valid_tempo CHECK (
        tempo IS NULL OR 
        tempo ~* '^[0-9]+-[0-9]+-[0-9]+-[0-9]+$'
    )
);

-- ==========================================
-- 9. FUNÇÃO PARA ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMPS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 10. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ==========================================
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movement_patterns_updated_at 
    BEFORE UPDATE ON movement_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_week_focuses_updated_at 
    BEFORE UPDATE ON week_focuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at 
    BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_weeks_updated_at 
    BEFORE UPDATE ON training_weeks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at 
    BEFORE UPDATE ON trainings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_blocks_updated_at 
    BEFORE UPDATE ON training_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercise_prescriptions_updated_at 
    BEFORE UPDATE ON exercise_prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

\echo '✅ TABELAS CRIADAS COM SUCESSO!'

-- Verificação
SELECT 
    schemaname as "Schema",
    tablename as "Tabela",
    CASE 
        WHEN hasindexes THEN '✅'
        ELSE '❌'
    END as "Tem Índices"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

\echo '📋 Próximo passo: Execute 03-create-functions.sql'