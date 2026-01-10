# 🚀 Guia de Deploy - Training Platform

> **Guia completo e simplificado** para fazer deploy da aplicação

---

## 🎯 Ambientes Disponíveis

| Ambiente | Descrição | Uso | Banco |
|----------|-----------|-----|-------|
| **Mock** | Demo com dados fake | Portfolio, apresentações | ❌ Nenhum |
| **Staging** | Homologação com banco real | Testes antes da produção | ✅ Supabase DEV |
| **Production** | Aplicação final | Usuários reais | ✅ Supabase PROD |

---

## ⚡ Quick Start

### 1️⃣ Escolher Ambiente

```bash
# Opção A: Comando direto (recomendado)
npm run deploy:setup -- mock        # Demo sem banco
npm run deploy:setup -- staging     # Homologação com banco dev
npm run deploy:setup -- production  # Produção com banco prod

# Opção B: Menu interativo
npm run deploy:setup
```

### 2️⃣ Fazer Deploy

```bash
git add .github/workflows/deploy.yml
git commit -m "chore: configure [ambiente] deploy"
git push origin main
```

### 3️⃣ Acessar

Aguarde 3-5 minutos e acesse:
```
https://seu-usuario.github.io/training-platform
```

---

## 🔐 Configuração de Secrets

### Mock (Demo)
**✅ Nenhuma configuração necessária!**

### Staging (Homologação)

No GitHub: **Settings → Secrets → Actions**

```
VITE_SUPABASE_STAGING_URL
  → https://seu-projeto-dev.supabase.co

VITE_SUPABASE_STAGING_KEY
  → eyJhbGc... (anon key do projeto de dev)
```

### Production (Produção)

No GitHub: **Settings → Secrets → Actions**

```
VITE_SUPABASE_URL
  → https://seu-projeto-prod.supabase.co

VITE_SUPABASE_ANON_KEY
  → eyJhbGc... (anon key do projeto de prod)
```

---

## 🏗️ Estrutura de Ambientes

### Recomendação: 2 Projetos Supabase

```
Supabase Dashboard
├── 📦 training-platform-dev (Staging)
│   ├── URL: https://xyz-dev.supabase.co
│   ├── Uso: Testes e desenvolvimento
│   └── Dados: Podem ser resetados
│
└── 📦 training-platform-prod (Production)
    ├── URL: https://xyz-prod.supabase.co
    ├── Uso: Usuários reais
    └── Dados: NUNCA resetar
```

**Por que 2 projetos?**
- ✅ Isolamento total entre ambientes
- ✅ Pode testar migrações sem risco
- ✅ Plano free do Supabase permite 2 projetos
- ✅ Dados de produção sempre seguros

---

## 🔄 Fluxo de Trabalho Recomendado

### 1. Desenvolvimento Local

```bash
# Criar .env.local
VITE_USE_MOCK=false
VITE_SUPABASE_URL=https://xyz-dev.supabase.co
VITE_SUPABASE_ANON_KEY=sua-key-dev

# Rodar
npm run dev
```

### 2. Deploy para Staging

```bash
# Testar em ambiente similar à produção
npm run deploy:setup -- staging
git add . && git commit -m "test: new feature" && git push
```

### 3. Validar em Staging

```
https://seu-usuario.github.io/training-platform
```

- Testar todas as funcionalidades
- Verificar performance
- Testar com dados reais (não sensíveis)

### 4. Deploy para Production

```bash
# Após validar no staging
npm run deploy:setup -- production
git add . && git commit -m "release: v1.0.0" && git push
```

---

## 📋 Workflows Disponíveis

Os workflows estão em `.github/workflows/`:

| Arquivo | Uso | Quando Ativar |
|---------|-----|---------------|
| `deploy-mock.yml.disabled` | Template para demo | Nunca (é template) |
| `deploy-staging.yml.disabled` | Template para homologação | Nunca (é template) |
| `deploy-production.yml.disabled` | Template para produção | Nunca (é template) |
| `deploy.yml` | **Workflow ativo** | Sempre (gerado pelo script) |
| `ci.yml` | CI para Pull Requests | Sempre |

**Como funciona:**
1. Os arquivos `.disabled` são **templates** (nunca mudam)
2. O script `deploy:setup` copia o template escolhido para `deploy.yml`
3. O GitHub executa apenas `deploy.yml`

---

## 🎛️ Variáveis de Ambiente

### Mock
```env
VITE_USE_MOCK=true
# Nenhuma outra variável necessária
```

### Staging (Desenvolvimento)
```env
VITE_USE_MOCK=false
VITE_SUPABASE_URL=https://xyz-dev.supabase.co
VITE_SUPABASE_ANON_KEY=sua-key-dev
```

### Production
```env
VITE_USE_MOCK=false
VITE_SUPABASE_URL=https://xyz-prod.supabase.co
VITE_SUPABASE_ANON_KEY=sua-key-prod
```

**Ver mais:** `ENV_VARS.md`

---

## 🆘 Troubleshooting

### ❌ Deploy falhou

**Verifique:**
1. Secrets estão configurados? (se staging/prod)
2. Você está na branch `main`?
3. GitHub Pages está habilitado?

**Ver logs:**
Aba **Actions** no GitHub → Clique no workflow falhado

### ❌ Página 404

**Solução:** Aguarde 5-10 minutos. GitHub Pages demora a propagar.

### ❌ Login não funciona

**Verifique:**
1. Ambiente correto está ativo?
2. Secrets do Supabase estão corretos?
3. No Supabase, autenticação está habilitada?

### ❌ Staging mostra dados mock

**Causa:** Workflow incorreto ativo.

**Solução:**
```bash
npm run deploy:setup -- status  # Ver qual está ativo
npm run deploy:setup -- staging # Corrigir
```

---

## 📊 Comparação de Ambientes

| Recurso | Mock | Staging | Production |
|---------|------|---------|------------|
| **Login** | Fake | ✅ Real | ✅ Real |
| **Persistência** | ❌ Temporário | ✅ Banco dev | ✅ Banco prod |
| **Multi-usuário** | ❌ | ✅ | ✅ |
| **Requer secrets** | ❌ | ✅ | ✅ |
| **Setup** | 2 min | 10 min | 10 min |
| **Ideal para** | Demo, Portfolio | Testes, QA | Usuários finais |
| **Pode resetar dados** | N/A | ✅ Sim | ❌ NUNCA |

---

## 🎯 Quando Usar Cada Ambiente

### Use **Mock** para:
- 🎨 Portfolio pessoal
- 👨‍🏫 Apresentações e demos
- 🧪 Testes de UI sem backend
- 📱 Protótipos rápidos

### Use **Staging** para:
- 🧪 Testar novas features antes da produção
- 🔄 Validar migrações de banco
- 👥 Testes com usuários beta
- 🐛 Reproduzir bugs em ambiente similar à prod

### Use **Production** para:
- 🚀 Aplicação final
- 👥 Usuários reais
- 💼 Uso profissional
- 📊 Dados importantes

---

## ✅ Checklist de Deploy

### Mock (Demo)
- [ ] Execute: `npm run deploy:setup -- mock`
- [ ] Commit e push
- [ ] Aguarde 3-5 min
- [ ] Teste a URL

### Staging (Homologação)
- [ ] Crie projeto Supabase para dev
- [ ] Execute SQL scripts em supabase-instructions/
- [ ] Configure secrets de staging no GitHub
- [ ] Execute: `npm run deploy:setup -- staging`
- [ ] Commit e push
- [ ] Teste todas as funcionalidades
- [ ] Valide com dados de teste

### Production (Produção)
- [ ] **Validado no staging primeiro!**
- [ ] Crie projeto Supabase para prod
- [ ] Execute SQL scripts em supabase-instructions/
- [ ] Configure secrets de production no GitHub
- [ ] Execute: `npm run deploy:setup -- production`
- [ ] Commit e push
- [ ] Monitore logs na aba Actions
- [ ] Teste login e funcionalidades críticas

---

## 🔗 Documentação Adicional

- **ENV_VARS.md** - Detalhes sobre variáveis de ambiente
- **README_DEPLOY.md** - Índice da documentação de deploy
- **supabase-instructions/create-database/** - Scripts para criar banco

---

## 🎓 Resumo de Comandos

```bash
# Ver status atual
npm run deploy:setup -- status

# Alternar para Mock (demo)
npm run deploy:setup -- mock

# Alternar para Staging (homologação)
npm run deploy:setup -- staging

# Alternar para Production (produção)
npm run deploy:setup -- production

# Depois de qualquer mudança:
git add .github/workflows/deploy.yml
git commit -m "chore: update deploy config"
git push origin main
```

---

## 💡 Dicas Pro

1. **Use branches para staging:**
   ```bash
   git checkout -b feature/nova-feature
   # Desenvolver...
   npm run deploy:setup -- staging
   git push  # Deploy automático para staging
   ```

2. **Proteja a produção:**
   - Configure branch protection na `main`
   - Exija PR review antes de merge
   - Sempre teste no staging primeiro

3. **Monitore custos:**
   - Supabase free tier: 2 projetos, 500MB storage
   - GitHub Pages: grátis para repos públicos

4. **Backup regular:**
   ```bash
   # Backup do banco de produção
   pg_dump "postgresql://..." > backup-$(date +%Y%m%d).sql
   ```

---

**✅ Pronto! Configuração simplificada e com 3 ambientes!**

_Última atualização: Janeiro 2026_
