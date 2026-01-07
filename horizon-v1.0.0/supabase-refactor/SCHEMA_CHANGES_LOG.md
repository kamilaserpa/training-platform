# Schema Changes Log

Este arquivo documenta todas as mudanças de schema implementadas no projeto.

## 2024-12-19: Exercise Prescriptions Schema Optimization

### Problemas Resolvidos
- Campo `weight_kg` não estava sendo persistido no banco
- Campo `tempo` (português) estava vazio devido a incompatibilidade com frontend
- Falta de padronização de idioma nas colunas

### Mudanças Implementadas

#### 1. Nova coluna `duration_seconds`
```sql
ALTER TABLE exercise_prescriptions 
ADD COLUMN duration_seconds INTEGER CHECK (duration_seconds > 0);
```

**Uso**: Para exercícios com duração específica (isometrias, cardio, prancha, etc.)
- Tipo: `INTEGER` (segundos)
- Nullable: `true` (nem todos exercícios têm duração fixa)
- Constraint: Deve ser positivo quando informado

#### 2. Manutenção da coluna `tempo`
- Mantida por compatibilidade com sistema existente
- Tipo: `TEXT` para cadências como "2-1-2-1"
- Uso: Para especificar tempo de execução de movimentos

#### 3. Confirmação do campo `weight_kg`
- Campo já existia corretamente no banco
- Tipo: `DECIMAL(5,2)` 
- Constraint: `CHECK (weight_kg >= 0)`

## 2024-12-19: Training Movement Pattern Integration

### Mudanças Implementadas

#### 1. Nova coluna `movement_pattern_id` na tabela `trainings`
```sql
ALTER TABLE trainings 
ADD COLUMN movement_pattern_id UUID REFERENCES movement_patterns(id) ON DELETE SET NULL;
```

**Uso**: Para associar um treino a um padrão de movimento específico
- Tipo: `UUID` com foreign key para `movement_patterns(id)`
- Nullable: `true` (campo opcional)
- Delete action: `SET NULL` (preserva treinos se padrão for removido)

#### 2. Índice para performance
```sql
CREATE INDEX IF NOT EXISTS idx_trainings_movement_pattern ON trainings(movement_pattern_id);
```

## 2024-12-19: Exercise RLS Policies Implementation

### Mudanças Implementadas

#### 1. Políticas RLS para tabela `exercises`
```sql
-- Leitura pública
CREATE POLICY "Anyone can read exercises" ON exercises FOR SELECT USING (true);

-- Criação para usuários autenticados
CREATE POLICY "Authenticated users can create exercises" ON exercises
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND (created_by = auth.uid() OR created_by IS NULL));

-- Atualização apenas pelo criador
CREATE POLICY "Users can update own exercises" ON exercises
FOR UPDATE USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- Exclusão apenas pelo criador
CREATE POLICY "Users can delete own exercises" ON exercises
FOR DELETE USING (created_by = auth.uid());
```

#### 2. Campo `created_by` na tabela `exercises`
- Adicionado se não existir: `created_by UUID REFERENCES auth.users(id)`
- Índice para performance: `CREATE INDEX idx_exercises_created_by ON exercises(created_by)`

## 2024-12-19: Block Type Enum Update

### Mudanças Implementadas

#### 1. Enum `block_type` atualizado com valores em português
```sql
CREATE TYPE block_type AS ENUM (
    'MOBILIDADE_ARTICULAR',     -- Mobilidade articular
    'ATIVACAO_CORE',           -- Ativação do core
    'ATIVACAO_NEURAL',         -- Ativação neural
    'TREINO_PRINCIPAL',        -- Treino principal
    'CONDICIONAMENTO_FISICO'   -- Condicionamento físico
);
```

**Justificativa**: 
- Padronização com outros campos em português do sistema
- Melhor compreensão pelos usuários brasileiros
- Consistência com nomenclatura já utilizada no frontend

## 2024-12-19: RLS Advanced Fixes

### Problemas Resolvidos
- Políticas RLS causando recursão infinita na tabela `users`
- Problemas de permissão em ambiente de desenvolvimento
- Necessidade de políticas mais flexíveis para `training_weeks`

### Mudanças Implementadas

#### 1. Políticas anti-recursão para `users`
```sql
-- Políticas ultra-simples sem subconsultas
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_no_delete" ON users FOR DELETE USING (false);
```

#### 2. Políticas flexíveis para `training_weeks`
```sql
-- Permitir created_by NULL para desenvolvimento
ALTER TABLE training_weeks ALTER COLUMN created_by DROP NOT NULL;

-- Políticas flexíveis que funcionam sem autenticação
CREATE POLICY "training_weeks_select_flexible" ON training_weeks
FOR SELECT USING (created_by = auth.uid() OR created_by IS NULL OR auth.uid() IS NULL);
```

#### 3. Auto-preenchimento de `created_by`
```sql
CREATE OR REPLACE FUNCTION auto_fill_created_by() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_by IS NULL THEN
        NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 4. Políticas públicas para `movement_patterns`
- Dados considerados públicos e acessíveis por todos os usuários autenticados
- Simplifica desenvolvimento e permite compartilhamento de padrões de movimento

### Arquivos Atualizados

#### Frontend
- `src/types/database.types.ts`: Adicionado `duration_seconds?: number`
- `src/pages/treinos/TreinoDetalhesForm.jsx`: Mapeamento direto dos campos do banco
- `src/pages/treinos/Treinos.tsx`: Interface TypeScript atualizada

#### Backend/Database
- `horizon-v1.0.0/supabase-refactor/02-create-tables.sql`: Schema base atualizado
- `horizon-v1.0.0/supabase-refactor/10-production-migration.sql`: Migração para produção
- `supabase-instructions/migrate-duration-seconds.sql`: Script de migração específico

### Scripts de Migração

#### Para Banco Existente
Use: `supabase-instructions/migrate-duration-seconds.sql`

#### Para Nova Instalação
Use: `horizon-v1.0.0/supabase-refactor/run-all.sql`

### Validação
Após aplicar as mudanças, execute:
```sql
-- Verificar se a coluna existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'exercise_prescriptions' 
AND column_name IN ('duration_seconds', 'weight_kg', 'tempo');
```

### Impacto
- ✅ Corrigida persistência de dados no frontend
- ✅ Padronização de campo de duração em inglês
- ✅ Mantida compatibilidade com sistema existente
- ✅ Documentação atualizada para futuras instalações

### Notas Técnicas
- `duration_seconds` é específico para exercícios com duração determinada
- `tempo` continua sendo usado para cadência de movimentos
- `weight_kg` já funcionava corretamente, problema era no frontend
- Todas as mudanças são backward-compatible