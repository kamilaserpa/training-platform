# 🗄️ Criação Completa do Banco de Dados - Training Platform

## 📋 Ordem de Execução

Execute os scripts na ordem numérica:

1. **01-schema.sql** - Criação de todas as tabelas e enums
2. **02-rls-policies.sql** - Políticas de segurança (RLS)
3. **03-seed-data.sql** - Dados iniciais (opcional)
4. **04-functions/** - Edge Functions (deploy separado)

---

## 🚀 Como Executar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse: https://app.supabase.com/project/SEU_PROJECT_ID/sql
2. Copie e cole o conteúdo de cada arquivo `.sql` na ordem
3. Clique em "Run" para executar
4. Verifique se não há erros

### Opção 2: Via Supabase CLI

```bash
# 1. Instalar Supabase CLI (se não tiver)
npm install -g supabase

# 2. Login
supabase login

# 3. Link com seu projeto
supabase link --project-ref SEU_PROJECT_REF

# 4. Executar scripts SQL
supabase db reset  # ⚠️ CUIDADO: Apaga tudo!
# Ou execute arquivo por arquivo:
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f 01-schema.sql
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f 02-rls-policies.sql
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f 03-seed-data.sql

# 5. Deploy das Edge Functions
cd 04-functions
supabase functions deploy create-viewer-user
```

---

## 📁 Estrutura dos Arquivos

### 01-schema.sql
- ✅ Enums (UserRole, ShareStatus, BlockType, WeekStatus)
- ✅ Tabelas (users, week_focus, movement_patterns, exercises, etc.)
- ✅ Relacionamentos (Foreign Keys)
- ✅ Índices para performance
- ✅ Triggers para updated_at
- ✅ Campo `owner_id` para multi-tenancy

### 02-rls-policies.sql
- ✅ Habilita RLS em todas as tabelas
- ✅ Políticas de isolamento por workspace
- ✅ Permissões baseadas em roles (owner, admin, viewer)
- ✅ Proteção contra acesso não autorizado

### 03-seed-data.sql (Opcional)
- ✅ Week Focus padrão
- ✅ Movement Patterns padrão
- ✅ Usuário owner inicial (para testes)

### 04-functions/
- ✅ `create-viewer-user` - Criar usuários viewers
- ✅ Validação de permissões
- ✅ CORS configurado

---

## 🔐 Arquitetura Multi-Tenant

### Isolamento de Dados

Cada **Owner** tem seu próprio **workspace isolado**:

```
Owner A (ID: uuid-a)
├── Admin 1 (owner_id: uuid-a)
├── Viewer 1 (owner_id: uuid-a)
└── Viewer 2 (owner_id: uuid-a)

Owner B (ID: uuid-b)
├── Viewer 3 (owner_id: uuid-b)
└── Viewer 4 (owner_id: uuid-b)
```

**Owner A NÃO vê dados do Owner B** e vice-versa.

### Campos de Relacionamento

Todas as tabelas de conteúdo têm `created_by` (UUID do usuário):

- `week_focus` - Criado por
- `movement_patterns` - Criado por
- `exercises` - Criado por
- `training_weeks` - Criado por
- `trainings` - Criado por

**RLS garante que cada owner só vê seu próprio conteúdo.**

---

## ✅ Checklist Pós-Execução

Após executar os scripts, verifique:

### 1. Tabelas Criadas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deve retornar:
- ✅ users
- ✅ week_focus
- ✅ movement_patterns
- ✅ exercises
- ✅ training_weeks
- ✅ trainings
- ✅ training_blocks
- ✅ exercise_prescriptions
- ✅ training_block_movement_patterns
- ✅ user_permissions

### 2. RLS Habilitado

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

Todas as tabelas devem ter `rowsecurity = true`.

### 3. Políticas Criadas

```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Deve retornar múltiplas políticas para cada tabela.

### 4. Dados Seed (Se executou 03-seed-data.sql)

```sql
SELECT COUNT(*) FROM week_focus;
SELECT COUNT(*) FROM movement_patterns;
SELECT COUNT(*) FROM users;
```

Deve retornar > 0 para cada tabela.

### 5. Testar Isolamento

```sql
-- Criar 2 owners de teste
INSERT INTO users (id, email, name, role, active)
VALUES 
  (gen_random_uuid(), 'owner1@test.com', 'Owner 1', 'owner', true),
  (gen_random_uuid(), 'owner2@test.com', 'Owner 2', 'owner', true);

-- Ver se estão criados
SELECT email, role FROM users WHERE role = 'owner';
```

### 6. Edge Functions Deploy

```bash
supabase functions list
# Deve mostrar: create-viewer-user
```

---

## 🆘 Problemas Comuns

### Erro: "relation already exists"

**Solução:** O banco não está limpo. Execute antes:

```sql
-- ⚠️ CUIDADO: Apaga TUDO!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### Erro: "permission denied"

**Solução:** Você precisa de privilégios de superuser. Use o usuário `postgres`.

### Erro: "syntax error near..."

**Solução:** Verifique se copiou o SQL completo. Alguns editores truncam.

### Erro: "column owner_id does not exist" (Frontend)

**Solução:** Execute o script 01-schema.sql novamente. O campo deve existir.

### RLS bloqueando tudo

**Solução:** Verifique se as políticas foram criadas:

```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

Se estiver vazio, execute 02-rls-policies.sql novamente.

---

## 🧪 Testar Após Execução

### 1. Criar Owner via Supabase Auth

No Supabase Dashboard > Authentication > Add User:
- Email: `seu-email@exemplo.com`
- Password: `senha123`
- Email Confirm: ✅ Yes

### 2. Inserir na tabela users

```sql
INSERT INTO users (id, email, name, role, active)
VALUES 
  ('ID_DO_AUTH_USER', 'seu-email@exemplo.com', 'Seu Nome', 'owner', true);
```

### 3. Login no Frontend

1. Abra a aplicação: `npm run dev`
2. Faça login com as credenciais
3. Acesse `/pages/usuarios`
4. Deve ver apenas você mesmo (owner)

### 4. Criar um Viewer

1. Click em "Novo Usuário Viewer"
2. Preencha email e senha
3. Clique em "Criar"
4. Deve aparecer na lista com `owner_id` = seu ID

### 5. Verificar Isolamento

```sql
-- Ver todos os usuários (como superuser)
SELECT id, email, role, owner_id, active FROM users;

-- Ver apenas os do workspace do owner1
-- (deve ser feito via frontend com owner1 logado)
```

---

## 📚 Documentação Adicional

- **MULTI_TENANT_ARCHITECTURE.md** - Arquitetura completa multi-tenant
- **BACKEND_SETUP.md** - Setup detalhado do backend
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **Edge Functions:** https://supabase.com/docs/guides/functions

---

## 🎯 Resumo Rápido

```bash
# 1. Limpar banco (opcional)
# Execute no SQL Editor: DROP SCHEMA public CASCADE; CREATE SCHEMA public;

# 2. Criar estrutura
# Execute no SQL Editor: 01-schema.sql

# 3. Adicionar segurança
# Execute no SQL Editor: 02-rls-policies.sql

# 4. Dados iniciais (opcional)
# Execute no SQL Editor: 03-seed-data.sql

# 5. Deploy Edge Functions
supabase functions deploy create-viewer-user

# 6. Testar no frontend
npm run dev
```

**✅ Pronto! Banco de dados funcional com multi-tenancy!**

---

**Última atualização:** Janeiro 2026  
**Versão:** 1.0.0
