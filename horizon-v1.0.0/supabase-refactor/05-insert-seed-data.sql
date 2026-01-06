-- =============================================
-- 05-INSERT-SEED-DATA.sql
-- Inserção de dados iniciais (seed data)
-- =============================================

\echo '🌱 INSERINDO DADOS INICIAIS...'

-- ==========================================
-- 1. PADRÕES DE MOVIMENTO FUNDAMENTAIS
-- ==========================================
INSERT INTO movement_patterns (name, description) VALUES
    ('Agachar', 'Movimentos que envolvem flexão de quadril e joelhos, como agachamentos e suas variações'),
    ('Empurrar Horizontal', 'Movimentos de empurrar no plano horizontal, como flexões e supino'),
    ('Empurrar Vertical', 'Movimentos de empurrar no plano vertical, como desenvolvimento militar'),
    ('Puxar Horizontal', 'Movimentos de puxar no plano horizontal, como remada e puxada'),
    ('Puxar Vertical', 'Movimentos de puxar no plano vertical, como barra fixa e pulldown'),
    ('Dobrar (Hinge)', 'Movimentos de flexão de quadril com joelhos relativamente estendidos, como terra e bom dia'),
    ('Locomoção', 'Movimentos de deslocamento corporal, como caminhada, corrida e transporte de carga'),
    ('Rotação', 'Movimentos que envolvem rotação do tronco e resistência à rotação'),
    ('Unilateral', 'Movimentos executados com um membro ou lado do corpo, como afundo e pistol squat'),
    ('Isométrico', 'Exercícios de contração muscular sem movimento articular, como prancha e parada de mão'),
    ('Carregar', 'Movimentos de transporte e sustentação de carga, como farmer walk'),
    ('Anti-Movimento', 'Exercícios de estabilização e resistência ao movimento indesejado')
ON CONFLICT (name) DO NOTHING;

\echo '✅ Padrões de movimento inseridos'

-- ==========================================
-- 2. FOCOS DE SEMANA BÁSICOS
-- ==========================================
INSERT INTO week_focuses (name, description, intensity_percentage, color_hex) VALUES
    ('Hipertrofia 65%', 'Foco no desenvolvimento de massa muscular com intensidade moderada (65% 1RM)', 65, '#4CAF50'),
    ('Força Máxima 85%', 'Desenvolvimento da força máxima com alta intensidade (85% 1RM)', 85, '#F44336'),
    ('Resistência 50%', 'Foco em resistência muscular com baixa intensidade e alto volume', 50, '#2196F3'),
    ('Potência 70%', 'Desenvolvimento de potência e explosão muscular (70% 1RM)', 70, '#FF9800'),
    ('Condicionamento 60%', 'Melhoria da capacidade cardiovascular e metabólica', 60, '#9C27B0'),
    ('Mobilidade 40%', 'Foco em flexibilidade, mobilidade articular e correção de padrões', 40, '#00BCD4'),
    ('Deload 40%', 'Semana de recuperação ativa com volume e intensidade reduzidos', 40, '#607D8B'),
    ('Funcional 60%', 'Treino funcional com movimentos multiarticulares integrados', 60, '#795548'),
    ('Iniciante 50%', 'Programa para iniciantes focado na aprendizagem técnica', 50, '#8BC34A'),
    ('Competição 90%', 'Preparação para competição com alta intensidade e especificidade', 90, '#E91E63')
ON CONFLICT (name) DO NOTHING;

\echo '✅ Focos de semana inseridos'

-- ==========================================
-- 3. EXERCÍCIOS FUNDAMENTAIS POR PADRÃO
-- ==========================================

-- Obter IDs dos padrões de movimento para referência
DO $$
DECLARE
    agachar_id UUID;
    empurrar_h_id UUID;
    empurrar_v_id UUID;
    puxar_h_id UUID;
    puxar_v_id UUID;
    dobrar_id UUID;
    locomocao_id UUID;
    rotacao_id UUID;
    unilateral_id UUID;
    isometrico_id UUID;
    carregar_id UUID;
    anti_mov_id UUID;
BEGIN
    -- Buscar IDs dos padrões
    SELECT id INTO agachar_id FROM movement_patterns WHERE name = 'Agachar';
    SELECT id INTO empurrar_h_id FROM movement_patterns WHERE name = 'Empurrar Horizontal';
    SELECT id INTO empurrar_v_id FROM movement_patterns WHERE name = 'Empurrar Vertical';
    SELECT id INTO puxar_h_id FROM movement_patterns WHERE name = 'Puxar Horizontal';
    SELECT id INTO puxar_v_id FROM movement_patterns WHERE name = 'Puxar Vertical';
    SELECT id INTO dobrar_id FROM movement_patterns WHERE name = 'Dobrar (Hinge)';
    SELECT id INTO locomocao_id FROM movement_patterns WHERE name = 'Locomoção';
    SELECT id INTO rotacao_id FROM movement_patterns WHERE name = 'Rotação';
    SELECT id INTO unilateral_id FROM movement_patterns WHERE name = 'Unilateral';
    SELECT id INTO isometrico_id FROM movement_patterns WHERE name = 'Isométrico';
    SELECT id INTO carregar_id FROM movement_patterns WHERE name = 'Carregar';
    SELECT id INTO anti_mov_id FROM movement_patterns WHERE name = 'Anti-Movimento';

    -- Inserir exercícios com um usuário sistema temporário
    -- Nota: Em produção, estes exercícios devem ser criados por um admin real
    INSERT INTO exercises (name, description, movement_pattern_id, muscle_groups, equipment, difficulty_level, created_by) VALUES
        -- Agachar
        ('Agachamento Livre', 'Agachamento clássico com peso corporal', agachar_id, ARRAY['Quadríceps', 'Glúteos', 'Core'], ARRAY[]::TEXT[], 2, NULL),
        ('Agachamento com Barra', 'Agachamento com barra nas costas', agachar_id, ARRAY['Quadríceps', 'Glúteos', 'Core', 'Erectores'], ARRAY['Barra', 'Rack'], 4, NULL),
        ('Goblet Squat', 'Agachamento segurando peso no peito', agachar_id, ARRAY['Quadríceps', 'Glúteos', 'Core'], ARRAY['Halter', 'Kettlebell'], 3, NULL),
        
        -- Empurrar Horizontal  
        ('Flexão de Braço', 'Flexão clássica no solo', empurrar_h_id, ARRAY['Peitoral', 'Tríceps', 'Deltóide anterior', 'Core'], ARRAY[]::TEXT[], 2, NULL),
        ('Supino Reto', 'Supino com barra ou halteres', empurrar_h_id, ARRAY['Peitoral', 'Tríceps', 'Deltóide anterior'], ARRAY['Barra', 'Halter', 'Banco'], 4, NULL),
        
        -- Empurrar Vertical
        ('Desenvolvimento Militar', 'Desenvolvimento em pé com barra', empurrar_v_id, ARRAY['Deltóide', 'Tríceps', 'Core'], ARRAY['Barra'], 4, NULL),
        
        -- Puxar Horizontal
        ('Remada Curvada', 'Remada com barra curvado', puxar_h_id, ARRAY['Latíssimo', 'Rombóides', 'Bíceps', 'Deltóide posterior'], ARRAY['Barra'], 4, NULL),
        
        -- Puxar Vertical
        ('Barra Fixa', 'Puxada na barra fixa', puxar_v_id, ARRAY['Latíssimo', 'Bíceps', 'Rombóides'], ARRAY['Barra fixa'], 4, NULL),
        ('Pulldown', 'Puxada no cabo', puxar_v_id, ARRAY['Latíssimo', 'Bíceps', 'Rombóides'], ARRAY['Cabo', 'Polia'], 3, NULL),
        
        -- Dobrar (Hinge)
        ('Levantamento Terra', 'Terra convencional com barra', dobrar_id, ARRAY['Glúteos', 'Isquiotibiais', 'Erectores', 'Trapézio'], ARRAY['Barra'], 5, NULL),
        ('Stiff', 'Terra stiff focado em isquiotibiais', dobrar_id, ARRAY['Isquiotibiais', 'Glúteos'], ARRAY['Barra', 'Halter'], 4, NULL),
        
        -- Locomoção
        ('Caminhada', 'Caminhada em ritmo moderado', locomocao_id, ARRAY['Membros inferiores', 'Core'], ARRAY[]::TEXT[], 1, NULL),
        ('Corrida', 'Corrida em ritmo controlado', locomocao_id, ARRAY['Membros inferiores', 'Core', 'Sistema cardiovascular'], ARRAY[]::TEXT[], 2, NULL),
        
        -- Unilateral
        ('Afundo', 'Afundo alternado', unilateral_id, ARRAY['Quadríceps', 'Glúteos', 'Core'], ARRAY[]::TEXT[], 3, NULL),
        ('Búlgaro', 'Afundo búlgaro com pé elevado', unilateral_id, ARRAY['Quadríceps', 'Glúteos', 'Core'], ARRAY['Banco'], 4, NULL),
        
        -- Isométrico
        ('Prancha', 'Prancha frontal', isometrico_id, ARRAY['Core', 'Ombros'], ARRAY[]::TEXT[], 2, NULL),
        ('Prancha Lateral', 'Prancha lateral para oblíquos', isometrico_id, ARRAY['Core', 'Ombros'], ARRAY[]::TEXT[], 3, NULL),
        
        -- Carregar
        ('Farmer Walk', 'Caminhada do fazendeiro', carregar_id, ARRAY['Antebraços', 'Trapézio', 'Core', 'Membros inferiores'], ARRAY['Halter', 'Kettlebell'], 3, NULL),
        
        -- Rotação
        ('Russian Twist', 'Rotação do tronco sentado', rotacao_id, ARRAY['Oblíquos', 'Core'], ARRAY[]::TEXT[], 2, NULL),
        ('Wood Chop', 'Rotação com cabo ou medicine ball', rotacao_id, ARRAY['Oblíquos', 'Core', 'Ombros'], ARRAY['Cabo', 'Medicine Ball'], 3, NULL)
    ON CONFLICT (name, created_by) DO NOTHING;
    
END $$;

\echo '✅ Exercícios fundamentais inseridos'

-- ==========================================
-- 4. VERIFICAÇÃO DOS DADOS INSERIDOS
-- ==========================================
\echo '📊 RESUMO DOS DADOS INSERIDOS:'

SELECT 
    'Padrões de Movimento' as categoria,
    COUNT(*) as quantidade
FROM movement_patterns

UNION ALL

SELECT 
    'Focos de Semana' as categoria,
    COUNT(*) as quantidade  
FROM week_focuses

UNION ALL

SELECT 
    'Exercícios' as categoria,
    COUNT(*) as quantidade
FROM exercises

ORDER BY categoria;

-- Mostrar distribuição de exercícios por padrão
\echo '📋 EXERCÍCIOS POR PADRÃO DE MOVIMENTO:'

SELECT 
    mp.name as "Padrão de Movimento",
    COUNT(e.id) as "Qtd Exercícios"
FROM movement_patterns mp
LEFT JOIN exercises e ON e.movement_pattern_id = mp.id
GROUP BY mp.name, mp.created_at
ORDER BY mp.created_at;

-- Mostrar focos por intensidade
\echo '📋 FOCOS POR INTENSIDADE:'

SELECT 
    name as "Foco",
    intensity_percentage || '%' as "Intensidade",
    color_hex as "Cor"
FROM week_focuses
ORDER BY intensity_percentage;

\echo '✅ DADOS INICIAIS INSERIDOS COM SUCESSO!'
\echo '📋 Próximo passo: Execute 06-create-indexes.sql'