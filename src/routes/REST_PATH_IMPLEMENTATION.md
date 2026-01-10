# 📚 Guia Prático: Adicionar Nova Página com Padrão RESTful

## 🎯 Cenário: Adicionar Gestão de Alunos

Vamos implementar uma nova funcionalidade de gestão de alunos seguindo o padrão RESTful.

## 📋 Checklist de Implementação

- [ ] 1. Definir rotas em `paths.ts`
- [ ] 2. Criar componentes
- [ ] 3. Registrar rotas em `router.tsx`
- [ ] 4. Adicionar no menu `sitemap.ts`
- [ ] 5. Testar navegação

---

## 1️⃣ Passo 1: Definir Rotas (`src/routes/paths.ts`)

```typescript
export default {
  // ... rotas existentes ...
  
  // ==========================================
  // Alunos (CRUD completo com rotas separadas)
  // ==========================================
  alunos: `/${rootPaths.pagesRoot}/alunos`,
  alunoNovo: `/${rootPaths.pagesRoot}/alunos/novo`,
  alunoEditar: (id: string) => `/${rootPaths.pagesRoot}/alunos/${id}/editar`,
  alunoVer: (id: string) => `/${rootPaths.pagesRoot}/alunos/${id}`,
};
```

**Resultado:**
- `/pages/alunos` → Listagem
- `/pages/alunos/novo` → Criar
- `/pages/alunos/:id/editar` → Editar
- `/pages/alunos/:id` → Ver detalhes

---

## 2️⃣ Passo 2: Criar Componentes

### 2.1. Criar Listagem (`src/pages/alunos/Alunos.tsx`)

```typescript
import { useNavigate } from 'react-router-dom';
import paths from '../../routes/paths';

export default function Alunos() {
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(paths.alunoEditar(id));
  };

  const handleCreate = () => {
    navigate(paths.alunoNovo);
  };

  return (
    <Container>
      <Button onClick={handleCreate}>
        Adicionar Aluno
      </Button>
      
      {/* Lista de alunos */}
      {alunos.map(aluno => (
        <Card key={aluno.id}>
          <Button onClick={() => handleEdit(aluno.id)}>
            Editar
          </Button>
        </Card>
      ))}
    </Container>
  );
}
```

### 2.2. Criar Formulário (`src/pages/alunos/AlunoForm.tsx`)

```typescript
import { useParams, useNavigate } from 'react-router-dom';
import paths from '../../routes/paths';

export default function AlunoForm() {
  const { id } = useParams();  // ✅ Pegar ID da URL
  const navigate = useNavigate();
  const isEditMode = !!id;      // ✅ Modo edição ou criação

  const handleSubmit = async (data) => {
    if (isEditMode) {
      await updateAluno(id, data);
    } else {
      await createAluno(data);
    }
    
    // Voltar para listagem
    navigate(paths.alunos);
  };

  const handleCancel = () => {
    navigate(paths.alunos);
  };

  return (
    <Container>
      <Typography variant="h4">
        {isEditMode ? 'Editar Aluno' : 'Novo Aluno'}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        {/* Campos do formulário */}
        
        <Button type="submit">
          {isEditMode ? 'Atualizar' : 'Criar'}
        </Button>
        <Button onClick={handleCancel}>
          Cancelar
        </Button>
      </form>
    </Container>
  );
}
```

### 2.3. Estrutura de Arquivos

```
src/pages/alunos/
├── Alunos.tsx          → Listagem
├── AlunoForm.tsx       → Criar/Editar
└── AlunoDetalhes.tsx   → Visualização (opcional)
```

---

## 3️⃣ Passo 3: Registrar Rotas (`src/routes/router.tsx`)

```typescript
// Importar componentes
const Alunos = lazy(() => import('../pages/alunos/Alunos'));
const AlunoForm = lazy(() => import('../pages/alunos/AlunoForm'));

export const routes = [
  {
    element: <App />,
    children: [
      {
        path: rootPaths.root,
        element: <MainLayout><Outlet /></MainLayout>,
        children: [
          // ... rotas existentes ...
          
          // ==========================================
          // Alunos
          // ==========================================
          {
            path: paths.alunos,
            element: <Alunos />,
          },
          {
            path: paths.alunoNovo,
            element: <AlunoForm />,
          },
          {
            path: `${paths.alunos}/:id/editar`,
            element: <AlunoForm />,
          },
          {
            path: `${paths.alunos}/:id`,
            element: <AlunoDetalhes />,
          },
        ],
      },
    ],
  },
];
```

---

## 4️⃣ Passo 4: Adicionar ao Menu (`src/routes/sitemap.ts`)

```typescript
const sitemap: MenuItem[] = [
  // ... itens existentes ...
  
  {
    id: 9,
    subheader: 'Alunos',
    path: paths.alunos,
    icon: 'ic:round-people',
  },
];
```

---

## 5️⃣ Passo 5: Criar Service (Opcional)

```typescript
// src/services/alunoService.ts
import { supabase } from '../lib/supabase';

class AlunoService {
  async getAllAlunos() {
    const { data, error } = await supabase
      .from('alunos')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  async getAlunoById(id: string) {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createAluno(alunoData) {
    const { data, error } = await supabase
      .from('alunos')
      .insert(alunoData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateAluno(id: string, alunoData) {
    const { data, error } = await supabase
      .from('alunos')
      .update(alunoData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteAluno(id: string) {
    const { error } = await supabase
      .from('alunos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

export const alunoService = new AlunoService();
```

---

## 🧪 Testando a Implementação

### Teste 1: Listagem
```bash
# Navegar para: http://localhost:3000/pages/alunos
✅ Deve mostrar lista de alunos
✅ Botão "Adicionar Aluno" deve estar visível
```

### Teste 2: Criar Novo
```bash
# Clicar em "Adicionar Aluno"
# URL deve ser: http://localhost:3000/pages/alunos/novo
✅ Formulário em branco
✅ Título "Novo Aluno"
✅ Botão "Criar"
```

### Teste 3: Editar Existente
```bash
# Clicar em "Editar" em um aluno
# URL deve ser: http://localhost:3000/pages/alunos/[id]/editar
✅ Formulário preenchido com dados
✅ Título "Editar Aluno"
✅ Botão "Atualizar"
```

### Teste 4: Navegação
```bash
✅ Voltar/Cancelar retorna para /pages/alunos
✅ Após salvar retorna para /pages/alunos
✅ Menu lateral funciona corretamente
```

---

## ❌ Erros Comuns

### Erro 1: 404 ao acessar rota de edição
**Problema:** Rota não registrada corretamente
```typescript
// ❌ Errado
{
  path: paths.alunoEditar, // função não executada
  element: <AlunoForm />,
}

// ✅ Correto
{
  path: `${paths.alunos}/:id/editar`,
  element: <AlunoForm />,
}
```

### Erro 2: useParams() retorna undefined
**Problema:** Não importou `useParams` corretamente
```typescript
// ❌ Errado
import { useNavigate } from 'react-router-dom';

// ✅ Correto
import { useNavigate, useParams } from 'react-router-dom';
```

### Erro 3: Navegação não funciona
**Problema:** Path com typo ou não registrado
```typescript
// ❌ Errado
navigate('/pages/aluno/novo'); // singular

// ✅ Correto
navigate(paths.alunoNovo); // usar constante
```

---

## 🎯 Boas Práticas

### ✅ DO (Faça)
- Use constantes de `paths.ts` sempre
- Use `useParams()` para pegar IDs da URL
- Mantenha formulários de edição/criação no mesmo componente
- Retorne para listagem após salvar
- Adicione loading states

### ❌ DON'T (Não Faça)
- Não use query strings para IDs (`?id=123`)
- Não use strings hardcoded para rotas
- Não crie componentes separados para criar/editar sem necessidade
- Não esqueça de adicionar no menu
- Não esqueça de registrar no router

---

## 📊 Comparação: Modal vs Página Separada

### Use Modal quando:
✅ Formulário simples (2-5 campos)
✅ Edição rápida
✅ Não precisa compartilhar link
✅ Exemplo: Exercícios, Tags, Categorias

### Use Página Separada quando:
✅ Formulário complexo (múltiplas seções)
✅ Precisa de URL própria
✅ Precisa compartilhar/bookmarkar
✅ Exemplo: Treinos, Alunos, Avaliações

---

**Dúvidas?** Consulte o `README.md` nesta pasta!


____

# ⚡ Referência Rápida - Rotas RESTful

## 🎯 Cheat Sheet

### Todas as Rotas da Aplicação

```typescript
// ==========================================
// 🏠 AUTENTICAÇÃO
// ==========================================
/authentication/sign-in                → Login
/authentication/sign-up                → Cadastro

// ==========================================
// 📊 DASHBOARD
// ==========================================
/pages                                 → Dashboard

// ==========================================
// 🏋️ TREINOS (CRUD Completo)
// ==========================================
/pages/treinos                         → Listar todos
/pages/treinos/novo                    → Criar novo
/pages/treinos/:id/editar              → Editar existente
/pages/treinos/:id                     → Ver detalhes

// ==========================================
// 💪 EXERCÍCIOS (Modal)
// ==========================================
/pages/exercicios                      → Lista + CRUD Modal

// ==========================================
// 📅 SEMANAS (Modal)
// ==========================================
/pages/semanas                         → Lista + CRUD Modal

// ==========================================
// ⚙️ CONFIGURAÇÕES
// ==========================================
/pages/configuracoes                   → Página única

// ==========================================
// 🌐 PÚBLICO
// ==========================================
/treino-publico/:token                 → Treino público
```

---

## 💻 Snippets de Código

### Navegação Básica
```typescript
import { useNavigate } from 'react-router-dom';
import paths from './routes/paths';

const navigate = useNavigate();

// Ir para listagem
navigate(paths.treinos);

// Criar novo
navigate(paths.treinoNovo);

// Editar existente
navigate(paths.treinoEditar('id-do-treino'));
```

### Pegar ID da URL
```typescript
import { useParams } from 'react-router-dom';

function TreinoForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  
  return <h1>{isEditMode ? 'Editar' : 'Criar'} Treino</h1>;
}
```

### Voltar para Listagem
```typescript
const handleCancel = () => {
  navigate(paths.treinos);
};

const handleSave = async (data) => {
  await saveData(data);
  navigate(paths.treinos);
};
```

---

## 🎨 Quando usar?

### Modal (Dialog)
```typescript
✅ Formulário pequeno (2-5 campos)
✅ Edição rápida
✅ Não precisa de URL própria
📝 Exemplos: Exercícios, Semanas
```

### Página Separada
```typescript
✅ Formulário complexo
✅ Múltiplas seções
✅ Precisa compartilhar link
✅ Bookmarkable
📝 Exemplos: Treinos, Alunos
```

---

## 🚨 Erros Comuns

### ❌ NÃO use query strings
```typescript
// ❌ ERRADO
navigate('/treinos?id=123')

// ✅ CORRETO
navigate(paths.treinoEditar('123'))
```

### ❌ NÃO use strings hardcoded
```typescript
// ❌ ERRADO
navigate('/pages/treinos/novo')

// ✅ CORRETO
navigate(paths.treinoNovo)
```

### ❌ NÃO esqueça useParams
```typescript
// ❌ ERRADO
const id = location.search.get('id')

// ✅ CORRETO
const { id } = useParams()
```

---

## 📱 URLs por Funcionalidade

| Ação | URL | Método Navegação |
|------|-----|------------------|
| Ver todos os treinos | `/pages/treinos` | `navigate(paths.treinos)` |
| Criar treino | `/pages/treinos/novo` | `navigate(paths.treinoNovo)` |
| Editar treino | `/pages/treinos/abc123/editar` | `navigate(paths.treinoEditar('abc123'))` |
| Ver exercícios | `/pages/exercicios` | `navigate(paths.exercicios)` |
| Ver semanas | `/pages/semanas` | `navigate(paths.semanas)` |
| Configurações | `/pages/configuracoes` | `navigate(paths.configuracoes)` |

---

## 🔧 Adicionar Nova Página (Quick)

```typescript
// 1. paths.ts
export default {
  alunos: '/pages/alunos',
  alunoNovo: '/pages/alunos/novo',
  alunoEditar: (id) => `/pages/alunos/${id}/editar`,
};

// 2. router.tsx
{
  path: paths.alunos,
  element: <Alunos />,
},
{
  path: paths.alunoNovo,
  element: <AlunoForm />,
},
{
  path: `${paths.alunos}/:id/editar`,
  element: <AlunoForm />,
},

// 3. sitemap.ts
{
  id: 9,
  subheader: 'Alunos',
  path: paths.alunos,
  icon: 'ic:round-people',
},

// 4. Componente
const { id } = useParams();
const isEditMode = !!id;
```

---

## 📚 Documentação Completa

- **Visão Geral:** `README.md`
- **Guia Passo a Passo:** `EXEMPLO_IMPLEMENTACAO.md`
- **Changelog:** `ROTAS_RESTFUL_CHANGELOG.md` (raiz do projeto)
- **Esta Referência:** `QUICK_REFERENCE.md`

---

**Última atualização:** Janeiro 2026  
**Versão:** 2.0.0

