# 🗄️ Setup do Backend - Arquitetura Multi-Tenant

## 🚨 Erro Atual

Você está vendo este erro porque o banco de dados do Supabase **não tem os campos necessários** para a arquitetura multi-tenant:

```
Failed to load resource: the server responded with a status of 400
```

Os campos `owner_id` e `active` não existem na tabela `users` ainda.

---

## ✅ Solução Rápida: Usar Modo Mock

Até atualizar o banco de dados, você pode usar dados mock para testar a funcionalidade.

### Como ativar o modo mock:

1. **Edite o arquivo `.env`** (na raiz do projeto):

```env
# Adicione ou altere esta linha:
VITE_USE_MOCK=true
```

2. **Reinicie o servidor de desenvolvimento**:

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

3. **Teste a tela de usuários**:
   - Acesse `/pages/usuarios`
   - Você verá 4 usuários mock pré-configurados
   - Todas as ações funcionarão (criar, ativar/desativar)

---

## 🗄️ Solução Definitiva: Atualizar o Banco de Dados

### 1️⃣ Adicionar Colunas na Tabela `users`

Execute este SQL no Supabase SQL Editor:

```sql
-- ==========================================
-- PASSO 1: Adicionar colunas
-- ==========================================

-- Adicionar coluna owner_id (permitindo NULL)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id);

-- Adicionar coluna active
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_owner_id ON users(owner_id);

-- ==========================================
-- PASSO 2: Migrar dados existentes
-- ==========================================

-- Para usuários owner existentes, owner_id deve ser NULL
-- Para admins e viewers existentes, você precisa definir manualmente

-- Exemplo: Se você tem apenas 1 owner, atribuir todos viewers/admins a ele
UPDATE users
SET owner_id = (SELECT id FROM users WHERE role = 'owner' LIMIT 1)
WHERE role IN ('admin', 'viewer') AND owner_id IS NULL;

-- Garantir que todos usuários estão ativos
UPDATE users
SET active = true
WHERE active IS NULL;

-- ==========================================
-- PASSO 3: Criar políticas RLS
-- ==========================================

-- Habilitar RLS na tabela users (se ainda não estiver)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "workspace_isolation_select" ON users;
DROP POLICY IF EXISTS "workspace_isolation_insert" ON users;
DROP POLICY IF EXISTS "workspace_isolation_update" ON users;
DROP POLICY IF EXISTS "workspace_isolation_delete" ON users;

-- Política 1: Owner vê ele mesmo + usuários do workspace
CREATE POLICY "workspace_isolation_select"
ON users FOR SELECT
USING (
  -- Ver a si mesmo
  auth.uid() = id
  OR
  -- Ver usuários criados por ele (se for owner)
  auth.uid() = owner_id
  OR
  -- Admin vê apenas viewers do mesmo workspace
  (
    role = 'viewer'
    AND owner_id IN (
      SELECT id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  )
);

-- Política 2: Owner pode inserir admins e viewers
CREATE POLICY "workspace_isolation_insert"
ON users FOR INSERT
WITH CHECK (
  -- Apenas owners podem criar usuários
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'owner'
  )
  -- E o novo usuário deve ter owner_id = owner atual
  AND owner_id = auth.uid()
  -- E o novo usuário deve ser admin ou viewer
  AND role IN ('admin', 'viewer')
);

-- Política 3: Owner pode atualizar usuários do workspace
CREATE POLICY "workspace_isolation_update"
ON users FOR UPDATE
USING (
  -- Owner pode atualizar ele mesmo
  auth.uid() = id
  OR
  -- Owner pode atualizar usuários do seu workspace
  (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'owner'
    )
  )
)
WITH CHECK (
  -- Mesma lógica
  auth.uid() = id
  OR
  auth.uid() = owner_id
);

-- Política 4: Owner pode deletar usuários do workspace (exceto ele mesmo)
CREATE POLICY "workspace_isolation_delete"
ON users FOR DELETE
USING (
  auth.uid() = owner_id
  AND auth.uid() != id
  AND EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'owner'
  )
);

-- ==========================================
-- PASSO 4: Verificar
-- ==========================================

-- Ver estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Ver todos os usuários
SELECT id, email, role, owner_id, active, created_at
FROM users
ORDER BY created_at DESC;
```

### 2️⃣ Criar Edge Function para Criar Usuários

Crie o arquivo `supabase/functions/create-viewer-user/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase com permissões de admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Obter token de autenticação
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Verificar quem está chamando
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) {
      throw new Error('Não autenticado')
    }

    // Verificar se é Owner
    const { data: caller, error: callerError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (callerError || !caller) {
      throw new Error('Usuário não encontrado')
    }

    if (caller.role !== 'owner' && caller.role !== 'admin') {
      throw new Error('Apenas owners e admins podem criar usuários')
    }

    // Obter dados da requisição
    const { email, password } = await req.json()

    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios')
    }

    // Criar usuário no auth
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) throw authError

    // Inserir na tabela users com owner_id
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUser.user.id,
        email,
        name: email.split('@')[0],
        role: 'viewer',
        owner_id: user.id, // Vincular ao workspace do owner
        active: true,
      })

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUser.user.id,
        message: 'Usuário criado com sucesso'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
```

**Para fazer deploy da Edge Function:**

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Fazer link com seu projeto
supabase link --project-ref SEU_PROJECT_REF

# Fazer deploy da função
supabase functions deploy create-viewer-user
```

---

## 📋 Checklist de Implementação

### Backend (Supabase)

- [ ] Executar SQL para adicionar colunas `owner_id` e `active`
- [ ] Migrar dados existentes (definir `owner_id` para admins/viewers)
- [ ] Criar políticas RLS para isolamento de workspaces
- [ ] Criar Edge Function `create-viewer-user`
- [ ] Fazer deploy da Edge Function
- [ ] Testar isolamento: Login com diferentes owners

### Frontend (Já implementado ✅)

- [x] Adicionar `owner_id` no tipo `User`
- [x] Atualizar `loadUsuarios()` com filtro por workspace
- [x] Ajustar mock data para demonstrar isolamento
- [x] Atualizar alert informativo
- [x] Adicionar permissões no `AuthContext`

---

## 🧪 Como Testar Após Implementação

### 1. Testar Isolamento de Workspaces

```sql
-- Criar 2 owners de teste
INSERT INTO users (id, email, name, role, active)
VALUES 
  ('owner-1-uuid', 'owner1@test.com', 'Owner 1', 'owner', true),
  ('owner-2-uuid', 'owner2@test.com', 'Owner 2', 'owner', true);

-- Criar viewers para cada owner
INSERT INTO users (id, email, name, role, owner_id, active)
VALUES 
  ('viewer-1-uuid', 'viewer1@test.com', 'Viewer 1', 'viewer', 'owner-1-uuid', true),
  ('viewer-2-uuid', 'viewer2@test.com', 'Viewer 2', 'viewer', 'owner-2-uuid', true);
```

### 2. Testar via Frontend

1. Login como `owner1@test.com`
2. Acesse `/pages/usuarios`
3. Você deve ver:
   - ✅ Owner 1 (você)
   - ✅ Viewer 1 (criado por você)
   - ❌ Owner 2 (não deve aparecer)
   - ❌ Viewer 2 (não deve aparecer)

4. Tente criar um novo viewer
5. Verifique que o `owner_id` foi definido corretamente

---

## 🆘 Problemas Comuns

### Erro: "column owner_id does not exist"

**Solução:** Execute o SQL do PASSO 1 para adicionar a coluna.

### Erro: "relation users does not have row level security enabled"

**Solução:** Execute:
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Erro: "Failed to load resource: 400"

**Solução:** Verifique se as políticas RLS estão corretas. Use:
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

### Erro de CORS na Edge Function

**Solução:** Certifique-se de incluir os headers CORS na Edge Function (já inclusos no exemplo acima).

---

## 📚 Referências

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Multi-tenant Architecture](../MULTI_TENANT_ARCHITECTURE.md)

---

**Última atualização:** Janeiro 2026  
**Status:** Aguardando implementação no banco de dados
