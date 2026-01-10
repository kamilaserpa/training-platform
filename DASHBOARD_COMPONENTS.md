# 📊 Componentes do Dashboard

Documentação dos novos componentes implementados para o Dashboard da plataforma de treinos.

---

## 🎯 Componentes Implementados

### 1. **CurrentWeek** (Hero Section - Semana Atual)

**Localização:** `src/components/dashboard/CurrentWeek.tsx`

**Descrição:** Card em destaque que exibe informações da semana de treino atual.

**Features:**
- ✅ Número e nome da semana
- ✅ Foco da semana (ex: "Hipertrofia 65%")
- ✅ Período (datas de início e fim)
- ✅ Status visual com chip colorido (Ativa/Rascunho/Concluída)
- ✅ Quantidade de treinos cadastrados
- ✅ Visualização dos dias da semana com indicadores ✔/✖
- ✅ Botão "Ver Semana Completa"
- ✅ Gradiente visual atraente (roxo/azul)

**Design:**
```
┌─────────────────────────────────────────┐
│ SEMANA ATUAL                            │
│ 01 - Hipertrofia 65%           [Ativa] │
│ ─────────────────────────────────────── │
│ 📅 Período: 05/01 - 11/01/2026          │
│ 🏋️ Treinos: 3 cadastrados               │
│                                         │
│ DIAS DA SEMANA                          │
│ [SEG ✔] [TER ✔] [QUA -] [QUI ✔] [SEX -]│
│                                         │
│         [Ver Semana Completa]           │
└─────────────────────────────────────────┘
```

---

### 2. **WeekWorkouts** (Treinos da Semana)

**Localização:** `src/components/dashboard/WeekWorkouts.tsx`

**Descrição:** Lista horizontal scrollável de cards com os treinos agendados para a semana atual.

**Features:**
- ✅ Cards horizontais scrolláveis
- ✅ Cada card mostra:
  - Nome do treino
  - Dia da semana (ex: "Terça")
  - Data formatada
  - Quantidade de blocos
  - Total de exercícios
  - Botão "Ver Detalhes"
- ✅ Botões de navegação (← →) no desktop
- ✅ Scroll suave
- ✅ Empty state quando não há treinos
- ✅ Botão CTA "Novo Treino"
- ✅ Responsivo (grid no desktop, scroll no mobile)

**Design:**
```
┌─────────────────────────────────────────────────────┐
│ Treinos desta Semana          [+ Novo Treino]       │
│ 3 treinos agendados                                 │
├─────────────────────────────────────────────────────┤
│ ← ┌─────────┐ ┌─────────┐ ┌─────────┐ →           │
│   │[Terça]  │ │[Quinta] │ │[Sexta]  │             │
│   │Treino S1│ │Treino S2│ │Treino S3│             │
│   │10/01/26 │ │12/01/26 │ │14/01/26 │             │
│   │Blocos: 3│ │Blocos: 4│ │Blocos: 3│             │
│   │Exerc: 12│ │Exerc: 15│ │Exerc: 10│             │
│   │[Ver]    │ │[Ver]    │ │[Ver]    │             │
│   └─────────┘ └─────────┘ └─────────┘             │
└─────────────────────────────────────────────────────┘
```

---

### 3. **RecentWeeks** (Semanas Recentes)

**Localização:** `src/components/dashboard/RecentWeeks.tsx`

**Descrição:** Tabela compacta com as 5 semanas mais recentes.

**Features:**
- ✅ Tabela responsiva
- ✅ Colunas:
  - Nome da semana + Foco
  - Período (datas)
  - Status (chip colorido)
  - Nº de treinos
  - Ações (Ver/Editar)
- ✅ Ordenação por data (mais recente primeiro)
- ✅ Limite de 5 semanas
- ✅ Empty state quando não há semanas
- ✅ Botão CTA "Nova Semana"
- ✅ Hover effects

**Design:**
```
┌─────────────────────────────────────────────────────┐
│ Semanas Recentes               [+ Nova Semana]      │
│ Últimas 5 semanas de treino                         │
├──────────┬───────────┬────────┬────────┬───────────┤
│ Nome     │ Período   │ Status │ Treinos│ Ações     │
├──────────┼───────────┼────────┼────────┼───────────┤
│ Semana 5 │ 29/12-04/ │ [Ativa]│   3    │ 👁 ✏️    │
│ Hipert.  │ 01/26     │        │        │           │
├──────────┼───────────┼────────┼────────┼───────────┤
│ Semana 4 │ 22/12-28/ │[Concl.]│   4    │ 👁 ✏️    │
│ Força    │ 12/25     │        │        │           │
└──────────┴───────────┴────────┴────────┴───────────┘
```

---

## 🎨 Design System

Todos os componentes utilizam:

- ✅ **Material-UI** - Componentes base
- ✅ **Theme do projeto** - Cores, tipografia, espaçamentos
- ✅ **Responsividade** - Breakpoints do MUI
- ✅ **Ícones** - @mui/icons-material
- ✅ **Padrões visuais** consistentes

### Cores Utilizadas

| Elemento | Cor | Uso |
|----------|-----|-----|
| Status Ativo | `success` | Verde |
| Status Rascunho | `warning` | Amarelo |
| Status Concluído | `info` | Azul |
| Gradiente Hero | `#667eea → #764ba2` | Roxo |
| Chips de dia com treino | Verde translúcido | Indicador positivo |
| Chips de dia sem treino | Branco translúcido | Indicador neutro |

---

## 📱 Responsividade

### Desktop (≥ 960px)
- Hero section em destaque
- Cards de treinos em linha com scroll horizontal
- Tabela completa visível

### Tablet (600-959px)
- Layout adaptativo
- Cards menores
- Tabela com scroll horizontal se necessário

### Mobile (< 600px)
- Stack vertical
- Cards com largura mínima (280px)
- Scroll horizontal nativo
- Botões full-width quando apropriado

---

## 🔌 Integração com Serviços

### trainingService
```typescript
// Métodos utilizados:
- getWeeksWithTrainings() // Busca semanas com treinos nested
```

### Rotas Utilizadas
```typescript
- paths.semanas       // Listagem de semanas
- paths.treinoNovo    // Criar novo treino
- `/pages/treinos/:id/editar` // Editar treino
```

---

## 🎯 Lógica de Negócio

### Detecção de Semana Atual
```typescript
// Usa dayjs.isBetween para encontrar semana atual
const today = dayjs();
const currentWeek = weeks.find(week => {
  const start = dayjs(week.start_date);
  const end = dayjs(week.end_date);
  return today.isBetween(start, end, 'day', '[]');
});
```

### Mapeamento de Dias
```typescript
const dayMap = {
  'segunda': 1, // Monday
  'terca': 2,
  'quarta': 3,
  'quinta': 4,
  'sexta': 5,
};
```

### Contagem de Exercícios
```typescript
const getTotalExercises = (workout) => {
  return workout.training_blocks.reduce((total, block) => {
    return total + (block.exercise_prescriptions?.length || 0);
  }, 0);
};
```

---

## 🧪 Estados

Todos os componentes seguem o mesmo padrão de estados:

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState<any[]>([]);
```

**Estados visuais:**
1. ⏳ **Loading** - CircularProgress centralizado
2. ❌ **Error** - Alert com mensagem de erro
3. 📭 **Empty** - Estado vazio com CTA
4. ✅ **Success** - Dados renderizados

---

## 🚀 Como Usar

### Importação
```typescript
import { CurrentWeek, WeekWorkouts, RecentWeeks } from 'components/dashboard';
```

### Uso no Dashboard
```typescript
<Grid container spacing={3}>
  <Grid item xs={12}>
    <CurrentWeek />
  </Grid>
  <Grid item xs={12}>
    <WeekWorkouts />
  </Grid>
  <Grid item xs={12}>
    <RecentWeeks />
  </Grid>
</Grid>
```

---

## 🔄 Futuras Melhorias

### Possíveis Adições:
- [ ] Gráfico de progresso semanal
- [ ] Filtros de status nas semanas
- [ ] Busca de semanas
- [ ] Drag & drop para reordenar treinos
- [ ] Preview rápido ao hover
- [ ] Indicador de treinos concluídos vs pendentes
- [ ] Notificações de treinos do dia
- [ ] Integração com calendário

---

## 📄 Arquivos Relacionados

```
src/
├── components/
│   └── dashboard/
│       ├── CurrentWeek.tsx       (Hero Section)
│       ├── WeekWorkouts.tsx      (Cards scrolláveis)
│       ├── RecentWeeks.tsx       (Tabela)
│       └── index.ts              (Exports)
├── pages/
│   └── dashboard/
│       └── Dashboard.tsx         (Página principal)
└── services/
    └── trainingService.ts        (API calls)
```

---

✨ **Dashboard implementado com sucesso!** 🎉
