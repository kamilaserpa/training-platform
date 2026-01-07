-- Adicionar campo movement_pattern_id à tabela trainings
-- Esta migration permite que um treino tenha um padrão de movimento direto

-- Adicionar coluna movement_pattern_id à tabela trainings
ALTER TABLE trainings ADD COLUMN movement_pattern_id UUID REFERENCES movement_patterns(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_trainings_movement_pattern ON trainings(movement_pattern_id);

-- Comentários para documentação
COMMENT ON COLUMN trainings.movement_pattern_id IS 'Padrão de movimento principal do treino (opcional)';

-- Exemplo de como usar:
-- UPDATE trainings SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'Empurrar') WHERE id = 'training_id';