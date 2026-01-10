# 🗺️ Estrutura de Rotas - Training Platform

## 📐 Padrão RESTful

Este projeto segue o **padrão RESTful** para URLs, garantindo uma estrutura intuitiva, escalável e de fácil manutenção.

## 🎯 Convenções

### Nomenclatura de URLs
- **Recursos**: Substantivos no plural (`/treinos`, `/exercicios`)
- **Ações**: Verbos explícitos (`/novo`, `/editar`)
- **Hierarquia**: Clara e lógica (`/treinos/:id/editar`)

### Estrutura Padrão
```
/pages/recurso              → Listagem de recursos
/pages/recurso/novo         → Criar novo recurso
/pages/recurso/:id          → Ver detalhes do recurso
/pages/recurso/:id/editar   → Editar recurso existente
```

## 🗂️ Rotas da Aplicação

### 🏠 Autenticação
```typescript
/authentication/sign-in     → Login
/authentication/sign-up     → Cadastro
```

### 📊 Dashboard
```typescript
/pages                      → Dashboard principal
```

### 🏋️ Treinos (CRUD Completo)
```typescript
/pages/treinos                    → Listar todos os treinos
/pages/treinos/novo               → Criar novo treino
/pages/treinos/:id/editar         → Editar treino existente
/pages/treinos/:id                → Ver detalhes do treino (futuro)
```

**Características:**
- ✅ Rotas separadas para criar/editar
- ✅ Formulários em páginas dedicadas
- ✅ URLs bookmarkable e compartilháveis

### 💪 Exercícios (CRUD com Modal)
```typescript
/pages/exercicios           → Listar todos os exercícios
```

**Características:**
- ✅ Listagem principal
- ✅ Criar/Editar via Dialog (modal inline)
- ✅ Não necessita rotas separadas

### 📅 Semanas (CRUD com Modal)
```typescript
/pages/semanas              → Listar todas as semanas
```

**Características:**
- ✅ Listagem principal
- ✅ Criar/Editar via Dialog (modal inline)
- ✅ Não necessita rotas separadas

### ⚙️ Configurações
```typescript
/pages/configuracoes        → Página de configurações
```

**Características:**
- ✅ Página única (singular)
- ✅ Não é um recurso CRUD

### 🌐 Rotas Públicas
```typescript
/treino-publico/:token      → Visualização pública de treino
```

**Características:**
- ✅ Sem prefixo `/pages` (rota pública)
- ✅ Acessível sem autenticação

## 📝 Como Usar

### Navegação Programática

```typescript
import { useNavigate } from 'react-router-dom';
import paths from './routes/paths';

const navigate = useNavigate();

// ✅ Listar treinos
navigate(paths.treinos);

// ✅ Criar novo treino
navigate(paths.treinoNovo);

// ✅ Editar treino
const treinoId = '123';
navigate(paths.treinoEditar(treinoId));

// ✅ Ver treino
navigate(paths.treinoVer(treinoId));
```

### Definir Novas Rotas

1. **Adicione em `paths.ts`:**
```typescript
export default {
  // ...
  alunos: `/${rootPaths.pagesRoot}/alunos`,
  alunoNovo: `/${rootPaths.pagesRoot}/alunos/novo`,
  alunoEditar: (id: string) => `/${rootPaths.pagesRoot}/alunos/${id}/editar`,
};
```

2. **Adicione em `router.tsx`:**
```typescript
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
```

3. **Use no componente:**
```typescript
const { id } = useParams(); // Pegar ID da URL
const isEditMode = !!id;
```

## 🎨 Padrões de Design

### Quando usar Modal (Dialog)?
- ✅ CRUD simples e rápido
- ✅ Formulários pequenos (2-5 campos)
- ✅ Não precisa compartilhar link direto
- **Exemplos:** Exercícios, Semanas

### Quando usar Páginas Separadas?
- ✅ CRUD complexo
- ✅ Formulários grandes (múltiplas seções)
- ✅ Precisa compartilhar link direto
- ✅ Suporta bookmarks
- **Exemplos:** Treinos

## 🔗 Referências

- [REST API Design](https://restfulapi.net/)
- [React Router v6 - URL Params](https://reactrouter.com/en/main/hooks/use-params)
- [GitHub URL Structure](https://github.com)
- [Best Practices for URL Design](https://www.gov.uk/guidance/content-design/url-standards-for-gov-uk)

## 📊 Vantagens do Padrão

✅ **URLs Semânticas**: Fácil de entender
✅ **Bookmarkable**: Pode salvar nos favoritos
✅ **Compartilhável**: Links limpos e diretos
✅ **SEO-Friendly**: Boa estrutura para indexação
✅ **Escalável**: Fácil adicionar novos recursos
✅ **Consistente**: Padrão uniforme em toda aplicação
✅ **Mantível**: Código organizado e previsível

## 🚀 Roadmap

### Próximas Implementações
- [ ] `/pages/alunos` - Gestão de alunos
- [ ] `/pages/avaliacao` - Avaliações físicas
- [ ] `/pages/historico/:alunoId` - Histórico do aluno
- [ ] `/pages/treinos/:id` - Visualização detalhada do treino

---

**Última atualização:** Janeiro 2026
**Padrão:** RESTful
**Framework:** React Router v6
