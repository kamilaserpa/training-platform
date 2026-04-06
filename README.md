# 🏋️ Training Platform

Plataforma para gerenciamento de treinos, exercícios e semanas de treinamento.

Sistema completo de gestão profissional de treinos físicos com compartilhamento seguro de treinos individuais para alunos. Aplicação web responsiva, acessível via computador e Android (PWA), protegendo o método do profissional de educação física.

## 🚀 Tecnologias

- **Frontend**: React + Vite
- **Roteamento**: react-router-dom
- **Backend/Banco**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Hospedagem**: GitHub Pages
- **PWA**: Manifest + Service Worker

## 📋 Funcionalidades

### 👤 Owner (Profissional Autenticado)
- Login por email e senha
- Criar, editar e excluir exercícios
- Criar, editar e excluir tipos de treino
- Criar, editar e excluir semanas de periodização
- Criar treinos com múltiplos blocos:
- Padrão de Movimento
- Mobilidade Articular
- Ativação de Core
- Ativação Neural
- Treino
- Condicionamento Físico
- Definir prescrições por bloco
- Associar padrões de movimento
- Adicionar exercícios aos blocos (Core e Treino)
- **Compartilhar treinos via link único**
- Visualizar semanas, histórico e todos os treinos

### 👁️ Visitante / Aluno
- **Acesso somente via link compartilhado**
- Visualiza apenas o treino correspondente ao link
- **Nenhuma listagem global permitida**
- **Nenhuma permissão de escrita**
- Interface limpa e focada no treino

## 🔒 Segurança e Proteção

- **Método protegido**: Visitantes não têm acesso a listagens ou outros treinos
- **Acesso por token**: Cada treino tem um token único de compartilhamento
- **RLS (Row Level Security)**: Políticas rigorosas no Supabase
- Owner: Acesso total
- Visitante: SELECT somente via token_compartilhamento
- Nenhuma escrita permitida para anon

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **exercicios**: Exercícios disponíveis
- **tipos_treino**: Tipos de treino (Hipertrofia, Resistência, etc.)
- **semanas**: Semanas de periodização
- **treinos**: Treinos diários (com token_compartilhamento)
- **blocos_treino**: Blocos que compõem cada treino
- **padroes_movimento**: Padrões fixos de movimento
- **bloco_padrao_movimento**: Associação entre blocos e padrões
- **bloco_exercicios**: Exercícios dentro de cada bloco

### Tipos de Bloco

- **PADRAO_MOVIMENTO**: Bloco com padrões de movimento associados
- **MOBILIDADE_ARTICULAR**: Mobilidade e alongamento
- **ATIVACAO_CORE**: Ativação de core (com prescrição + exercícios)
- **ATIVACAO_NEURAL**: Ativação neural
- **TREINO**: Bloco principal de treino (com prescrição + exercícios)
- **CONDICIONAMENTO_FISICO**: Condicionamento e cardio

### Padrões de Movimento (Fixos)

- DOBRAR E PUXAR H
- EMPURRAR E AGACHAR
- DOBRAR E PUXAR V
- CÁRDIO E CORE
- AGACHAR E EMPURRAR V

## 🛠️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd treinos-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta (plano gratuito)
2. Crie um novo projeto
3. Vá em **Settings > API** e copie:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public** key (VITE_SUPABASE_ANON_KEY)

### 4. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env com suas credenciais reais
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**💡 Dica:** Para desenvolvimento, use `.env.local` em vez de `.env` (veja seção "Ambientes" abaixo)

### 5. Execute o script SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Copie e execute o conteúdo do arquivo `supabase-schema.sql`
3. Isso criará todas as tabelas, índices e políticas RLS necessárias

### 6. Configure a autenticação no Supabase

1. No painel do Supabase, vá em **Authentication > Settings**
2. Configure o **Site URL** (para desenvolvimento: `http://localhost:5173`)
3. Adicione URLs permitidas se necessário
4. Crie um usuário em **Authentication > Users > Add User**

#### Criar usuário owner no projeto Supabase
Se você já tem um usuário no Authentication e quer torná-lo OWNER:

1. Pegue seu UUID do Authentication:
Acesse: https://app.supabase.com/project/[SEU-PROJECT]/auth/users
Copie seu User UID
2. Execute no SQL Editor:
```sql
SELECT create_initial_owner(
    '<SEU-UUID-DO-AUTH>',  -- UUID do usuário no auth.users
    'seu@email.com',       -- Seu email
    'Seu Nome'             -- Seu nome
);
```

### 7. Execute o projeto localmente

```bash
npm run dev
```

Acesse `http://localhost:5173`

---

## 🔧 Executar em Ambiente de Desenvolvimento

### 🎯 Modo Mock (Sem Supabase)

**Use dados simulados** - ideal para refatorar banco sem poluir dados reais:

```bash
# Apenas um comando!
npm run dev:mock
```

**O que acontece:**
- ✅ Banner laranja no topo: "MODO MOCK ATIVO"
- ✅ Login aceita **qualquer email/senha**
- ✅ Dados de usuário simulados
- ✅ **Não precisa de Supabase configurado**
- ✅ Perfeito para refatorar banco de dados

**Para voltar ao Supabase real:**
```bash
npm run dev  # Modo normal
```

---

### Opção 1: Dois Projetos Supabase (Para dados reais)

**Use um projeto Supabase para DEV e outro para PROD** (veja seção "Ambientes" abaixo)

```bash
# 1. Crie dois projetos no Supabase:
# - treinos-dev (dados de teste)
# - treinos-app (dados reais)

# 2. Configure .env.local para desenvolvimento
cp .env.example .env.local
# Edite .env.local com credenciais do projeto DEV

# 3. Configure secrets do GitHub com credenciais PROD
# Settings > Secrets > Actions

# 4. Desenvolva localmente
npm run dev  # → usa .env.local (projeto DEV)

# 5. Deploy
git push origin main  # → usa secrets GitHub (projeto PROD)
```

---

### Opção 2: Supabase Único (Mais Simples)

Se você já configurou o Supabase (passos 1-6 acima):

```bash
# 1. Instale as dependências
npm install

# 2. Verifique se o .env existe e está correto
cat .env
# Deve mostrar:
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-chave-aqui

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

**Resultado esperado:**
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Acesse:** `http://localhost:5173` no navegador

**O que você verá:**
- ✅ Tela inicial com formulário de login
- ✅ Login com email/senha do usuário criado no Supabase
- ✅ Após login: acesso às páginas de gestão de treinos

---

### Comandos Úteis Durante Desenvolvimento

```bash
# Desenvolvimento normal (com Supabase)
npm run dev

# Desenvolvimento com MOCK (sem Supabase) ⭐ NOVO
npm run dev:mock

# Validar código (ESLint)
npm run lint

# Build para testar produção localmente
npm run build
npm run preview  # Acesse http://localhost:4173
```

---

## 🗄️ Ambientes: Desenvolvimento vs Produção

### Problema: Não Poluir o Banco de Produção

**❌ Não faça:** Testar com dados fake no banco de produção

**✅ Solução:** Crie um projeto Supabase separado para desenvolvimento

### Opção 1: Dois Projetos Supabase (Recomendado)

#### 1. Crie Dois Projetos no Supabase

1. **Projeto DEV** (para desenvolvimento)
   - Nome: `treinos-dev` ou similar
   - Use para testar e inserir dados fake

2. **Projeto PROD** (para produção)
   - Nome: `treinos-app` ou similar
   - Apenas dados reais dos usuários

#### 2. Configure Dois Arquivos .env

```bash
# .env (produção - usado no CI/CD)
VITE_SUPABASE_URL=https://seu-projeto-prod.supabase.co
VITE_SUPABASE_ANON_KEY=sua-key-prod

# .env.local (desenvolvimento - usado localmente)
VITE_SUPABASE_URL=https://seu-projeto-dev.supabase.co
VITE_SUPABASE_ANON_KEY=sua-key-dev
```

**⚠️ Importante:**
- `.env.local` tem **prioridade** sobre `.env` no Vite
- `.env.local` está no `.gitignore` (não vai para o GitHub)
- CI/CD usa os **secrets** do GitHub (produção)

#### 3. Como Usar

```bash
# Desenvolvimento (usa .env.local automaticamente)
npm run dev
# → Conecta no banco DEV
# → Pode inserir dados de teste à vontade

# Produção (GitHub Actions usa secrets)
git push origin main
# → Deploy usa o banco PROD
# → Dados reais protegidos
```

Teste

```shell
npm run test:run -- src/pages/treinos/TreinoForm.test.tsx -t "feliz"
```
---

### Opção 2: Supabase CLI Local (Avançado)

Execute o Supabase **totalmente local** com Docker:

```bash
# 1. Instale o Supabase CLI
brew install supabase/tap/supabase  # macOS
# ou
npm install -g supabase             # npm

# 2. Inicie o Supabase local
supabase init
supabase start

# 3. Use as credenciais locais
# API URL: http://localhost:54321
# Anon key: (será mostrada no terminal)

# 4. Configure .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=sua-key-local

# 5. Rode migrações
supabase db reset  # Limpa e recria o banco local
```

**Vantagens:**
- ✅ Banco 100% local (não precisa internet)
- ✅ Dados não vão para nenhum servidor
- ✅ Rápido para testar migrações

**Desvantagens:**
- ⚠️ Requer Docker instalado
- ⚠️ Mais complexo de configurar

---

### Comparação das Opções

| Opção | Facilidade | Custo | Recomendado Para |
|-------|-----------|-------|------------------|
| **Dois Projetos Supabase** | ⭐⭐⭐ Fácil | Grátis | Maioria dos casos |
| **Supabase CLI Local** | ⭐⭐ Médio | Grátis | Projetos avançados |
| **Mocks (frontend/)** | ⭐⭐⭐ Muito fácil | Grátis | Desenvolvimento inicial |

---

## 📱 Deploy no GitHub Pages

### Deploy Automático via CI/CD

O deploy é **totalmente automático** quando você faz merge para `main`:

```bash
# 1. Crie uma branch para sua feature
git checkout -b feature/minha-feature

# 2. Faça suas alterações e commit
git add .
git commit -m "feat: minha feature"
git push origin feature/minha-feature

# 3. Abra um Pull Request para main no GitHub
# O CI irá validar automaticamente (build + testes)

# 4. Após aprovação e merge para main
# O GitHub Actions automaticamente:
#   ✅ Roda validações
#   ✅ Faz build da aplicação
#   ✅ Publica no GitHub Pages
```

### Configuração Inicial (uma vez)

#### 1. Configure as variáveis de ambiente

1. Vá em **Settings > Secrets and variables > Actions**
2. Clique em **New repository secret**
3. Adicione:
   - Nome: `VITE_SUPABASE_URL` | Valor: `https://seu-projeto.supabase.co`
   - Nome: `VITE_SUPABASE_ANON_KEY` | Valor: `sua-chave-anon`

#### 2. Habilite GitHub Pages

1. Vá em **Settings > Pages**
2. Source: **GitHub Actions** ⚠️ (não use branch gh-pages)
3. Salve

#### 3. Workflows Incluídos

O projeto já tem 2 workflows prontos:

- **`ci.yml`** - Validação automática em Pull Requests
- **`deploy.yml`** - Deploy automático em merge para main

### Acessar Aplicação

Após o primeiro deploy:

```
https://seu-usuario.github.io/training-platform/
```

### 7. Atualize o Supabase

No painel do Supabase, em **Authentication > Settings**, adicione a URL de produção:

```
https://seu-usuario.github.io
```

## 🔗 Compartilhamento de Treinos

### Como Compartilhar

1. Acesse um treino na área do Owner
2. Clique no botão **"Compartilhar"**
3. O sistema gerará automaticamente um token único (se ainda não existir)
4. O link será copiado automaticamente para a área de transferência
5. Envie o link para o aluno

### Link de Compartilhamento

O link segue o formato:
```
https://seu-dominio.com/treino-publico/{token}
```

### Segurança do Compartilhamento

- Cada treino tem um token único e não sequencial
- Visitantes só podem ver o treino específico do link
- Nenhuma listagem ou navegação entre treinos é permitida
- O método do profissional permanece protegido

## 📱 PWA (Progressive Web App)

A aplicação já está configurada como PWA:

- **Manifest**: `public/manifest.json`
- **Service Worker**: `public/sw.js`
- **Ícones**: Adicione `icon-192.png` e `icon-512.png` na pasta `public/`

### Adicionar à tela inicial (Android)

1. Abra a aplicação no navegador
2. Toque no menu (3 pontos)
3. Selecione "Adicionar à tela inicial"

## 🎨 Personalização

### Cores

As cores principais estão definidas em:
- Gradiente: `#667eea` → `#764ba2`
- Ajuste nos arquivos CSS conforme necessário

### Ícones PWA

Gere ícones de 192x192 e 512x512 pixels e adicione em `public/`:
- `icon-192.png`
- `icon-512.png`

## 🐛 Troubleshooting

### Erro de autenticação
- Verifique se as credenciais do Supabase estão corretas no `.env`
- Confirme que o RLS está configurado corretamente

### Erro ao fazer deploy
- Verifique se o `base` no `vite.config.js` está correto
- Confirme que as variáveis de ambiente estão configuradas

### PWA não funciona
- Verifique se o Service Worker está registrado (console do navegador)
- Confirme que está usando HTTPS (necessário para PWA)

### Link de compartilhamento não funciona
- Verifique se o token foi gerado corretamente no banco
- Confirme que as políticas RLS permitem SELECT por token para anon

## 📝 Scripts Disponíveis

### Desenvolvimento
- `npm run dev` - Inicia servidor com Supabase real (http://localhost:5173)
- `npm run dev:mock` - ⭐ Inicia servidor com dados MOCK (sem Supabase)
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build local
- `npm run lint` - Valida código com ESLint

### CI/CD (Automático)
- **Pull Request → main**: CI valida build e lint
- **Merge → main**: Deploy automático para GitHub Pages

## 🔐 Políticas RLS (Row Level Security)

O sistema implementa políticas rigorosas de segurança:

- **SELECT**:
- Owner: Acesso a todos os dados
- Visitante: Apenas treinos com token válido
- **INSERT/UPDATE/DELETE**:
- Apenas usuários autenticados (Owner)
- Nenhuma escrita permitida para anon

---

## 👨‍💼 Como Criar Conta para Personal Trainers

### 🎯 Setup Inicial (Apenas Primeira Vez)

**1. Configure o Banco de Dados:**

Abra o [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new) e execute os scripts na pasta [`horizon-v1.0.0/supabase-refactor/`](horizon-v1.0.0/supabase-refactor/):

```sql
-- Execute TODOS os arquivos em ordem:
\i 00-reset-database.sql      -- ⚠️ Apaga tudo (cuidado!)
\i 01-create-types.sql        -- Tipos customizados
\i 02-create-tables.sql       -- Estrutura das tabelas
\i 03-create-functions.sql    -- Funções auxiliares
\i 04-create-policies.sql     -- Políticas de segurança
\i 05-insert-seed-data.sql    -- Dados iniciais
\i 06-create-indexes.sql      -- Índices de performance
\i 99-validate-setup.sql      -- Validação final

-- OU execute apenas este:
\i run-all.sql               -- Script master (faz tudo de uma vez)
```

### 🧑‍💼 Criar Novo Personal Trainer

**Para cada novo personal trainer que usar o sistema:**

**1. Personal se cadastra normalmente:**
- Acessa a aplicação
- Clica em "Cadastrar"
- Preenche email e senha
- Supabase Auth cria o usuário automaticamente

**2. Você (admin) eleva permissão:**

No [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new), execute:

```sql
-- Substituir pelos dados do personal:
SELECT create_initial_owner(
    '<UUID-DO-USUARIO>',    -- Pegar no Supabase Auth > Users
    'personal@email.com',    -- Email do personal
    'Nome do Personal'       -- Nome completo
);
```

**3. Como pegar o UUID do usuário:**
- Supabase Dashboard → Authentication → Users
- Copie o UUID da coluna "ID"
- Example: `c310a67a-3a94-47f9-b3dd-db5fec871e3b`

**Exemplo completo:**
```sql
SELECT create_initial_owner(
    'c310a67a-3a94-47f9-b3dd-db5fec871e3b',
    'joao@personaltrainer.com',
    'João Silva Personal'
);
```

### 🔑 Tipos de Usuário

| **Role** | **Descrição** | **Permissões** |
|----------|---------------|----------------|
| **`owner`** | Personal Trainer Principal | ✅ CRUD completo em todos os dados |
| **`admin`** | Administrador do Sistema | ✅ CRUD completo em todos os dados |
| **`viewer`** | Usuário Básico | ✅ Leitura própria + Edição própria |
| **`guest`** | Visitante (sem conta) | ❌ Apenas links compartilhados |

### 🚨 Importante

- **Owner/Admin**: Pode criar treinos, exercícios e compartilhar links
- **Viewer**: Vê apenas seus próprios dados (se criar conta)
- **Guest**: Acesso apenas via links compartilhados (treinos específicos)
- **Novo usuário padrão**: Sempre começa como `viewer`
- **Para ser Personal**: Admin deve executar `create_initial_owner()`

## 📄 Licença

Copyright © 2025 - Todos os direitos reservados.

Este software é proprietário e seu uso, cópia, distribuição ou modificação não autorizada é expressamente proibida. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para profissionais de educação física**

**Protege seu método. Compartilhe com segurança.**

---

## 🚀 Deploy Rápido

### Deploy DEMO (5 minutos)
```bash
npm run deploy:setup -- mock
git add . && git commit -m "demo" && git push
```

### Deploy PRODUÇÃO (10 minutos)
```bash
# 1. Configure secrets no GitHub (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
# 2. Execute:
npm run deploy:setup -- supabase
git add . && git commit -m "prod" && git push
```

📖 **[Documentação Completa de Deploy →](./README_DEPLOY.md)**

---

