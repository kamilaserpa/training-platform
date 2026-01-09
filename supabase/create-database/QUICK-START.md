# ⚡ Quick Start - Recriação do Banco de Dados

## 🎯 Execução Rápida (5 minutos)

### 1️⃣ Limpar Banco (Opcional - ⚠️ Apaga tudo!)

```sql
-- Execute no Supabase SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### 2️⃣ Criar Estrutura

```bash
# Copie e cole no Supabase SQL Editor, nesta ordem:
```

**Arquivo 1:** `01-schema.sql` → Criar tabelas e enums  
**Arquivo 2:** `02-rls-policies.sql` → Adicionar segurança  
**Arquivo 3:** `03-seed-data.sql` → Dados iniciais (opcional)

### 3️⃣ Deploy das Edge Functions

```bash
# No terminal
cd supabase-instructions/create-database/04-functions
supabase functions deploy create-viewer-user
```

### 4️⃣ Criar Primeiro Owner

**Via Supabase Dashboard:**
1. Acesse: Authentication > Add User
2. Email: `seu-email@exemplo.com`
3. Password: `senha123`
4. Email Confirm: ✅ Yes
5. Clique em "Create User"

**Via SQL:**
```sql
-- Pegue o ID do usuário criado no Auth e insira na tabela users:
INSERT INTO users (id, email, name, role, active)
VALUES 
  ('COLE_ID_DO_AUTH_USER', 'seu-email@exemplo.com', 'Seu Nome', 'owner', true);
```

### 5️⃣ Testar no Frontend

```bash
npm run dev
```

1. Login com suas credenciais
2. Acesse `/pages/usuarios`
3. Crie um viewer de teste
4. ✅ Sucesso!

---

## 📋 Checklist Rápido

- [ ] Banco limpo (opcional)
- [ ] Executou `01-schema.sql`
- [ ] Executou `02-rls-policies.sql`
- [ ] Executou `03-seed-data.sql` (opcional)
- [ ] Deploy da Edge Function `create-viewer-user`
- [ ] Criou owner no Auth
- [ ] Inseriu owner na tabela `users`
- [ ] Testou login no frontend
- [ ] Testou criar viewer

---

## 🔍 Verificações

### Verificar Tabelas Criadas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Deve retornar:** 10 tabelas (users, week_focus, exercises, etc.)

### Verificar RLS Habilitado

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Todas devem ter:** `rowsecurity = true`

### Verificar Políticas

```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Deve retornar:** Múltiplas políticas para cada tabela

### Verificar Seed Data

```sql
SELECT 
  (SELECT COUNT(*) FROM week_focus) as week_focus,
  (SELECT COUNT(*) FROM movement_patterns) as movement_patterns,
  (SELECT COUNT(*) FROM exercises) as exercises;
```

### Verificar Edge Functions

```bash
supabase functions list
```

**Deve mostrar:** `create-viewer-user`

---

## 🆘 Se Algo Der Errado

### Erro ao Executar SQL

**Solução:** Copie o SQL completo, cole no editor do Supabase e clique em "Run".

### Erro: "relation already exists"

**Solução:** Execute o DROP SCHEMA do passo 1 primeiro.

### Erro: "permission denied"

**Solução:** Use o usuário `postgres` (superuser).

### Edge Function não funciona

**Solução:**
```bash
# Configurar secrets
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Re-deploy
supabase functions deploy create-viewer-user
```

### Frontend dá erro 400 ao buscar usuários

**Causa:** Banco não foi atualizado ainda.

**Solução:**
1. Execute todos os scripts SQL
2. Ou use modo mock: `VITE_USE_MOCK=true` no `.env`

---

## 📊 Resultado Esperado

### Estrutura do Banco

```
✅ 10 tabelas criadas
✅ 4 enums criados
✅ RLS habilitado em todas as tabelas
✅ 40+ políticas de segurança criadas
✅ Índices para performance
✅ Triggers para updated_at
✅ Seed data com 8 week focus + 14 movement patterns + 20+ exercícios
```

### Arquitetura Multi-Tenant

```
Owner A (você)
├── Ver: Você mesmo
├── Ver: Seus week focus, exercises, trainings
└── Criar: Admins e Viewers no seu workspace

Owner B (outro profissional)
├── Ver: Ele mesmo
├── Ver: Seus próprios dados
└── ❌ NÃO vê seus dados!
```

### Segurança

```
✅ Isolamento total por workspace
✅ RLS protege contra acessos não autorizados
✅ Edge Function valida permissões
✅ Viewers não podem modificar nada
✅ Admins só gerenciam viewers
✅ Owners têm controle total do workspace
```

---

## 🚀 Próximos Passos

1. **Configurar `.env` para produção:**
```env
VITE_USE_MOCK=false
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

2. **Fazer deploy do frontend:**
```bash
npm run deploy:setup -- supabase
# Configurar GitHub Secrets
git push origin main
```

3. **Documentação adicional:**
- `MULTI_TENANT_ARCHITECTURE.md` - Arquitetura completa
- `BACKEND_SETUP.md` - Setup detalhado
- `00-README.md` - Documentação completa dos scripts

---

## 💡 Dicas

### Performance

- Os índices já estão criados no schema
- RLS é eficiente para isolamento
- Use `created_by` para filtrar dados

### Backup

```bash
# Fazer backup antes de resetar
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" > backup.sql

# Restaurar
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < backup.sql
```

### Desenvolvimento Local

```bash
# Usar mock data
VITE_USE_MOCK=true npm run dev

# Usar Supabase real
VITE_USE_MOCK=false npm run dev
```

---

**⏱️ Tempo estimado:** 5-10 minutos  
**📖 Documentação completa:** `00-README.md`  
**🆘 Suporte:** Consulte os arquivos MD na pasta  

**✅ Boa sorte! Seu banco multi-tenant está pronto! 🎉**
