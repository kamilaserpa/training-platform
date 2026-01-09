# 📚 Exemplo de Migração de Página

Este guia mostra como migrar uma página existente para usar o novo sistema padronizado.

---

## 🔴 ANTES (Código Antigo)

```tsx
// src/pages/exercicios/Exercicios.tsx (exemplo antigo)
import { Container, Typography, Box, Stack, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function Exercicios() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header duplicado - cada página criava o seu */}
      <Box sx={{ mb: 4 }}>
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="flex-start"
        >
          <Box>
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Exercícios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gerencie os exercícios disponíveis
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            Novo Exercício
          </Button>
        </Stack>
      </Box>

      {/* Sem breadcrumb */}
      {/* Espaçamentos inconsistentes */}
      {/* Container manual */}

      <Box>
        {/* Conteúdo da página */}
        <ExerciciosTable />
      </Box>
    </Container>
  );
}
```

### ❌ Problemas:
- Container, padding e espaçamentos definidos manualmente
- Header criado manualmente em cada página
- Sem breadcrumb automático
- Código duplicado entre páginas
- Difícil de manter consistência

---

## 🟢 DEPOIS (Código Novo)

```tsx
// src/pages/exercicios/Exercicios.tsx (migrado)
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PageWrapper from 'components/layout/PageWrapper';

export default function Exercicios() {
  return (
    <PageWrapper
      title="Exercícios"
      subtitle="Gerencie os exercícios disponíveis"
      actions={
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Novo Exercício
        </Button>
      }
    >
      {/* Conteúdo da página - mais limpo! */}
      <ExerciciosTable />
    </PageWrapper>
  );
}
```

### ✅ Vantagens:
- ✨ Código mais limpo e legível (30% menos linhas)
- ✨ Breadcrumb automático
- ✨ Espaçamentos consistentes
- ✨ Layout responsivo garantido
- ✨ Container gerenciado pelo MainLayout
- ✨ Fácil manutenção

---

## 📋 CHECKLIST DE MIGRAÇÃO

### Para cada página interna:

- [ ] **1. Remover Container manual**
  ```tsx
  ❌ <Container maxWidth="xl" sx={{ py: 3 }}>
  ✅ (Container já está no MainLayout)
  ```

- [ ] **2. Remover header manual**
  ```tsx
  ❌ <Box sx={{ mb: 4 }}>
  ❌   <Stack direction="row" justifyContent="space-between">
  ❌     <Typography variant="h4">Título</Typography>
  ❌     <Button>Ação</Button>
  ❌   </Stack>
  ❌ </Box>
  
  ✅ <PageWrapper 
       title="Título"
       actions={<Button>Ação</Button>}
     >
  ```

- [ ] **3. Envolver conteúdo com PageWrapper**
  ```tsx
  export default function MinhaPage() {
    return (
      <PageWrapper
        title="Título da Página"
        subtitle="Descrição opcional"
        actions={/* Botões ou filtros */}
      >
        {/* Seu conteúdo aqui */}
      </PageWrapper>
    );
  }
  ```

- [ ] **4. Verificar imports**
  ```tsx
  ✅ import PageWrapper from 'components/layout/PageWrapper';
  ❌ Remover imports não usados (Container, etc)
  ```

- [ ] **5. Testar responsividade**
  - [ ] Mobile (xs)
  - [ ] Tablet (sm, md)
  - [ ] Desktop (lg, xl)

- [ ] **6. Verificar breadcrumb**
  - [ ] Adicionar label no `Breadcrumb.tsx` se necessário

---

## 🎨 EXEMPLOS DE USO DO PAGEWRAPPER

### 1. Página Simples (só título)

```tsx
<PageWrapper title="Dashboard">
  <DashboardContent />
</PageWrapper>
```

### 2. Página com Subtítulo

```tsx
<PageWrapper
  title="Semanas de Treino"
  subtitle="Visualize e gerencie os treinos de cada semana"
>
  <SemanasGrid />
</PageWrapper>
```

### 3. Página com Ação (botão)

```tsx
<PageWrapper
  title="Treinos"
  subtitle="Gerencie seus treinos"
  actions={
    <Button 
      variant="contained" 
      startIcon={<AddIcon />}
      onClick={() => navigate('/pages/treinos/novo')}
    >
      Novo Treino
    </Button>
  }
>
  <TreinosTable />
</PageWrapper>
```

### 4. Página com Múltiplas Ações

```tsx
<PageWrapper
  title="Exercícios"
  subtitle="Biblioteca completa de exercícios"
  actions={
    <Stack direction="row" spacing={2}>
      <TextField
        size="small"
        placeholder="Buscar..."
        InputProps={{
          startAdornment: <SearchIcon />,
        }}
      />
      <Button variant="outlined">
        Filtros
      </Button>
      <Button variant="contained" startIcon={<AddIcon />}>
        Novo
      </Button>
    </Stack>
  }
>
  <ExerciciosGrid />
</PageWrapper>
```

### 5. Página sem Header (raro, mas possível)

```tsx
<PageWrapper>
  {/* Conteúdo sem título - usa apenas espaçamento */}
  <CustomComponent />
</PageWrapper>
```

---

## 🔄 MIGRAÇÃO PASSO A PASSO

### Passo 1: Identifique o Header Atual

Procure por padrões como:
```tsx
<Box sx={{ mb: 4 }}>
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="h4">...</Typography>
    <Button>...</Button>
  </Stack>
</Box>
```

### Passo 2: Extraia os Dados

- **Título**: Texto do Typography h4
- **Subtítulo**: Typography com color="text.secondary" (se existir)
- **Ações**: Botões ou componentes à direita

### Passo 3: Substitua pelo PageWrapper

```tsx
<PageWrapper
  title={/* Título extraído */}
  subtitle={/* Subtítulo extraído */}
  actions={/* Ações extraídas */}
>
  {/* Resto do conteúdo */}
</PageWrapper>
```

### Passo 4: Limpe Imports Não Usados

```tsx
❌ import { Container, Box, Stack } from '@mui/material';
✅ (removidos se não usados em outro lugar)
```

### Passo 5: Teste

- Verifique visualmente em diferentes tamanhos de tela
- Confirme que o breadcrumb aparece
- Teste os botões/ações

---

## 📐 COMPARAÇÃO DE TAMANHO

| Componente | Antes | Depois | Redução |
|------------|-------|--------|---------|
| **Exercicios.tsx** | 180 linhas | 120 linhas | 33% ↓ |
| **Semanas.tsx** | 200 linhas | 140 linhas | 30% ↓ |
| **Treinos.tsx** | 250 linhas | 180 linhas | 28% ↓ |

---

## 🎯 PÁGINAS PRIORITÁRIAS PARA MIGRAR

1. ✅ **Dashboard** - Já usa MainLayout
2. 🔄 **Semanas** - SemanasRefactored.tsx
3. 🔄 **Treinos** - Treinos.tsx e TreinoForm.jsx
4. 🔄 **Exercícios** - Exercicios.tsx
5. 🔄 **Configurações** - Configuracoes.tsx

---

## 💡 DICAS

### ✅ FAZER:
- Usar PageWrapper em TODAS as páginas internas
- Manter consistência nos títulos e subtítulos
- Usar ações para botões principais da página
- Testar em mobile

### ❌ NÃO FAZER:
- Não criar Container dentro do PageWrapper (já existe no MainLayout)
- Não duplicar o título no conteúdo
- Não usar padding/margin excessivo no conteúdo
- Não ignorar o breadcrumb

---

## 🆘 PRECISA DE AJUDA?

### Problemas Comuns:

**Q: O breadcrumb não mostra o nome correto**
```typescript
// Adicione em src/components/layout/Breadcrumb.tsx
const routeLabels: Record<string, string> = {
  'minha-rota': 'Nome Legível',
  // ...
};
```

**Q: As ações não ficam alinhadas**
```tsx
// Use Stack para múltiplas ações
actions={
  <Stack direction="row" spacing={2}>
    <Button>Ação 1</Button>
    <Button>Ação 2</Button>
  </Stack>
}
```

**Q: Preciso de mais espaço vertical**
```tsx
<PageWrapper title="...">
  <Stack spacing={4}> {/* Controle espaçamento interno */}
    <Section1 />
    <Section2 />
  </Stack>
</PageWrapper>
```

---

**🚀 Comece migrando uma página por vez e veja a diferença!**
