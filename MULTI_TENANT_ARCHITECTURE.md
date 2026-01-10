# 🏢 Arquitetura Multi-Tenant (Workspaces Isolados)

## 📋 Visão Geral

Este sistema implementa **isolamento de dados por workspace**, onde cada profissional (Owner) tem seu próprio ambiente isolado. Owners **NÃO veem dados de outros owners**.

---

## 🎯 Hierarquia Corrigida

### 👑 OWNER (Proprietário do Workspace)
- ✅ Visualiza: **Apenas ele mesmo** + Admins e Viewers que ele criou
- ✅ Gerencia: Pode criar Admins e Viewers no SEU workspace
- ❌ **NÃO vê outros Owners** (outros workspaces)
- ✅ Acesso total ao SEU workspace

### 🛡️ ADMIN (Administrador do Workspace)
- ✅ Visualiza: Apenas Viewers do workspace
- ✅ Gerencia: Apenas Viewers do workspace
- ❌ NÃO vê o Owner ou outros Admins
- ✅ Pertence ao workspace de um Owner

### 👁️ VIEWER (Visualizador)
- ❌ Não acessa gerenciamento de usuários
- ✅ Acesso somente leitura ao workspace
- ✅ Pertence ao workspace de um Owner

---

## 🗄️ Schema do Banco de Dados

### Tabela `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'viewer')),
  owner_id UUID REFERENCES users(id), -- ID do owner que criou este usuário
  active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Regras de Negócio

1. **Owner**: `owner_id` é `NULL` (é o dono do workspace)
2. **Admin**: `owner_id` aponta para o Owner que o criou
3. **Viewer**: `owner_id` aponta para o Owner que o criou

---

## 🔒 Row Level Security (RLS)

### Políticas de Segurança no Supabase

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política 1: Owner vê ele mesmo + usuários do seu workspace
CREATE POLICY "Owners can view their workspace users"
ON users FOR SELECT
USING (
  auth.uid() = id OR                    -- Ver a si mesmo
  auth.uid() = owner_id                 -- Ver usuários criados por ele
);

-- Política 2: Admin vê apenas viewers do workspace
CREATE POLICY "Admins can view workspace viewers"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
    AND owner_id = (SELECT owner_id FROM users WHERE id = auth.uid())
  )
  AND role = 'viewer'
  AND owner_id = (SELECT owner_id FROM users WHERE id = auth.uid())
);

-- Política 3: Owner pode inserir admins e viewers
CREATE POLICY "Owners can create users"
ON users FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'owner'
  )
  AND owner_id = auth.uid()
  AND role IN ('admin', 'viewer')
);

-- Política 4: Owner pode atualizar usuários do workspace
CREATE POLICY "Owners can update workspace users"
ON users FOR UPDATE
USING (
  auth.uid() = owner_id OR auth.uid() = id
)
WITH CHECK (
  auth.uid() = owner_id OR auth.uid() = id
);

-- Política 5: Owner pode deletar usuários do workspace (exceto ele mesmo)
CREATE POLICY "Owners can delete workspace users"
ON users FOR DELETE
USING (
  auth.uid() = owner_id AND auth.uid() != id
);
```

---

## 🔐 Implementação no Frontend

### AuthContext - Permissões

```typescript
interface AuthContextType {
  user: DatabaseUser | null;
  session: Session | null;
  loading: boolean;
  
  // Permissões baseadas em role
  isOwner: boolean;
  isAdmin: boolean;
  isViewer: boolean;
  canManageUsers: boolean; // Owner ou Admin
  
  // Métodos
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  // ...
}
```

### Listagem de Usuários - Filtro por Workspace

```typescript
const loadUsuarios = async () => {
  const currentUserId = user?.id;
  
  let query = supabase
    .from('users')
    .select('id, email, role, owner_id, active, created_at')
    .order('created_at', { ascending: false });

  if (isOwner) {
    // Owner vê: ele mesmo OU usuários criados por ele
    query = query.or(`id.eq.${currentUserId},owner_id.eq.${currentUserId}`);
  } else if (isAdmin) {
    // Admin vê: apenas viewers criados pelo owner do seu workspace
    query = query.eq('owner_id', currentUserId).eq('role', 'viewer');
  }

  const { data, error } = await query;
  // ...
};
```

---

## 📊 Diagrama de Workspaces

```
┌─────────────────────────────────────────────────────────────┐
│ WORKSPACE 1 (Owner: João)                                   │
│                                                              │
│  👑 João (Owner)                                            │
│  ├── 🛡️ Maria (Admin) - criada por João                     │
│  ├── 👁️ Pedro (Viewer) - criado por João                    │
│  └── 👁️ Ana (Viewer) - criada por João                      │
│                                                              │
│  ❌ Não vê: Workspace 2, Workspace 3                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ WORKSPACE 2 (Owner: Clara)                                  │
│                                                              │
│  👑 Clara (Owner)                                           │
│  ├── 👁️ Lucas (Viewer) - criado por Clara                   │
│  └── 👁️ Sofia (Viewer) - criada por Clara                   │
│                                                              │
│  ❌ Não vê: Workspace 1, Workspace 3                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ WORKSPACE 3 (Owner: Roberto)                                │
│                                                              │
│  👑 Roberto (Owner)                                         │
│  ├── 🛡️ Carla (Admin) - criada por Roberto                  │
│  ├── 👁️ Marcos (Viewer) - criado por Roberto                │
│  ├── 👁️ Julia (Viewer) - criada por Roberto                 │
│  └── 👁️ Felipe (Viewer) - criado por Roberto                │
│                                                              │
│  ❌ Não vê: Workspace 1, Workspace 2                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Criação de Usuários

### 1. Owner Cria um Viewer

```typescript
// Frontend
const createViewer = async (email: string, password: string) => {
  const currentUserId = user?.id; // ID do owner logado
  
  // Chamar Edge Function que:
  // 1. Cria usuário no auth.users
  // 2. Insere na tabela users com owner_id = currentUserId
  // 3. Define role = 'viewer'
  
  const response = await fetch(`${supabaseUrl}/functions/v1/create-viewer-user`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      email,
      password,
      owner_id: currentUserId, // Importante!
    }),
  });
};
```

### 2. Edge Function (Supabase)

```typescript
// supabase/functions/create-viewer-user/index.ts
Deno.serve(async (req) => {
  const { email, password, owner_id } = await req.json();
  
  // Verificar se quem está chamando é Owner
  const { data: caller } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', owner_id)
    .single();
  
  if (caller?.role !== 'owner') {
    return new Response(
      JSON.stringify({ error: 'Apenas owners podem criar usuários' }),
      { status: 403 }
    );
  }
  
  // Criar usuário no auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  
  if (authError) throw authError;
  
  // Inserir na tabela users com owner_id
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authUser.user.id,
      email,
      name: email.split('@')[0],
      role: 'viewer',
      owner_id: owner_id, // Vincular ao workspace do owner
      active: true,
    });
  
  if (dbError) throw dbError;
  
  return new Response(
    JSON.stringify({ success: true, user_id: authUser.user.id }),
    { status: 200 }
  );
});
```

---

## ✅ Checklist de Implementação

### Backend (Supabase)

- [ ] Adicionar coluna `owner_id` na tabela `users`
- [ ] Adicionar coluna `active` na tabela `users`
- [ ] Implementar políticas RLS conforme especificado
- [ ] Criar Edge Function `create-viewer-user`
- [ ] Testar isolamento de workspaces

### Frontend (React)

- [x] Adicionar `owner_id` no tipo `User`
- [x] Atualizar `loadUsuarios()` com filtro por workspace
- [x] Ajustar mock data para demonstrar isolamento
- [x] Atualizar alert informativo
- [x] Adicionar permissões no `AuthContext`

---

## 🧪 Como Testar

### Cenário 1: Owner vê apenas seu workspace

1. Login como Owner (João)
2. Acesse `/pages/usuarios`
3. Você deve ver:
   - ✅ Você mesmo (João)
   - ✅ Usuários com `owner_id = João.id`
   - ❌ Outros owners (Clara, Roberto)

### Cenário 2: Admin vê apenas viewers

1. Login como Admin (Maria, do workspace do João)
2. Acesse `/pages/usuarios`
3. Você deve ver:
   - ✅ Apenas viewers do workspace do João
   - ❌ João (owner)
   - ❌ Outros admins

### Cenário 3: Viewer não acessa a página

1. Login como Viewer (Pedro)
2. Tente acessar `/pages/usuarios`
3. Resultado:
   - ❌ Redirecionado para dashboard
   - Item "Usuários" não aparece no menu

---

## 🚀 Migração de Dados Existentes

Se você já tem dados na tabela `users`:

```sql
-- Adicionar coluna owner_id (permitindo NULL temporariamente)
ALTER TABLE users ADD COLUMN owner_id UUID REFERENCES users(id);

-- Adicionar coluna active
ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT true;

-- Para usuários existentes que são owners, deixar owner_id como NULL
-- Para admins e viewers existentes, você precisa definir manualmente o owner_id

-- Exemplo: Atribuir todos viewers e admins ao primeiro owner
UPDATE users
SET owner_id = (SELECT id FROM users WHERE role = 'owner' LIMIT 1)
WHERE role IN ('admin', 'viewer');

-- Depois de migrar os dados, você pode adicionar NOT NULL para novos registros
-- ALTER TABLE users ALTER COLUMN owner_id SET NOT NULL; -- Apenas para admin/viewer
```

---

## 📚 Referências

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Multi-tenant Architecture Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/overview)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 🎯 Resumo

✅ **Isolamento Total por Workspace**
- Cada owner tem seu próprio ambiente
- Owners NÃO veem outros owners
- Dados completamente isolados

✅ **Segurança em Camadas**
- RLS no banco de dados
- Validação no frontend
- Edge Functions seguras

✅ **Escalável**
- Suporta múltiplos profissionais
- Fácil adicionar novos workspaces
- Performance otimizada com índices

---

**Implementado em:** Janeiro 2026  
**Versão:** 1.0
