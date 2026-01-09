# Refatoração da Tela de Semanas

## 📋 Visão Geral

A tela de Semanas foi completamente refatorada para suportar visualização detalhada dos treinos da semana, permitindo que o treinador visualize, em uma única tela, toda a grade semanal com treinos, blocos, protocolos e exercícios.

---

## 🏗️ Arquitetura

### Estrutura de Arquivos Criados

```
src/
├── data/
│   └── mockSemanas.ts              # Dados mockados das semanas
├── components/
│   └── semanas/
│       ├── BlocoResumo.tsx         # Exibe resumo de um bloco
│       ├── TreinoResumo.tsx        # Exibe resumo expandível de um treino
│       ├── DiaCell.tsx             # Célula de dia (com treino ou botão)
│       ├── SemanaRow.tsx           # Linha de semana (desktop)
│       └── SemanaCard.tsx          # Card de semana (mobile)
└── pages/
    └── semanas/
        ├── Semanas.tsx             # Página original (mantida)
        └── SemanasRefactored.tsx   # Nova página refatorada
```

---

## 📐 Componentes

### 1. **BlocoResumo**
Exibe o resumo de um bloco de treino.

**Props:**
- `bloco: MockBloco` - Dados do bloco

**Estrutura:**
```
Bloco 01 — 4×12
• Agachamento Livre
• Leg Press 45°
• Cadeira Extensora
```

---

### 2. **TreinoResumo**
Exibe o resumo expandível de um treino.

**Props:**
- `treino: MockTreino` - Dados do treino

**Funcionalidades:**
- Accordion para expandir/recolher blocos
- Botão "Ver detalhes" (navega para `/treinos/:id/editar`)
- Lista todos os blocos e exercícios

---

### 3. **DiaCell**
Célula de um dia da semana.

**Props:**
- `dia: MockDia` - Dados do dia
- `diaNome: string` - Nome do dia (segunda, terca, etc.)
- `semanaId: string` - ID da semana

**Comportamento:**
- **Com treino:** Exibe `TreinoResumo`
- **Sem treino:** Exibe botão "+ Adicionar treino" (navega para `/treinos/novo?semana=X&dia=Y`)

---

### 4. **SemanaRow** (Desktop)
Linha expansível de semana para visualização desktop.

**Props:**
- `semana: MockSemana` - Dados da semana

**Estrutura:**
```
┌─ Semana 1 │ Hipertrofia - Membros Inferiores │ Ativa ─┐
│   Grade da Semana                                       │
│   SEG    TER    QUA    QUA    SEX                      │
│  [Card] [Vazio] [Card] [Vazio] [Card]                 │
└─────────────────────────────────────────────────────────┘
```

---

### 5. **SemanaCard** (Mobile)
Card de semana para visualização mobile.

**Props:**
- `semana: MockSemana` - Dados da semana

**Estrutura:**
```
┌────────────────────────┐
│ Semana 1               │
│ Hipertrofia - MI       │
│ [Ativa]                │
├────────────────────────┤
│ ▼ Segunda-feira        │
│   [Treino A]           │
│ ▼ Terça-feira          │
│   [+ Adicionar]        │
└────────────────────────┘
```

---

## 📱 Responsividade

### Desktop (≥900px)
- Tabela com linhas expansíveis
- Grid horizontal de dias (SEG → SEX)
- Cards de treino lado a lado

### Mobile (<900px)
- Cards empilhados verticalmente
- Accordion para cada dia da semana
- Scroll vertical

---

## 🎨 Hierarquia Visual

```
1. Semana (Header)
   ├─ Número da Semana
   ├─ Foco da Semana
   └─ Status (Chip colorido)

2. Grade da Semana (Expandido)
   ├─ Dias da Semana
   │  ├─ Com Treino
   │  │  ├─ Nome do Treino (Expandível)
   │  │  ├─ Botão "Ver detalhes"
   │  │  └─ Blocos
   │  │     ├─ Nome + Protocolo
   │  │     └─ Lista de Exercícios
   │  │
   │  └─ Sem Treino
   │     └─ Botão "+ Adicionar treino"
```

---

## 🔄 Navegação

### Botões de Ação

| Botão | Ação | Parâmetros |
|-------|------|------------|
| **Ver detalhes** | Navega para edição do treino | `/treinos/:id/editar` |
| **+ Adicionar treino** | Cria novo treino | `/treinos/novo?semana=X&dia=Y` |

---

## 📊 Dados Mockados

### Estrutura do Mock

```typescript
interface MockSemana {
  id: string;
  numeroSemana: number;
  focoSemana: string;
  status: 'active' | 'completed' | 'draft';
  dias: {
    segunda: MockDia;
    terca: MockDia;
    quarta: MockDia;
    quinta: MockDia;
    sexta: MockDia;
  };
}

interface MockDia {
  treino?: MockTreino;
}

interface MockTreino {
  id: string;
  nome: string;
  blocos: MockBloco[];
}

interface MockBloco {
  nome: string;
  protocolo: string;
  exercicios: MockExercicio[];
}
```

### Dados de Exemplo

**3 semanas** criadas com diferentes status:
- Semana 1: Hipertrofia (Ativa) - 3 treinos
- Semana 2: Força (Rascunho) - 2 treinos
- Semana 3: Resistência (Concluída) - 3 treinos

---

## 🎯 Funcionalidades

### Filtros
- ✅ **Busca textual** - Por número da semana ou foco
- ✅ **Filtro de status** - Ativa, Rascunho, Concluída

### Interações
- ✅ **Expandir/Recolher** semana
- ✅ **Expandir/Recolher** treino
- ✅ **Visualizar** detalhes do treino
- ✅ **Adicionar** novo treino em dia vazio

---

## 🎨 Material-UI Components Utilizados

### Layout
- `Container` - Container principal
- `Grid` - Grade de dias (desktop)
- `Stack` - Empilhamento de elementos

### Display
- `Table` / `TableRow` - Tabela (desktop)
- `Card` / `CardContent` - Cards (mobile)
- `Accordion` - Dias da semana (mobile)
- `Collapse` - Expansão de conteúdo

### Controls
- `Button` - Botões de ação
- `IconButton` - Botões de ícone
- `Chip` - Status da semana
- `TextField` - Busca
- `Select` - Filtro de status

### Icons
- `KeyboardArrowDown/Up` - Expandir/Recolher
- `ExpandMore` - Accordion
- `Visibility` - Ver detalhes
- `Add` - Adicionar treino
- `Search` - Busca

---

## 🚀 Como Usar

### Acessar a Tela
```
http://localhost:3000/pages/semanas
```

### Expandir uma Semana
1. Clique no ícone de seta (▼) na primeira coluna
2. A grade da semana será exibida

### Ver Detalhes de um Treino
1. Expanda a semana
2. Clique no ícone de olho (👁️) no card do treino
3. Será redirecionado para `/treinos/:id/editar`

### Adicionar Treino
1. Expanda a semana
2. Clique em "+ Adicionar treino" em um dia vazio
3. Será redirecionado para `/treinos/novo?semana=X&dia=Y`

---

## 📝 Observações

### Mantido
- ✅ Página original (`Semanas.tsx`) foi mantida como backup
- ✅ Rotas existentes não foram quebradas
- ✅ Navegação existente permanece funcional

### Dados
- 🔄 Atualmente usando **dados mockados** no frontend
- 🔄 Para produção: substituir `mockSemanas` por chamadas ao `weekService`

### Melhorias Futuras
- [ ] Integrar com backend (substituir mock)
- [ ] Adicionar drag & drop para mover treinos
- [ ] Adicionar copiar/colar treino entre dias
- [ ] Adicionar visualização de calendário mensal
- [ ] Adicionar relatórios de carga semanal

---

## 🎯 Objetivo Alcançado

✅ **Permitir que o treinador visualize, em uma única tela, a semana inteira, com os treinos, blocos, protocolos e exercícios, de forma clara, sem precisar abrir cada treino individualmente.**

---

## 👨‍💻 Tecnologias

- **React** 18
- **TypeScript**
- **Material-UI** v5
- **React Router** v6

---

## 📄 Licença

Este projeto é parte de uma plataforma de treinos e segue a licença do projeto principal.
