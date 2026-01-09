# 🚀 Documentação de Deploy - Training Platform

## 📚 Documentação Disponível

Este projeto possui documentação completa e simplificada para deploy:

### 1️⃣ **DEPLOY.md** ⭐ COMECE AQUI
**Guia completo de deploy** com suporte a 3 ambientes:
- 🎭 **Mock** - Demo sem banco de dados
- 🧪 **Staging** - Homologação com Supabase de desenvolvimento
- 🚀 **Production** - Produção com Supabase real

**Conteúdo:**
- Quick start (3 comandos)
- Configuração de secrets
- Estrutura de ambientes
- Fluxo de trabalho recomendado
- Troubleshooting
- Checklist completo

👉 **[Abrir DEPLOY.md](./DEPLOY.md)**

---

### 2️⃣ **ENV_VARS.md**
**Variáveis de ambiente detalhadas**

Explica todas as variáveis disponíveis:
- `VITE_USE_MOCK`
- `VITE_SUPABASE_URL` (Production)
- `VITE_SUPABASE_ANON_KEY` (Production)
- `VITE_SUPABASE_STAGING_URL` (Staging)
- `VITE_SUPABASE_STAGING_KEY` (Staging)

**Inclui:**
- Como usar em desenvolvimento local
- Como configurar no GitHub
- Troubleshooting de variáveis

👉 **[Abrir ENV_VARS.md](./ENV_VARS.md)**

---

## ⚡ Quick Start (30 segundos)

### Para Demo (Mock):
```bash
npm run deploy:setup -- mock
git add .github/workflows/deploy.yml
git commit -m "chore: configure mock deploy"
git push origin main
```

### Para Staging (Homologação):
```bash
# 1. Configure secrets de staging no GitHub
# 2. Execute:
npm run deploy:setup -- staging
git add .github/workflows/deploy.yml
git commit -m "chore: configure staging deploy"
git push origin main
```

### Para Production (Produção):
```bash
# 1. Configure secrets de production no GitHub
# 2. Execute:
npm run deploy:setup -- production
git add .github/workflows/deploy.yml
git commit -m "chore: configure production deploy"
git push origin main
```

---

## 🎯 Qual Ambiente Usar?

| Situação | Ambiente | Tempo Setup |
|----------|----------|-------------|
| 🎨 Portfolio, apresentações | **Mock** | 2 min |
| 🧪 Testes antes da produção | **Staging** | 10 min |
| 🚀 Usuários finais | **Production** | 10 min |

---

## 📁 Estrutura de Arquivos

```
training-platform/
├── DEPLOY.md                           ⭐ Guia completo
├── ENV_VARS.md                         🔐 Variáveis de ambiente
├── README_DEPLOY.md                    📖 Este arquivo (índice)
│
├── .github/workflows/
│   ├── deploy.yml                      ✅ Workflow ATIVO
│   ├── deploy-mock.yml.disabled        📦 Template Mock
│   ├── deploy-staging.yml.disabled     📦 Template Staging
│   ├── deploy-production.yml.disabled  📦 Template Production
│   └── ci.yml                          🔄 CI para Pull Requests
│
├── scripts/
│   └── switch-deploy.js                🎛️  Script helper
│
└── supabase-instructions/
    └── create-database/                🗄️  Scripts SQL
        ├── 00-README.md
        ├── QUICK-START.md
        ├── 01-schema.sql
        ├── 02-rls-policies.sql
        └── 03-seed-data.sql
```

---

## 🔧 Comandos Disponíveis

```bash
# Ver status atual
npm run deploy:setup -- status

# Alternar para Mock (demo)
npm run deploy:setup -- mock

# Alternar para Staging (homologação)
npm run deploy:setup -- staging

# Alternar para Production (produção)
npm run deploy:setup -- production

# Menu interativo
npm run deploy:setup
```

---

## 🆘 Precisa de Ajuda?

1. **Leia primeiro:** [DEPLOY.md](./DEPLOY.md)
2. **Variáveis confusas?** [ENV_VARS.md](./ENV_VARS.md)
3. **Banco de dados:** [supabase/create-database/](supabase/create-database/)

---

## 📊 3 Ambientes Explicados

### 🎭 Mock (Demo)
- ✅ Dados fake hardcoded
- ✅ Zero configuração
- ✅ Perfeito para portfolio
- ❌ Não persiste dados

### 🧪 Staging (Homologação)
- ✅ Banco Supabase de **desenvolvimento**
- ✅ Dados reais mas de teste
- ✅ Pode resetar sem problemas
- ✅ Teste antes de produção

### 🚀 Production (Produção)
- ✅ Banco Supabase de **produção**
- ✅ Dados reais de usuários
- ⚠️ NUNCA resetar
- ✅ Aplicação final

**Recomendação:** Use **2 projetos Supabase**
- `training-platform-dev` para Staging
- `training-platform-prod` para Production

---

## 🎓 Fluxo de Trabalho Recomendado

```
1. Desenvolvimento Local
   ↓ (usa staging)
   
2. Deploy para Staging
   ↓ (testar e validar)
   
3. Deploy para Production
   ✅ (usuários finais)
```

---

## ✅ Tudo Simplificado!

A documentação foi consolidada em **apenas 2 arquivos**:

1. **DEPLOY.md** - Guia completo de deploy
2. **ENV_VARS.md** - Variáveis de ambiente

**Antes:** 9 arquivos de documentação  
**Agora:** 2 arquivos essenciais

**✨ Menos confusão, mais produtividade!**

---

_Última atualização: Janeiro 2026_
