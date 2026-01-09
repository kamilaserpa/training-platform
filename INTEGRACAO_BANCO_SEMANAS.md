# ✅ Integração com Banco de Dados - Tela de Semanas

## 🎯 Objetivo

Substituir os dados mockados por dados reais do Supabase na visualização de semanas com treinos.

---

## 📦 Arquivos Criados/Modificados

### **Novos Arquivos**

#### 1. `src/utils/semanaAdapter.ts`
Adaptador para converter dados do banco para o formato esperado pelos componentes.

**Funções principais:**
- `adaptarSemanasParaVisualizacao()` - Converte semanas do banco para formato da UI
- `formatarProtocolo()` - Formata séries, reps, tempo em string legível
- `calcularNumeroSemana()` - Calcula número da semana baseado na data
- `getDiaDaSemana()` - Mapeia data para dia da semana (segunda-sexta)

---

### **Modificações em Arquivos Existentes**

#### 1. `src/services/trainingService.ts`
**Novo método adicionado:**
```typescript
async getWeeksWithTrainings(): Promise<any[]>
```

**Funcionalidade:**
- Busca todas as semanas com seus focos
- Para cada semana, busca treinos com blocos e exercícios
- Retorna estrutura completa para visualização

**Query Supabase:**
```sql
training_weeks
  .select(*, week_focus:week_focuses(*))
  .order('start_date', desc)

trainings
  .select(*,
    training_blocks(*,
      exercise_prescriptions(*,
        exercise:exercises(*)
      )
    )
  )
  .eq('training_week_id', week.id)
```

---

#### 2. `src/pages/semanas/SemanasRefactored.tsx`
**Mudanças:**
- Substituído `mockSemanas` por estado dinâmico
- Adicionado `useEffect` para buscar dados do banco
- Adicionado estados de loading e erro
- Integração com `trainingService.getWeeksWithTrainings()`
- Uso do adaptador para formatar dados

**Estados adicionados:**
```typescript
const [semanas, setSemanas] = useState<SemanaComTreinos[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

---

#### 3. Componentes Atualizados

**`src/components/semanas/SemanaRow.tsx`**
- Tipo: `MockSemana` → `SemanaComTreinos`

**`src/components/semanas/SemanaCard.tsx`**
- Tipo: `MockSemana` → `SemanaComTreinos`

**`src/components/semanas/DiaCell.tsx`**
- Tipo: `MockDia` → `{ treino?: Training }`

**`src/components/semanas/TreinoResumo.tsx`**
- Tipo: `MockTreino` → `Training`
- Acesso: `treino.nome` → `treino.name`
- Acesso: `treino.blocos` → `treino.training_blocks`
- Ordenação por `order_index`

**`src/components/semanas/BlocoResumo.tsx`**
- Tipo: `MockBloco` → `TrainingBlock`
- Acesso: `bloco.nome` → `bloco.name`
- Acesso: `bloco.protocolo` → `formatarProtocolo(prescription)`
- Acesso: `bloco.exercicios` → `bloco.exercise_prescriptions`
- Exercício: `exercicio.nome` → `prescription.exercise?.name`

---

## 🔄 Fluxo de Dados

### **1. Carregamento Inicial**
```
SemanasRefactored (useEffect)
  ↓
trainingService.getWeeksWithTrainings()
  ↓
Supabase Query (weeks + trainings)
  ↓
adaptarSemanasParaVisualizacao()
  ↓
setSemanas() → Componentes renderizam
```

### **2. Estrutura de Dados**

#### **Do Banco (Supabase)**
```typescript
TrainingWeek {
  id, name, start_date, end_date, status
  week_focus: { name, description, color_hex }
  trainings: Training[] {
    id, name, scheduled_date
    training_blocks: TrainingBlock[] {
      id, name, block_type, order_index
      exercise_prescriptions: ExercisePrescription[] {
        sets, reps, duration_seconds, rest_seconds
        exercise: { id, name }
      }
    }
  }
}
```

#### **Após Adaptação (UI)**
```typescript
SemanaComTreinos {
  id, numeroSemana, focoSemana, status
  dias: {
    segunda: { treino?: Training }
    terca: { treino?: Training }
    quarta: { treino?: Training }
    quinta: { treino?: Training }
    sexta: { treino?: Training }
  }
}
```

---

## 📊 Mapeamento de Dados

### **Treino**
| Mock | Banco | Descrição |
|------|-------|-----------|
| `treino.nome` | `training.name` | Nome do treino |
| `treino.blocos[]` | `training.training_blocks[]` | Lista de blocos |

### **Bloco**
| Mock | Banco | Descrição |
|------|-------|-----------|
| `bloco.nome` | `block.name` | Nome do bloco |
| `bloco.protocolo` | `formatarProtocolo(prescription)` | Protocolo gerado |
| `bloco.exercicios[]` | `block.exercise_prescriptions[]` | Lista de exercícios |

### **Exercício**
| Mock | Banco | Descrição |
|------|-------|-----------|
| `exercicio.nome` | `prescription.exercise.name` | Nome do exercício |

### **Protocolo**
| Componente | Formato | Exemplo |
|------------|---------|---------|
| Sets | `${sets}×` | `4×` |
| Reps | Número ou string | `12` ou `30"` |
| Duração | `${min}'${seg}"` | `2'30"` |
| Descanso | `×${seg}"` | `×15"` |

**Exemplos completos:**
- `4×12` - 4 séries de 12 repetições
- `3×30"×15"` - 3 séries de 30 segundos com 15 segundos de descanso
- `EMOM 12'` - String customizada em reps

---

## 🎨 Estados da UI

### **1. Loading**
```jsx
<CircularProgress />
<Typography>Carregando semanas...</Typography>
```

### **2. Error**
```jsx
<Alert severity="error">
  {error}
</Alert>
```

### **3. Empty**
```jsx
<Typography>
  Não há semanas cadastradas ainda.
</Typography>
```

### **4. Success**
- Desktop: Tabela com semanas expansíveis
- Mobile: Cards empilhados verticalmente

---

## 🔍 Organização por Dia da Semana

### **Função `getDiaDaSemana()`**
Mapeia `Date.getDay()` para dia da semana útil:

| `getDay()` | Dia | Retorno |
|------------|-----|---------|
| 0 | Domingo | `null` |
| 1 | Segunda | `'segunda'` |
| 2 | Terça | `'terca'` |
| 3 | Quarta | `'quarta'` |
| 4 | Quinta | `'quinta'` |
| 5 | Sexta | `'sexta'` |
| 6 | Sábado | `null` |

**Lógica:**
- Treinos de fim de semana são ignorados
- Apenas segunda a sexta são exibidos na grade

---

## ✅ Validações e Tratamentos

### **1. Dados Ausentes**
```typescript
// Blocos vazios
const blocos = treino.training_blocks || [];

// Prescriptions vazias
const prescriptions = bloco.exercise_prescriptions || [];

// Exercício sem nome
prescription.exercise?.name || 'Exercício sem nome'
```

### **2. Ordenação**
```typescript
// Blocos por order_index
blocos.sort((a, b) => a.order_index - b.order_index)

// Prescriptions por order_index
prescriptions.sort((a, b) => a.order_index - b.order_index)
```

### **3. Component Unmount**
```typescript
useEffect(() => {
  let isMounted = true;
  
  // ... fetch data
  
  if (!isMounted) return; // Previne setState após unmount
  
  return () => {
    isMounted = false;
  };
}, []);
```

---

## 🚀 Como Testar

### **1. Com Dados no Banco**
```bash
# Acessar a tela
http://localhost:3000/pages/semanas

# Verificar:
✅ Loading aparece durante busca
✅ Semanas são listadas
✅ Treinos aparecem nos dias corretos
✅ Blocos e exercícios são exibidos
✅ Protocolo é formatado corretamente
```

### **2. Sem Dados no Banco**
```bash
# Verificar empty state:
✅ "Não há semanas cadastradas ainda."
```

### **3. Com Erro na API**
```bash
# Verificar error state:
✅ Alert vermelho com mensagem de erro
```

---

## 📝 Logs de Debug

### **Console Logs Adicionados**
```typescript
🔄 [TrainingService] Buscando semanas com treinos...
✅ [TrainingService] Encontradas X semanas com treinos

🔄 [SemanasRefactored] Carregando semanas do banco...
✅ [SemanasRefactored] Carregadas X semanas

❌ [SemanasRefactored] Erro ao carregar semanas: <erro>
```

---

## 🎯 Resultado Final

### **Antes** ❌
- Dados estáticos mockados
- Sempre 3 semanas fixas
- Sem loading/error states
- Não refletia banco real

### **Agora** ✅
- Dados dinâmicos do Supabase
- Quantidade variável de semanas
- Loading e error handling
- Reflete estado real do banco
- Treinos organizados por dia útil
- Blocos e exercícios completos
- Protocolo gerado automaticamente

---

## 🔮 Próximos Passos (Opcional)

- [ ] Cache de dados (React Query/SWR)
- [ ] Refresh manual
- [ ] Paginação para muitas semanas
- [ ] Filtros avançados (por período, status)
- [ ] Real-time updates (Supabase subscriptions)

---

**Status**: ✅ **INTEGRAÇÃO COMPLETA E FUNCIONAL**

---

🎉 **A tela de Semanas agora usa dados reais do banco de dados!**
