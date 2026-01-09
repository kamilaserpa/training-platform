-- ==========================================
-- TRAINING PLATFORM - SEED DATA
-- Versão: 2.0.0
-- Data: Janeiro 2026
-- ==========================================

-- IMPORTANTE: Este script é OPCIONAL
-- Execute apenas se quiser popular o banco com dados iniciais

-- ==========================================
-- WEEK FOCUS PADRÃO
-- ==========================================

-- Nota: created_by será definido pelo primeiro owner que fizer login
-- Estes dados são compartilhados ou cada owner terá que criar os seus próprios

INSERT INTO week_focus (id, name, description, intensity_percentage, color_hex)
VALUES
  (uuid_generate_v4(), 'Hipertrofia', 'Foco em ganho de massa muscular', 75, '#3B82F6'),
  (uuid_generate_v4(), 'Força', 'Desenvolvimento de força máxima', 85, '#EF4444'),
  (uuid_generate_v4(), 'Resistência', 'Aumento da capacidade aeróbica', 65, '#10B981'),
  (uuid_generate_v4(), 'Potência', 'Desenvolvimento de potência explosiva', 80, '#F59E0B'),
  (uuid_generate_v4(), 'Mobilidade', 'Melhora da amplitude de movimento', 50, '#8B5CF6'),
  (uuid_generate_v4(), 'Recuperação Ativa', 'Semana de recuperação e regeneração', 40, '#06B6D4'),
  (uuid_generate_v4(), 'Condicionamento', 'Condicionamento físico geral', 70, '#EC4899'),
  (uuid_generate_v4(), 'Técnica', 'Refinamento técnico dos movimentos', 60, '#14B8A6')
ON CONFLICT DO NOTHING;

-- ==========================================
-- MOVEMENT PATTERNS PADRÃO
-- ==========================================

INSERT INTO movement_patterns (id, name, description)
VALUES
  (uuid_generate_v4(), 'Push Vertical', 'Empurrar verticalmente (ex: shoulder press)'),
  (uuid_generate_v4(), 'Push Horizontal', 'Empurrar horizontalmente (ex: bench press)'),
  (uuid_generate_v4(), 'Pull Vertical', 'Puxar verticalmente (ex: pull-up)'),
  (uuid_generate_v4(), 'Pull Horizontal', 'Puxar horizontalmente (ex: row)'),
  (uuid_generate_v4(), 'Squat', 'Agachamento e variações'),
  (uuid_generate_v4(), 'Hinge', 'Articulação do quadril (ex: deadlift)'),
  (uuid_generate_v4(), 'Lunge', 'Afundo e variações'),
  (uuid_generate_v4(), 'Carry', 'Carregar (ex: farmer\'s walk)'),
  (uuid_generate_v4(), 'Rotation', 'Rotação do tronco'),
  (uuid_generate_v4(), 'Anti-Rotation', 'Resistir à rotação (ex: Pallof press)'),
  (uuid_generate_v4(), 'Flexão', 'Flexão do tronco (ex: crunch)'),
  (uuid_generate_v4(), 'Anti-Flexão', 'Resistir à flexão (ex: plank)'),
  (uuid_generate_v4(), 'Extensão', 'Extensão do tronco (ex: back extension)'),
  (uuid_generate_v4(), 'Anti-Extensão', 'Resistir à extensão')
ON CONFLICT DO NOTHING;

-- ==========================================
-- EXERCÍCIOS BÁSICOS
-- ==========================================

-- Inserir alguns exercícios básicos
-- Nota: movement_pattern_id será vinculado após obter os IDs

DO $$
DECLARE
  v_push_vertical UUID;
  v_push_horizontal UUID;
  v_pull_vertical UUID;
  v_pull_horizontal UUID;
  v_squat UUID;
  v_hinge UUID;
BEGIN
  -- Obter IDs dos padrões de movimento
  SELECT id INTO v_push_vertical FROM movement_patterns WHERE name = 'Push Vertical';
  SELECT id INTO v_push_horizontal FROM movement_patterns WHERE name = 'Push Horizontal';
  SELECT id INTO v_pull_vertical FROM movement_patterns WHERE name = 'Pull Vertical';
  SELECT id INTO v_pull_horizontal FROM movement_patterns WHERE name = 'Pull Horizontal';
  SELECT id INTO v_squat FROM movement_patterns WHERE name = 'Squat';
  SELECT id INTO v_hinge FROM movement_patterns WHERE name = 'Hinge';

  -- Exercícios de Push Vertical
  INSERT INTO exercises (name, description, movement_pattern_id, difficulty_level, muscle_groups)
  VALUES
    ('Shoulder Press com Barra', 'Desenvolvimento militar com barra', v_push_vertical, 3, ARRAY['Deltoides', 'Tríceps']),
    ('Shoulder Press com Halteres', 'Desenvolvimento com halteres', v_push_vertical, 2, ARRAY['Deltoides', 'Tríceps']),
    ('Push Press', 'Desenvolvimento com impulso das pernas', v_push_vertical, 4, ARRAY['Deltoides', 'Tríceps', 'Quadríceps']);

  -- Exercícios de Push Horizontal
  INSERT INTO exercises (name, description, movement_pattern_id, difficulty_level, muscle_groups)
  VALUES
    ('Supino Reto', 'Supino com barra no banco reto', v_push_horizontal, 3, ARRAY['Peitoral', 'Tríceps', 'Deltoides']),
    ('Flexão de Braço', 'Push-up tradicional', v_push_horizontal, 2, ARRAY['Peitoral', 'Tríceps', 'Core']),
    ('Supino Inclinado', 'Supino no banco inclinado', v_push_horizontal, 3, ARRAY['Peitoral Superior', 'Tríceps']);

  -- Exercícios de Pull Vertical
  INSERT INTO exercises (name, description, movement_pattern_id, difficulty_level, muscle_groups)
  VALUES
    ('Pull-up', 'Barra fixa com pegada pronada', v_pull_vertical, 4, ARRAY['Dorsais', 'Bíceps']),
    ('Chin-up', 'Barra fixa com pegada supinada', v_pull_vertical, 3, ARRAY['Dorsais', 'Bíceps']),
    ('Lat Pulldown', 'Puxada na polia alta', v_pull_vertical, 2, ARRAY['Dorsais', 'Bíceps']);

  -- Exercícios de Pull Horizontal
  INSERT INTO exercises (name, description, movement_pattern_id, difficulty_level, muscle_groups)
  VALUES
    ('Remada Curvada', 'Remada com barra curvado', v_pull_horizontal, 3, ARRAY['Dorsais', 'Trapézio', 'Bíceps']),
    ('Remada Sentado', 'Remada no cabo sentado', v_pull_horizontal, 2, ARRAY['Dorsais', 'Trapézio']),
    ('Remada com Halteres', 'Remada unilateral com halter', v_pull_horizontal, 2, ARRAY['Dorsais', 'Trapézio']);

  -- Exercícios de Squat
  INSERT INTO exercises (name, description, movement_pattern_id, difficulty_level, muscle_groups)
  VALUES
    ('Back Squat', 'Agachamento com barra nas costas', v_squat, 4, ARRAY['Quadríceps', 'Glúteos', 'Core']),
    ('Front Squat', 'Agachamento com barra na frente', v_squat, 4, ARRAY['Quadríceps', 'Core']),
    ('Goblet Squat', 'Agachamento com kettlebell ou halter', v_squat, 2, ARRAY['Quadríceps', 'Glúteos']);

  -- Exercícios de Hinge
  INSERT INTO exercises (name, description, movement_pattern_id, difficulty_level, muscle_groups)
  VALUES
    ('Deadlift', 'Levantamento terra convencional', v_hinge, 5, ARRAY['Posterior', 'Glúteos', 'Core']),
    ('Romanian Deadlift', 'Levantamento terra romeno', v_hinge, 4, ARRAY['Posterior', 'Glúteos']),
    ('Kettlebell Swing', 'Balanço com kettlebell', v_hinge, 3, ARRAY['Glúteos', 'Posterior', 'Core']);

  RAISE NOTICE '✅ Exercícios básicos inseridos';
END $$;

-- ==========================================
-- USUÁRIO OWNER DE TESTE (OPCIONAL)
-- ==========================================

-- IMPORTANTE: Descomente apenas se quiser criar um usuário de teste
-- Você precisará adicionar este usuário também no Supabase Auth

/*
-- Primeiro, crie o usuário no Supabase Auth Dashboard:
-- Email: admin@training.com
-- Password: Admin123!
-- Email Confirm: Yes

-- Depois, pegue o ID gerado e substitua abaixo

INSERT INTO users (id, email, name, role, active)
VALUES 
  ('COLE_O_ID_DO_AUTH_USER_AQUI', 'admin@training.com', 'Administrador', 'owner', true);

-- Atualizar created_by dos dados seed para este owner
UPDATE week_focus SET created_by = 'COLE_O_ID_DO_AUTH_USER_AQUI' WHERE created_by IS NULL;
UPDATE movement_patterns SET created_by = 'COLE_O_ID_DO_AUTH_USER_AQUI' WHERE created_by IS NULL;
UPDATE exercises SET created_by = 'COLE_O_ID_DO_AUTH_USER_AQUI' WHERE created_by IS NULL;
*/

-- ==========================================
-- VERIFICAÇÕES
-- ==========================================

-- Contar registros inseridos
DO $$
DECLARE
  v_week_focus_count INTEGER;
  v_movement_patterns_count INTEGER;
  v_exercises_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_week_focus_count FROM week_focus;
  SELECT COUNT(*) INTO v_movement_patterns_count FROM movement_patterns;
  SELECT COUNT(*) INTO v_exercises_count FROM exercises;
  
  RAISE NOTICE '✅ Dados seed inseridos com sucesso!';
  RAISE NOTICE '📊 Week Focus: % registros', v_week_focus_count;
  RAISE NOTICE '🏃 Movement Patterns: % registros', v_movement_patterns_count;
  RAISE NOTICE '💪 Exercícios: % registros', v_exercises_count;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Os dados não têm created_by ainda';
  RAISE NOTICE '   Opção 1: Crie um owner e execute o UPDATE comentado acima';
  RAISE NOTICE '   Opção 2: Deixe que cada owner crie seus próprios dados';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Próximo passo: Deploy das Edge Functions (pasta 04-functions/)';
END $$;

-- Ver dados inseridos
SELECT 'Week Focus' as tabela, COUNT(*) as total FROM week_focus
UNION ALL
SELECT 'Movement Patterns', COUNT(*) FROM movement_patterns
UNION ALL
SELECT 'Exercises', COUNT(*) FROM exercises
ORDER BY tabela;
