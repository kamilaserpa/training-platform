# Implementação de duration_seconds para Exercise Prescriptions

## Problema Identificado
- A coluna `tempo` estava em português (fora do padrão das outras colunas em inglês)
- A coluna `tempo` serve para cadência de execução (formato "N-N-N-N") não para duração total
- O código estava tentando usar `duration_seconds` mas o campo não existia no banco
- Falta de persistência dos campos de tempo e peso nos exercícios

## Solução Implementada

### 1. Migração do Banco de Dados
- **Arquivo**: `supabase-instructions/migrate-duration-seconds.sql`
- **Ações**:
  - Remove coluna `tempo` (português, propósito diferente)
  - Adiciona coluna `duration_seconds INTEGER`
  - Adiciona constraint para valores positivos
  - Adiciona comentário explicativo

### 2. Tipos TypeScript Atualizados
- **Arquivo**: `src/types/database.types.ts`
- **Mudanças**:
  - `ExercisePrescription`: Remove `tempo`, adiciona `duration_seconds`
  - `CreateExercisePrescriptionDTO`: Remove `tempo`, adiciona `duration_seconds`
  - Mantém `weight_kg` (já estava correto)

### 3. Código do Formulário Corrigido
- **Arquivo**: `src/pages/treinos/TreinoDetalhesForm.jsx`
- **Mudanças**:
  - Remove função complexa `extractSecondsFromField`
  - Usa `prescription.duration_seconds` diretamente
  - Corrige `createExerciseFromObject` para usar `duration_seconds`
  - Corrige carregamento de dados em todas as seções (CORE, NEURAL, PRINCIPAL, CONDICIONAMENTO)
  - Mantém suporte para `weight_kg` 

### 4. Página de Listagem Atualizada
- **Arquivo**: `src/pages/treinos/Treinos.tsx`
- **Mudanças**:
  - Tipos TypeScript atualizados para usar `duration_seconds`
  - Dados mockados ajustados

## Resultado
✅ **Persistência correta**: Campos `duration_seconds` e `weight_kg` serão salvos corretamente no banco
✅ **Padrão consistente**: Todas as colunas em inglês
✅ **Código limpo**: Sem mapeamentos complexos desnecessários
✅ **Funcionalidade completa**: 
- Exercícios com tempo (ex: "30s de prancha") usam `duration_seconds`
- Exercícios com repetições (ex: "10 flexões") usam `reps` 
- Exercícios com peso usam `weight_kg`

## Para Aplicar no Banco
Execute o script SQL: `supabase-instructions/migrate-duration-seconds.sql`