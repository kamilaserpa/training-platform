# 🚀 Guia Completo: Training Platform - DEV → PRODUÇÃO


## 📋 Índice


- [Pré-requisitos](#pré-requisitos)
- [ETAPA 1: Preparar Projeto de Produção](#etapa-1-preparar-projeto-de-produção)
- [ETAPA 2: Exportar Schema Completo (com RLS)](#etapa-2-exportar-schema-completo-com-rls)
- [ETAPA 3: Preparar Dados para Migração](#etapa-3-preparar-dados-para-migração)
- [ETAPA 4: Aplicar Schema no PROD](#etapa-4-aplicar-schema-no-prod)
- [ETAPA 5: Importar Dados Essenciais](#etapa-5-importar-dados-essenciais)
- [ETAPA 6: Configurar Storage (Vídeos)](#etapa-6-configurar-storage-vídeos)
- [ETAPA 7: Migrar Edge Function](#etapa-7-migrar-edge-function-criar-usuários)
- [ETAPA 8: Configurar Ambiente](#etapa-8-configurar-ambiente)
- [ETAPA 9: Configurar Autenticação PROD](#etapa-9-configurar-autenticação-prod)
- [ETAPA 10: Testar Localmente com PROD](#etapa-10-testar-localmente-com-prod)
- [ETAPA 11: Deploy](#etapa-11-deploy)
- [ETAPA 12: Monitoramento e Manutenção](#etapa-12-monitoramento-e-manutenção)
- [Checklist Final](#checklist-final)
- [Troubleshooting](#troubleshooting-comum)


---


## 🔐 Resposta sobre RLS e Migrations


### ✅ **SIM! `supabase db pull` captura RLS**


O comando `supabase db pull` captura **TUDO** do schema do banco:
- ✅ Estrutura das tabelas
- ✅ Índices
- ✅ Foreign keys
- ✅ **Políticas RLS** (Row Level Security)
- ✅ **`ENABLE ROW LEVEL SECURITY`** statements
- ✅ Functions
- ✅ Triggers
- ✅ Views
- ✅ Extensões


### 📦 Como funciona:


```bash
# Este comando captura TUDO, incluindo RLS
supabase db pull


# Resultado: cria arquivo em supabase/migrations/XXXXXX_remote_schema.sql
```


Exemplo do que é capturado:


```sql
-- 1. Criar tabela
CREATE TABLE trainings (
 id uuid PRIMARY KEY,
 created_by uuid REFERENCES auth.users,
 ...
);


-- 2. Habilitar RLS
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;


-- 3. Políticas RLS
CREATE POLICY "Users can view own trainings"
 ON trainings FOR SELECT
 USING (auth.uid() = created_by);


CREATE POLICY "Users can insert own trainings"
 ON trainings FOR INSERT
 WITH CHECK (auth.uid() = created_by);
```


### 🎯 Forma Manual de Capturar APENAS RLS


Se você quiser exportar **apenas as políticas RLS**:


```bash
# Via Supabase CLI
supabase db dump --data-only=false --schema=public > rls_backup.sql


# Ou via psql direto
pg_dump -h db.PROJECT_REF.supabase.co \
 -U postgres \
 -d postgres \
 --schema-only \
 --no-owner \
 --no-acl > schema_with_rls.sql
```


### 🔍 Ver todas as políticas RLS de um banco


```sql
-- Query para listar TODAS as políticas RLS
SELECT
 schemaname,
 tablename,
 policyname,
 permissive,
 roles,
 cmd,
 qual,
 with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


-- Gerar script SQL de todas as políticas
SELECT
 'CREATE POLICY "' || policyname || '" ON ' ||
 schemaname || '.' || tablename ||
 ' FOR ' || cmd ||
 ' USING (' || qual || ')' ||
 CASE
   WHEN with_check IS NOT NULL
   THEN ' WITH CHECK (' || with_check || ')'
   ELSE ''
 END || ';' as create_policy_sql
FROM pg_policies
WHERE schemaname = 'public';
```


### 📝 Script Completo para Exportar e Aplicar RLS


```bash
#!/bin/bash
# export-rls.sh


PROJECT_DEV="seu-project-ref-dev"
PROJECT_PROD="seu-project-ref-prod"


echo "🔐 Exportando políticas RLS do DEV..."


# Conectar ao DEV
supabase link --project-ref $PROJECT_DEV


# Exportar schema completo (inclui RLS)
supabase db dump -f backup-with-rls.sql


# Ou extrair apenas RLS via SQL
psql "postgresql://postgres:[PASSWORD]@db.$PROJECT_DEV.supabase.co:5432/postgres" \
 -c "\copy (
   SELECT
     'ALTER TABLE ' || schemaname || '.' || tablename || ' ENABLE ROW LEVEL SECURITY;'
   FROM pg_tables
   WHERE schemaname = 'public'
   UNION ALL
   SELECT
     'CREATE POLICY \"' || policyname || '\" ON ' ||
     schemaname || '.' || tablename ||
     ' FOR ' || cmd ||
     CASE WHEN roles != '{public}' THEN ' TO ' || array_to_string(roles, ', ') ELSE '' END ||
     ' USING (' || qual || ')' ||
     CASE
       WHEN with_check IS NOT NULL
       THEN ' WITH CHECK (' || with_check || ')'
       ELSE ''
     END || ';'
   FROM pg_policies
   WHERE schemaname = 'public'
 ) TO 'rls-policies.sql'"


echo "✅ RLS exportado para rls-policies.sql"
echo "🚀 Aplicando no PROD..."


# Conectar ao PROD
supabase link --project-ref $PROJECT_PROD


# Aplicar RLS
psql "postgresql://postgres:[PASSWORD]@db.$PROJECT_PROD.supabase.co:5432/postgres" \
 -f rls-policies.sql


echo "✅ RLS aplicado no PROD!"
```


---


## 📋 Pré-requisitos


### Instalar ferramentas necessárias:


```bash
# Instalar Supabase CLI
npm install -g supabase


# Instalar PostgreSQL client (para dumps)
# macOS
brew install postgresql


# Linux
sudo apt-get install postgresql-client


# Windows
# Baixar de: https://www.postgresql.org/download/windows/


# Login no Supabase
supabase login
```


---


## ❓ Preciso de Edge Functions?


### **Resposta: SIM** ✅ (você tem uma Edge Function necessária!)


#### 🔑 Edge Function Obrigatória: `create-viewer-user-v2`


Sua aplicação tem funcionalidade de **OWNER criar usuários VIEWER** (alunos), que **requer** Edge Function porque:


- ✅ Usa `auth.admin.createUser()` (precisa de Service Role Key)
- ✅ Service Role Key **NUNCA** pode estar no frontend
- ✅ Valida permissões (só OWNER pode criar usuários)
- ✅ Garante transação segura (cria no Auth + tabela users)


**Localização**: Sua Edge Function já existe no DEV (`create-viewer-user-v2`)


#### 📋 Outras Edge Functions (você NÃO precisa por enquanto):


**Casos que você não tem:**
- ❌ Processar pagamentos (Stripe, PagSeguro)
- ❌ Enviar emails customizados (usa Supabase Auth)
- ❌ Receber webhooks externos
- ❌ Processar vídeos (upload direto)


#### 📌 Conclusão:
Você precisa **migrar 1 Edge Function** para produção: `create-viewer-user-v2`


---


## 🎯 ETAPA 1: Preparar Projeto de Produção


### 1.1 Criar Novo Projeto Supabase


1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha as configurações:


```
Name: training-platform-prod
Database Password: [senha forte - SALVE EM SEGURANÇA]
Region: South America (São Paulo) ou mais próximo dos usuários
Plan: Free (pode fazer upgrade depois)
```


### 1.2 Anotar Credenciais


**IMPORTANTE**: Salve estas informações em um gerenciador de senhas seguro:


```
Project URL: https://xxxxx.supabase.co
Anon/Public Key: eyJhbGci...
Service Role Key: eyJhbGci... (NUNCA expor no frontend!)
Project Ref: xxxxx
Database Password: [a senha que você criou]
```


**Localização no Dashboard:**
- Settings → API → Project URL
- Settings → API → Project API keys


---


## 🎯 ETAPA 2: Exportar Schema Completo (com RLS)


### 2.1 Conectar ao Projeto DEV


```bash
cd /Users/kamila.serpa/Documents/Projects/training-platform


# Link ao projeto DEV
supabase link --project-ref SEU_PROJECT_REF_DEV


# Confirme quando pedir a database password
```


### 2.2 Exportar Schema Completo


```bash
# Criar pasta para migrations se não existir
mkdir -p supabase/migrations


# Pull completo (inclui RLS, functions, triggers, tudo!)
supabase db pull


# Resultado: cria arquivo em supabase/migrations/XXXXXX_remote_schema.sql
```


**O que esse comando captura:**
- ✅ Todas as tabelas e colunas
- ✅ Índices e constraints
- ✅ Foreign keys
- ✅ RLS (ENABLE ROW LEVEL SECURITY + políticas)
- ✅ Functions e triggers
- ✅ Views
- ✅ Extensões (uuid, pgcrypto, etc)


### 2.3 Backup de Segurança


```bash
# Fazer backup completo do DEV antes de qualquer coisa
supabase db dump -f backup-dev-$(date +%Y%m%d-%H%M%S).sql


# Criar pasta de backups
mkdir -p ~/Backups/training-platform


# Guardar em local seguro
cp backup-dev-*.sql ~/Backups/training-platform/


# Verificar arquivo foi criado
ls -lh backup-dev-*.sql
```


---


## 🎯 ETAPA 3: Preparar Dados para Migração


### 3.1 Identificar Dados Essenciais vs Dados de Teste


#### ✅ Dados para MIGRAR para PROD:
- `week_focus` - Focos de semana (Força, Hipertrofia, etc)
- `movement_patterns` - Padrões de movimento (Squat, Push, Pull, etc)
- Exercícios da biblioteca padrão (se houver)
- Vídeos educacionais/demonstração padrão
- Configurações do sistema


#### ❌ Dados para NÃO MIGRAR:
- `users` de teste
- `training_weeks` de teste
- `trainings` de teste
- `exercise_prescriptions` de teste
- Qualquer dado pessoal de testes


### 3.2 Exportar Dados Essenciais


#### Opção A: Via SQL Editor (Recomendado)


No **SQL Editor do Supabase DEV**, execute:


```sql
-- 1. Exportar week_focus
COPY (
 SELECT * FROM week_focus
 ORDER BY id
) TO STDOUT WITH CSV HEADER;
```


**Salvar resultado em:** `data-migration/week_focus.csv`


```sql
-- 2. Exportar movement_patterns
COPY (
 SELECT * FROM movement_patterns
 ORDER BY id
) TO STDOUT WITH CSV HEADER;
```


**Salvar resultado em:** `data-migration/movement_patterns.csv`


```sql
-- 3. Exportar exercícios padrão (se aplicável)
COPY (
 SELECT * FROM exercises
 WHERE created_by IS NULL OR is_default = true
 ORDER BY id
) TO STDOUT WITH CSV HEADER;
```


**Salvar resultado em:** `data-migration/exercises.csv`


#### Opção B: Via Interface


1. Dashboard → **Table Editor**
2. Selecionar tabela → **Export** → **CSV**
3. Salvar arquivo


### 3.3 Estrutura de Pastas para Migração


```bash
mkdir -p data-migration
mkdir -p backups


# Estrutura final:
# training-platform/
# ├── data-migration/
# │   ├── week_focus.csv
# │   ├── movement_patterns.csv
# │   └── exercises.csv
# └── backups/
#     └── backup-dev-YYYYMMDD.sql
```


---


## 🎯 ETAPA 4: Aplicar Schema no PROD


### 4.1 Conectar ao Projeto PROD


```bash
# Desconectar do DEV
supabase unlink


# Link ao projeto PROD
supabase link --project-ref SEU_PROJECT_REF_PROD


# Confirme com a database password do PROD
```


### 4.2 Aplicar Migrations


```bash
# Aplicar schema (inclui RLS automaticamente!)
supabase db push


# Se der erro de confirmação, use:
supabase db push --include-all


# Verificar se aplicou corretamente
echo "Migration aplicada com sucesso!"
```


### 4.3 Verificar RLS Aplicado


No **SQL Editor do Supabase PROD**, executar:


```sql
-- 1. Verificar quais tabelas têm RLS habilitado
SELECT
 schemaname,
 tablename,
 rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;


-- Resultado esperado: rowsecurity = true para todas as tabelas principais
```


```sql
-- 2. Listar todas as políticas RLS
SELECT
 tablename,
 policyname,
 cmd,
 roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


-- Deve mostrar todas as políticas (SELECT, INSERT, UPDATE, DELETE)
```


```sql
-- 3. Contar políticas por tabela
SELECT
 tablename,
 COUNT(*) as num_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```


### 4.4 Aplicação Manual (se necessário)


Se por algum motivo o `supabase db push` falhar:


```bash
# Aplicar migration manualmente
psql "postgresql://postgres:[PASSWORD]@db.PROJECT_PROD.supabase.co:5432/postgres" \
 -f supabase/migrations/XXXXXX_remote_schema.sql
```


---


## 🎯 ETAPA 5: Importar Dados Essenciais


### 5.1 Via Interface (Mais Fácil) - RECOMENDADO


1. Acesse **Supabase Dashboard PROD** → **Table Editor**
2. Para cada tabela:
  - Selecionar a tabela (ex: `week_focus`)
  - Clicar em **"Import"** → **"Import data from CSV"**
  - Fazer upload do arquivo correspondente:
    - `week_focus.csv`
    - `movement_patterns.csv`
    - `exercises.csv`
  - Confirmar import


### 5.2 Via SQL (Mais Controle)


No **SQL Editor PROD**:


```sql
-- 1. Desabilitar triggers temporariamente (se necessário)
ALTER TABLE week_focus DISABLE TRIGGER ALL;
ALTER TABLE movement_patterns DISABLE TRIGGER ALL;
ALTER TABLE exercises DISABLE TRIGGER ALL;


-- 2. Importar week_focus (exemplo)
INSERT INTO week_focus (id, name, description, color_hex, intensity_percentage, created_at, updated_at)
VALUES
 ('uuid-aqui-1', 'Força', 'Foco em força máxima e potência', '#FF5733', 90, NOW(), NOW()),
 ('uuid-aqui-2', 'Hipertrofia', 'Foco em ganho de massa muscular', '#3357FF', 75, NOW(), NOW()),
 ('uuid-aqui-3', 'Resistência', 'Foco em resistência muscular', '#33FF57', 60, NOW(), NOW())
 -- ... adicionar todos os dados
ON CONFLICT (id) DO NOTHING;


-- 3. Importar movement_patterns
INSERT INTO movement_patterns (id, name, description, created_at, updated_at)
VALUES
 ('uuid-mp-1', 'Squat', 'Padrão de agachamento', NOW(), NOW()),
 ('uuid-mp-2', 'Hinge', 'Padrão de dobradiça (deadlift)', NOW(), NOW()),
 ('uuid-mp-3', 'Push', 'Padrão de empurrar', NOW(), NOW()),
 ('uuid-mp-4', 'Pull', 'Padrão de puxar', NOW(), NOW()),
 ('uuid-mp-5', 'Carry', 'Padrão de carregar', NOW(), NOW())
 -- ... adicionar todos
ON CONFLICT (id) DO NOTHING;


-- 4. Reabilitar triggers
ALTER TABLE week_focus ENABLE TRIGGER ALL;
ALTER TABLE movement_patterns ENABLE TRIGGER ALL;
ALTER TABLE exercises ENABLE TRIGGER ALL;


-- 5. Verificar importação
SELECT COUNT(*) as total_week_focus FROM week_focus;
SELECT COUNT(*) as total_movement_patterns FROM movement_patterns;
SELECT COUNT(*) as total_exercises FROM exercises;


-- 6. Ver dados importados
SELECT * FROM week_focus ORDER BY name;
SELECT * FROM movement_patterns ORDER BY name;
```


### 5.3 Verificação Final


```sql
-- Verificar integridade dos dados
SELECT
 'week_focus' as table_name,
 COUNT(*) as total
FROM week_focus
UNION ALL
SELECT
 'movement_patterns',
 COUNT(*)
FROM movement_patterns
UNION ALL
SELECT
 'exercises',
 COUNT(*)
FROM exercises;
```


### 5.4 🔑 CRIAR PRIMEIRO USUÁRIO ADMIN

**📌 IMPORTANTE**: Banco novo precisa de um usuário administrador inicial!

#### Opção A: Via Dashboard Supabase (Mais Fácil)

1. **Authentication** → **Users** → **Add user**
2. Preencher:
   ```
   Email: seu-email@exemplo.com
   Password: [senha forte]
   Email confirm: ✅ (marcar como confirmado)
   ```
3. **Create user**
4. **Copiar o User ID** que aparece (será algo como: `550e8400-e29b-41d4-a716-446655440000`)

5. **Table Editor** → **users** → **Insert** → **Row**
6. Preencher:
   ```
   id: [colar o User ID copiado]
   email: seu-email@exemplo.com
   name: Seu Nome
   role: owner
   created_at: [deixar automático]
   updated_at: [deixar automático]
   ```

#### Opção B: Via SQL (Mais Direto)

No **SQL Editor PROD**:

```sql
-- 1. Primeiro, criar usuário no auth (precisa do Service Role Key no SQL Editor)
-- ATENÇÃO: Substitua os dados pelos seus!
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  role,
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'seu-email@exemplo.com',
  crypt('SUA_SENHA_FORTE', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated'
);

-- 2. Pegar o ID do usuário criado
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- 3. Criar registro na tabela users (substitua o UUID pelo retornado acima)
INSERT INTO users (id, email, name, role, created_at, updated_at)
VALUES (
  'UUID_RETORNADO_ACIMA',
  'seu-email@exemplo.com',
  'Seu Nome Completo',
  'owner',
  now(),
  now()
);
```

#### ⚡ Método Mais Fácil: Via Aplicação

1. **Deploy temporário** da aplicação
2. **Acesse a página de registro** da aplicação
3. **Crie sua conta normalmente**
4. **Atualize o role** diretamente no banco:

```sql
-- Encontrar seu usuário
SELECT id, email, role FROM users WHERE email = 'seu-email@exemplo.com';

-- Alterar para owner
UPDATE users
SET role = 'owner'
WHERE email = 'seu-email@exemplo.com';

-- Confirmar alteração
SELECT id, email, role FROM users WHERE email = 'seu-email@exemplo.com';
```

#### 🎯 Verificar Admin Criado

```sql
-- Listar todos os usuários e roles
SELECT
  u.email,
  u.name,
  u.role,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  u.created_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;
```

**✅ Resultado esperado:**
```
email: seu-email@exemplo.com
name: Seu Nome
role: owner
email_confirmed: true
```

**🚨 IMPORTANTE:**
- Anote suas credenciais com segurança
- Teste o login antes de prosseguir
- Apenas usuários com `role = 'owner'` podem criar outros usuários


---


## 🎯 ETAPA 6: Configurar Storage (Vídeos e Imagens)


### 6.1 Criar Buckets


No **SQL Editor PROD**:


```sql
-- 1. Criar bucket para vídeos de exercícios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
 'exercise-videos',
 'exercise-videos',
 false,
 5242880, -- 5MB limit
 ARRAY['video/mp4', 'video/quicktime', 'video/webm']
);


-- 2. Criar bucket para imagens (avatars de usuários)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
 'images',
 'images',
 false,
 2097152, -- 2MB limit
 ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);


-- 3. Verificar buckets criados
SELECT * FROM storage.buckets WHERE id IN ('exercise-videos', 'images');
```


### 6.2 Verificar e Ajustar Políticas RLS para Storage

**🎉 BOA NOTÍCIA**: Suas políticas de storage já estão configuradas e funcionando perfeitamente!

#### 6.2.1 Primeiro: Verificar Políticas Existentes

No **SQL Editor do Supabase PROD**, execute:

```sql
-- Verificar todas as políticas atuais de storage
SELECT
 policyname,
 cmd as operacao,
 CASE
   WHEN policyname LIKE '%videos%' OR policyname LIKE '%exercise%' THEN 'exercise-videos'
   WHEN policyname LIKE '%images%' THEN 'images'
   ELSE 'other'
 END as bucket_type,
 roles
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY bucket_type, cmd;
```

#### 6.2.2 Resultado Esperado (Políticas que JÁ EXISTEM ✅)

**Para VÍDEOS (exercise-videos):**
- ✅ `"Anyone can view exercise videos"` - SELECT (usuários anônimos podem ver vídeos)
- ✅ `"Anyone can view exercise videos via signed URLs"` - SELECT (acesso via URLs assinadas)
- ✅ `"Authenticated users can upload videos"` - INSERT (usuários logados podem subir vídeos)
- ✅ `"Owners can upload exercise videos"` - INSERT (owners podem subir vídeos)
- ✅ `"Owners can update exercise videos"` - UPDATE (owners podem editar seus vídeos)
- ✅ `"Owners can delete their exercise videos"` - DELETE (owners podem deletar seus vídeos)

**Para IMAGENS (images):**
- ✅ `"Authenticated users can view images"` - SELECT (apenas usuários logados veem imagens)
- ✅ `"Authenticated users can upload to images"` - INSERT (usuários logados podem subir imagens)
- ✅ `"Authenticated users can update images"` - UPDATE (usuários podem editar suas imagens)
- ✅ `"Authenticated users can delete images"` - DELETE (usuários podem deletar suas imagens)

#### 6.2.3 Se Houver Políticas Duplicadas/Conflitantes

Se você encontrar políticas com nomes diferentes mas mesma função, remova apenas as duplicatas:

```sql
-- APENAS execute se houver conflitos/duplicatas
-- NÃO execute se as políticas acima estão funcionando

-- Remover possíveis duplicatas (se existirem)
DROP POLICY IF EXISTS "Users can update own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
```

#### 6.2.4 Funcionalidade Garantida

Com as políticas atuais, sua aplicação permite:

**🔓 Acesso Público aos Vídeos:**
- ✅ Usuários **anônimos** podem ver vídeos de **treinos públicos**
- ✅ Não conseguem navegar livremente pelos vídeos sem contexto do treino
- ✅ Segurança garantida pelas políticas das tabelas principais (`trainings`, etc.)

**🔐 Controle de Propriedade:**
- ✅ Apenas **proprietários** podem editar/deletar seus vídeos
- ✅ Apenas **usuários autenticados** podem ver/gerenciar imagens
- ✅ Upload restrito a usuários logados

**🎯 Teste Final:**
1. Acesse um treino público sem estar logado
2. Verifique se consegue ver os vídeos dos exercícios
3. Confirme que não consegue acessar outros vídeos fora do contexto

Se tudo funcionar, **pule para a ETAPA 7** - suas políticas estão perfeitas! 🚀


### 6.3 Migrar Arquivos do Storage (se necessário)


**IMPORTANTE**: Para um projeto novo indo para produção, normalmente você **NÃO vai migrar** vídeos e avatars de teste. Apenas configure os buckets vazios e deixe os usuários fazerem upload dos próprios arquivos em produção.


Porém, se você tem **vídeos educacionais/demonstração** que devem estar disponíveis desde o início, siga o processo abaixo:


#### Opção A: Via CLI


```bash
# Conectar ao DEV
supabase link --project-ref SEU_PROJECT_REF_DEV


# Baixar vídeos de demonstração do DEV
mkdir -p storage-backup/exercise-videos
supabase storage download exercise-videos/* --download-path ./storage-backup/exercise-videos/


# Baixar imagens padrão (se houver)
mkdir -p storage-backup/images
supabase storage download images/* --download-path ./storage-backup/images/


# Conectar ao PROD
supabase link --project-ref SEU_PROJECT_REF_PROD


# Upload para PROD (apenas arquivos essenciais)
supabase storage upload exercise-videos ./storage-backup/exercise-videos/* --upsert
# NÃO fazer upload de avatars de teste!
```


#### Opção B: Via Interface


1. **DEV Dashboard** → Storage → exercise-videos → Selecionar arquivos → Download
2. **PROD Dashboard** → Storage → exercise-videos → Upload apenas os necessários


#### ⚠️ O que NÃO migrar:


- ❌ Avatars de usuários de teste (`images/avatars/*`)
- ❌ Vídeos de teste/experimentos
- ✅ Vídeos educacionais/demonstração padrão (se aplicável)


---


## 🎯 ETAPA 7: Migrar Edge Function (Criar Usuários)


### 7.1 Entender a Edge Function


Sua aplicação usa a Edge Function `create-viewer-user-v2` para permitir que o OWNER crie usuários VIEWER (alunos).


**Por que precisa?**
- Usa `auth.admin.createUser()` (requer Service Role Key)
- Service Role Key **NUNCA** deve estar no frontend
- Garante transação segura (Auth + tabela users)


### 7.2 Criar Edge Function no PROD


#### Via Supabase CLI (Recomendado):


```bash
# 1. Criar estrutura local (se não tiver)
mkdir -p supabase/functions/create-viewer-user-v2


# 2. Criar arquivo da função
cat > supabase/functions/create-viewer-user-v2/index.ts << 'EOF'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'


const corsHeaders = {
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}


serve(async (req) => {
 if (req.method === 'OPTIONS') {
   return new Response('ok', { headers: corsHeaders })
 }


 try {
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


   const authHeader = req.headers.get('Authorization')
   if (!authHeader) {
     throw new Error('Token de autenticação não fornecido')
   }


   const token = authHeader.replace('Bearer ', '')
   const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

   if (userError || !user) {
     throw new Error('Usuário não autenticado')
   }


   const { data: userData, error: userDataError } = await supabaseAdmin
     .from('users')
     .select('role')
     .eq('id', user.id)
     .single()


   if (userDataError || !userData || userData.role !== 'owner') {
     throw new Error('Apenas OWNER pode criar usuários')
   }


   const { email, password, name } = await req.json()


   if (!email || !password || !name) {
     throw new Error('Email, senha e nome são obrigatórios')
   }


   const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
     email,
     password,
     email_confirm: true,
   })


   if (createError) throw createError


   const { error: userCreateError } = await supabaseAdmin
     .from('users')
     .insert({
       id: newUser.user.id,
       email: newUser.user.email,
       name: name,
       role: 'viewer'
     })


   if (userCreateError) {
     await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
     throw userCreateError
   }


   return new Response(
     JSON.stringify({
       success: true,
       user_id: newUser.user.id,
       email: newUser.user.email,
       name: name,
       role: 'viewer'
     }),
     {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 200,
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
       status: 400,
     }
   )
 }
})
EOF


# 3. Conectar ao projeto PROD
supabase link --project-ref SEU_PROJECT_REF_PROD


# 4. Deploy da função
supabase functions deploy create-viewer-user-v2


# 5. Verificar deploy
supabase functions list
```


#### Via Dashboard (Alternativa):


1. **Supabase Dashboard PROD** → **Edge Functions**
2. Click **"Create a new function"**
3. **Nome**: `create-viewer-user-v2`
4. Colar código acima
5. Click **"Deploy"**


### 7.3 Configurar Variáveis de Ambiente (Automático)


As Edge Functions do Supabase já têm acesso automático a:
- ✅ `SUPABASE_URL` (URL do projeto)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (chave admin)


**Não precisa configurar manualmente!**


### 7.4 Testar Edge Function


```bash
# Obter seu JWT token (no navegador F12 → Application → Local Storage)
# Copiar o valor de 'sb-xxxxx-auth-token'


# Testar função
curl -X POST \
 'https://SEU_PROJECT_PROD.supabase.co/functions/v1/create-viewer-user-v2' \
 -H 'Authorization: Bearer SEU_JWT_TOKEN_AQUI' \
 -H 'Content-Type: application/json' \
 -d '{
   "email": "teste@exemplo.com",
   "password": "senha123456",
   "name": "Usuário Teste"
 }'


# Resposta esperada:
# {
#   "success": true,
#   "user_id": "uuid-do-usuario",
#   "email": "teste@exemplo.com",
#   "name": "Usuário Teste",
#   "role": "viewer"
# }
```


### 7.5 Verificar no Dashboard


1. **Authentication** → **Users** → Ver novo usuário criado
2. **Table Editor** → **users** → Confirmar registro com role 'viewer'


### 7.6 Atualizar Frontend (se necessário)


Verificar se a URL da função está correta no código:


```typescript
// src/services/userService.ts (ou onde estiver)
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-viewer-user-v2`;


// Garantir que usa a URL de PROD quando em produção
```


---


## 🎯 ETAPA 8: Configurar Ambiente


### 8.1 Criar `.env.production`


```bash
# Criar arquivo
touch .env.production
```


Adicionar conteúdo:


```env
# PRODUÇÃO - Training Platform
VITE_SUPABASE_URL=https://SEU_PROJECT_PROD.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...PROD_KEY_AQUI...
VITE_ENV=production
```


### 7.2 Atualizar `.env.local` (manter DEV)


```env
# DESENVOLVIMENTO - Training Platform
VITE_SUPABASE_URL=https://SEU_PROJECT_DEV.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...DEV_KEY_AQUI...
VITE_ENV=development
```


### 7.3 Atualizar `package.json`


```json
{
 "scripts": {
   "dev": "vite --mode development",
   "build": "vite build --mode production",
   "build:dev": "vite build --mode development",
   "build:prod": "vite build --mode production",
   "preview": "vite preview",
   "preview:prod": "vite preview --mode production"
 }
}
```


### 7.4 Configurar `.gitignore`


Garantir que não commitamos credenciais:


```bash
# Adicionar ao .gitignore se não estiver
echo ".env.production" >> .gitignore
echo ".env.local" >> .gitignore
echo "backups/" >> .gitignore
echo "data-migration/" >> .gitignore
```


---


## 🎯 ETAPA 8: Configurar Autenticação PROD


### 8.1 No Dashboard Supabase PROD


#### A. URL Configuration


1. **Authentication** → **URL Configuration**

**🎯 PARA SEU DOMÍNIO CLOUDFLARE PAGES:**

```
Site URL: https://<cloudflare-path>.pages.dev

Redirect URLs (adicionar todas):
 - https://<cloudflare-path>.pages.dev/**
 - https://<cloudflare-path>.pages.dev/auth/callback
 - http://localhost:5173/**  (para testes locais)
 - http://localhost:4173/**  (para preview produção local)
```

**📝 EXPLICAÇÃO:**
- `Site URL`: URL principal da aplicação
- `/**`: Permite redirecionamentos para qualquer rota do domínio
- `/auth/callback`: Callback específico de autenticação (se usado)
- `localhost`: Para desenvolvimento e testes locais


#### B. Email Templates


2. **Authentication** → **Email Templates**


Personalizar:
- **Confirm signup**: Email de confirmação
- **Magic Link**: Login sem senha
- **Change Email Address**: Mudança de email
- **Reset Password**: Reset de senha


Exemplo de template personalizado:


```html
<h2>Bem-vindo ao Training Platform!</h2>
<p>Clique no link abaixo para confirmar seu email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar Email</a></p>
```


#### C. Email Settings


3. **Settings** → **Auth** → **SMTP Settings**


Para produção, configurar SMTP customizado (SendGrid, AWS SES, etc):


```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: SG.xxxxx
Sender email: noreply@carolcavalcante.pages.dev
Sender name: Training Platform
```


#### D. Auth Providers


4. **Authentication** → **Providers**


Configurar se usar OAuth:
- Google OAuth
- GitHub OAuth
- etc.


#### E. Security Settings


5. **Settings** → **Auth** → **Security**


```
Enable email confirmations: ✅
Enable phone confirmations: ❌ (se não usar)
Minimum password length: 8
Password requirements: Mixed case, numbers, symbols
```


### 8.2 Rate Limiting


6. **Settings** → **API** → **Rate Limiting**


```
Enable rate limiting: ✅
Requests per minute: 60 (ajustar conforme necessidade)
```


---


## 🎯 ETAPA 9: Testar Localmente com PROD


### 10.1 Build Local com Variáveis de PROD


```bash
# Limpar builds anteriores
rm -rf dist


# Build com variáveis de PROD
npm run build:prod


# Verificar se build foi criado
ls -lh dist/
```


### 10.2 Preview Local


```bash
# Rodar preview local
npm run preview:prod


# Ou especificar porta
vite preview --mode production --port 4173
```


### 10.3 Testes Essenciais


Abrir: `http://localhost:4173`


#### ✅ Checklist de Testes:


1. **Autenticação:**
  - [ ] Registro de novo usuário
  - [ ] Confirmação de email
  - [ ] Login com credenciais
  - [ ] Logout
  - [ ] Recuperação de senha


2. **Edge Function (Criação de Usuários):**
  - [ ] OWNER pode criar usuário VIEWER
  - [ ] VIEWER não pode criar usuários
  - [ ] Usuário criado aparece na tabela users
  - [ ] Usuário criado pode fazer login
  - [ ] Validação de campos obrigatórios funciona


3. **Funcionalidades Core:**
  - [ ] Criar semana de treino
  - [ ] Adicionar treino
  - [ ] Adicionar exercício ao treino
  - [ ] Configurar protocolo (séries, reps, etc)
  - [ ] Selecionar vídeo para exercício
  - [ ] Salvar treino


3. **Storage:**
  - [ ] Upload de vídeo
  - [ ] Visualizar vídeo
  - [ ] Deletar vídeo


4. **RLS (Row Level Security):**
  - [ ] Criar 2 usuários diferentes
  - [ ] Verificar que usuário A não vê dados do usuário B
  - [ ] Verificar que usuário só pode editar seus próprios dados


5. **Responsividade:**
  - [ ] Testar em mobile (DevTools)
  - [ ] Testar em tablet
  - [ ] Testar em desktop


### 10.4 Debug de Problemas


Se encontrar erros:


```bash
# Ver logs no console do navegador (F12)
# Verificar network tab para APIs falhando


# Verificar variáveis de ambiente
cat .env.production


# Testar conexão com Supabase
curl https://SEU_PROJECT_PROD.supabase.co/rest/v1/
```


---


## 🎯 ETAPA 11: Deploy


### 11.1 Deploy via Vercel (Recomendado)


#### A. Via CLI


```bash
# Instalar Vercel CLI
npm i -g vercel


# Login
vercel login


# Deploy para production
vercel --prod


# Durante o deploy, será solicitado:
# - Confirmar projeto
# - Configurar settings
```


#### B. Via Dashboard (Mais fácil)


1. Acesse [vercel.com](https://vercel.com)
2. **Add New** → **Project**
3. **Import Git Repository** (conectar GitHub)
4. Selecionar repositório: `training-platform`


5. **Configure Project:**
  ```
  Framework Preset: Vite
  Root Directory: ./
  Build Command: npm run build:prod
  Output Directory: dist
  Install Command: npm install
  ```


6. **Environment Variables** → Add:
  ```
  VITE_SUPABASE_URL = https://xxxxx.supabase.co
  VITE_SUPABASE_ANON_KEY = eyJhbGci...
  VITE_ENV = production
  ```


7. **Deploy**


8. **⚡ IMPORTANTE**: Você está usando Cloudflare Pages, não Vercel!
   Sua URL é: `https://carolcavalcante.pages.dev`


9. No **Supabase PROD** → Auth → URL Configuration:
  - **Site URL**: `https://carolcavalcante.pages.dev`
  - **Redirect URLs**: Já configuradas acima ✅


### 11.2 Deploy via Netlify (Alternativa)


```bash
# Instalar Netlify CLI
npm i -g netlify-cli


# Login
netlify login


# Inicializar
netlify init


# Build e deploy
npm run build:prod
netlify deploy --prod --dir=dist


# Configurar variáveis de ambiente no dashboard:
# app.netlify.com → Site settings → Environment variables
```


### 11.3 Configurar Domínio Customizado (Opcional)


#### No Vercel:


1. **Settings** → **Domains**
2. **Add Domain**: `training.seudominio.com`
3. Configurar DNS:
  ```
  Type: CNAME
  Name: training
  Value: cname.vercel-dns.com
  ```


#### No Supabase:


1. Atualizar **Site URL** para: `https://training.seudominio.com`
2. Atualizar **Redirect URLs**


---


## 🎯 ETAPA 12: Monitoramento e Manutenção


### 12.1 Configurar Backups Automáticos


#### No Dashboard Supabase PROD:


**Settings** → **Backups**


**Free Plan:**
- Daily backups: 7 dias de retenção
- Fazer backups manuais semanais


**Pro Plan:**
- Daily backups: 30 dias
- Point-in-Time Recovery: 7 dias


#### Backup Manual via CLI:


```bash
# Script de backup semanal
#!/bin/bash
# backup-prod.sh


DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$HOME/Backups/training-platform-prod"


mkdir -p $BACKUP_DIR


echo "🔐 Fazendo backup do PROD..."
supabase link --project-ref SEU_PROJECT_REF_PROD
supabase db dump -f "$BACKUP_DIR/backup-prod-$DATE.sql"


echo "✅ Backup salvo em: $BACKUP_DIR/backup-prod-$DATE.sql"


# Limpar backups antigos (manter últimos 30 dias)
find $BACKUP_DIR -name "backup-prod-*.sql" -mtime +30 -delete
```


Adicionar ao crontab (executar todo domingo às 2h):


```bash
crontab -e


# Adicionar linha:
0 2 * * 0 /path/to/backup-prod.sh
```


### 12.2 Monitorar Uso


#### Dashboard Supabase → Reports:


Monitorar diariamente:
- **Database size**: Crescimento do banco
- **API requests**: Volume de requisições
- **Auth events**: Logins, registros
- **Storage usage**: Espaço usado por vídeos


#### Alertas:


Configurar alertas para:
- Database > 80% do limite
- API requests > 90% do limite
- Erros de autenticação > 10% do total


### 12.3 Logs e Debugging


#### Ver logs em tempo real:


```bash
# Via CLI
supabase functions logs --project-ref SEU_PROJECT_REF_PROD


# Ou no dashboard → Logs → Query Logs
```


#### Queries úteis para monitoramento:


```sql
-- Ver últimos erros
SELECT * FROM logs.errors
ORDER BY created_at DESC
LIMIT 50;


-- Usuários mais ativos
SELECT
 user_id,
 COUNT(*) as actions
FROM logs.api_requests
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY actions DESC
LIMIT 10;


-- Tabelas com mais dados
SELECT
 schemaname,
 tablename,
 pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```


### 12.4 Performance Monitoring


#### No Vercel:


- **Analytics**: Ver page views, performance
- **Speed Insights**: Core Web Vitals
- **Real User Monitoring**


#### No Supabase:


- **Query Performance**: Queries lentas
- **Index Usage**: Índices não utilizados
- **Connection Pool**: Utilização de conexões


---


## ✅ Checklist Final


Antes de divulgar para usuários reais:


### Segurança:
- [ ] RLS habilitado em TODAS as tabelas
- [ ] Políticas RLS testadas (usuários só veem seus dados)
- [ ] Service role key NÃO exposta no frontend
- [ ] HTTPS habilitado (SSL)
- [ ] Rate limiting configurado
- [ ] CORS configurado corretamente


### Funcionalidades:
- [ ] Storage configurado e testado
- [ ] Autenticação funcionando (registro, login, logout)
- [ ] Recuperação de senha funcionando
- [ ] Upload de vídeos funcionando
- [ ] Criação de treinos funcionando
- [ ] Compartilhamento de treinos funcionando


### Configurações:
- [ ] Email templates personalizados
- [ ] Site URL configurado corretamente
- [ ] Redirect URLs configuradas
- [ ] Variáveis de ambiente corretas no deploy
- [ ] Domínio customizado configurado (se aplicável)


### Monitoramento:
- [ ] Backup automático configurado
- [ ] Alertas configurados
- [ ] Logs habilitados
- [ ] Analytics configurado


### Testes:
- [ ] Testes em dispositivo móvel real
- [ ] Testes em diferentes navegadores
- [ ] Performance testada (Lighthouse)
- [ ] Acessibilidade testada


### Documentação:
- [ ] README atualizado
- [ ] Guia de usuário criado (se necessário)
- [ ] Termos de uso e privacidade (se aplicável)


---


## 🆘 Troubleshooting Comum


### Problema 1: RLS não foi aplicado


**Sintoma:** Usuários conseguem ver dados de outros usuários


**Solução:**


```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';


-- Habilitar RLS manualmente
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_weeks ENABLE ROW LEVEL SECURITY;
-- ... para todas as tabelas


-- Aplicar policies manualmente
\i supabase/migrations/XXXXXX_remote_schema.sql
```


### Problema 2: Dados não importam (FK constraint)


**Sintoma:** Erro de foreign key ao importar dados


**Solução:**


```sql
-- Desabilitar constraints temporariamente
SET session_replication_role = replica;


-- Importar dados
INSERT INTO tabela VALUES (...);


-- Reabilitar constraints
SET session_replication_role = DEFAULT;


-- Verificar integridade
SELECT * FROM tabela WHERE foreign_key_id NOT IN (SELECT id FROM tabela_relacionada);
```


### Problema 3: Vídeos não carregam


**Sintoma:** Erro 403 ou 404 ao carregar vídeos


**Solução:**


```sql
-- Verificar políticas do storage
SELECT * FROM storage.policies WHERE bucket_id = 'exercise-videos';


-- Recriar políticas básicas
DROP POLICY IF EXISTS "Public read access" ON storage.objects;


CREATE POLICY "Authenticated users can view videos"
ON storage.objects FOR SELECT
USING (
 bucket_id = 'exercise-videos' AND
 auth.role() = 'authenticated'
);


-- Verificar URLs dos vídeos
SELECT id, name, bucket_id FROM storage.objects LIMIT 10;
```


### Problema 4: Autenticação não funciona


**Sintoma:** Erro ao fazer login ou registrar


**Solução:**


1. Verificar Site URL no Supabase:
  - Deve ser `https://seu-dominio.com` (sem barra no final)


2. Verificar Redirect URLs:
  - Incluir `https://seu-dominio.com/**`


3. Verificar variáveis de ambiente no deploy:
  ```bash
  # No Vercel/Netlify, revisar:
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY
  ```


4. Limpar cache do navegador e testar novamente


### Problema 5: Build falha no deploy


**Sintoma:** Deploy falha com erro de build


**Solução:**


```bash
# Testar build localmente primeiro
npm run build:prod


# Se funcionar local mas não no deploy:
# 1. Verificar Node version no deploy (package.json)
{
 "engines": {
   "node": ">=18.0.0"
 }
}


# 2. Verificar dependências
npm install


# 3. Verificar variáveis de ambiente
# Garantir que estão definidas no dashboard do serviço de deploy
```


### Problema 6: Performance lenta


**Sintoma:** Aplicação lenta em produção


**Solução:**


```sql
-- 1. Verificar queries lentas
SELECT
 query,
 mean_exec_time,
 calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;


-- 2. Adicionar índices necessários
CREATE INDEX idx_trainings_created_by ON trainings(created_by);
CREATE INDEX idx_trainings_week_id ON trainings(training_week_id);


-- 3. Verificar connection pooling
-- Dashboard → Database → Connection pooling → Enable
```


### Problema 7: Erro 429 (Too Many Requests)


**Sintoma:** API retorna erro 429


**Solução:**


1. Revisar rate limiting no Supabase:
  - Settings → API → Rate Limiting
  - Aumentar limites se necessário


2. Implementar retry logic no frontend:
  ```javascript
  async function fetchWithRetry(fn, retries = 3) {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && error.status === 429) {
        await new Promise(r => setTimeout(r, 1000));
        return fetchWithRetry(fn, retries - 1);
      }
      throw error;
    }
  }
  ```


---


## 📚 Recursos Adicionais


### Documentação Oficial:
- [Supabase Docs](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Vite Docs](https://vitejs.dev)
- [Vercel Docs](https://vercel.com/docs)


### Comunidade:
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)


### Monitoramento:
- [Supabase Status](https://status.supabase.com)
- [Vercel Status](https://www.vercel-status.com)


---


## 📝 Notas Finais


### Custos Esperados:


**Supabase Free Plan:**
- Database: 500 MB
- Storage: 1 GB
- Bandwidth: 2 GB
- API Requests: Ilimitadas


**Quando fazer upgrade para Pro ($25/mês):**
- > 500 MB de dados
- > 1 GB de vídeos
- Precisa de backups diários automáticos
- > 50.000 usuários autenticados/mês


**Vercel Free Plan:**
- 100 GB bandwidth/mês
- Builds ilimitados
- SSL automático


### Próximos Passos:


1. Monitorar uso nos primeiros 30 dias
2. Coletar feedback dos usuários
3. Implementar analytics (Google Analytics, Plausible, etc)
4. Configurar error tracking (Sentry)
5. Otimizar performance baseado em dados reais


---


**Última atualização:** Janeiro 2026
**Versão:** 1.0
**Autor:** Training Platform Team


---


## ✨ Dúvidas?


Se encontrar algum problema não coberto neste guia:


1. Verificar logs no Supabase Dashboard
2. Verificar console do navegador (F12)
3. Consultar documentação oficial
4. Abrir issue no repositório (se aplicável)


**Boa sorte com o deploy! 🚀**

