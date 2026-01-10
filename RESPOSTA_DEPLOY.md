# 📝 Resposta às Suas Perguntas sobre Deploy

> Respostas diretas e objetivas para suas dúvidas específicas

---

## ❓ Suas Perguntas

### 1. "Como posso fazer o deploy da versão para produção via GitHub Pages acionando o banco de dados de produção no Supabase?"

**Resposta Direta:**

```bash
# PASSO 1: Configure os secrets no GitHub
# Vá em: Settings → Secrets and Variables → Actions
# Adicione:
#   - VITE_SUPABASE_URL = https://seu-projeto.supabase.co
#   - VITE_SUPABASE_ANON_KEY = sua-chave-anon

# PASSO 2: Ative o workflow correto
npm run deploy:setup
# Escolha: 2 (Supabase Real)

# PASSO 3: Faça o push
git add .
git commit -m "chore: configure production deploy with Supabase"
git push origin main

# PASSO 4: Aguarde 3-5 minutos
# Acesse: https://seu-usuario.github.io/training-platform
```

**Onde encontrar as credenciais do Supabase:**
1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings → API**
4. Copie:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon/public key** (VITE_SUPABASE_ANON_KEY)

---

### 2. "Existem vários arquivos em workflow e parece confuso"

**Resposta Direta:**

Sim, você está certo! Há **3 workflows de deploy** configurados, o que causa confusão e conflitos:

```
.github/workflows/
├── deploy-supabase.yml  ← Para Supabase (produção)
├── deploy-mock.yml      ← Para dados mock (demo)
└── deploy.yml           ← DUPLICADO (é cópia de deploy-mock.yml)
```

**Problema:** Todos rodam ao mesmo tempo no push da `main`, sobrescrevendo um ao outro.

**Solução:** Use apenas **UM** workflow por vez.

**Como resolver:**

```bash
# Opção 1: Use o script helper (RECOMENDADO)
npm run deploy:setup
# Ele vai perguntar qual modo você quer e desabilitar os outros

# Opção 2: Desabilite manualmente os workflows não usados
# Renomeie os arquivos que você NÃO quer usar:
mv .github/workflows/deploy.yml .github/workflows/_deploy.yml.disabled
mv .github/workflows/deploy-mock.yml .github/workflows/_deploy-mock.yml.disabled
# Deixe apenas deploy-supabase.yml ativo
```

**Recomendação:** Delete o arquivo `deploy.yml` pois é duplicado:

```bash
rm .github/workflows/deploy.yml
```

---

### 3. "Em .env possui uma propriedade para alterar entre dados mock e dados de produção"

**Resposta Direta:**

Sim! A variável é `VITE_USE_MOCK`:

```env
# .env.local (desenvolvimento local)
VITE_USE_MOCK=false  # false = usa Supabase real
VITE_USE_MOCK=true   # true = usa dados mock
```

**Comportamento:**

| Situação | `VITE_USE_MOCK` | Resultado |
|----------|-----------------|-----------|
| Variável não definida | `undefined` | Usa Mock (padrão) |
| `VITE_USE_MOCK=true` | `'true'` | Usa Mock |
| `VITE_USE_MOCK=false` | `'false'` | Usa Supabase |

**IMPORTANTE:** 
- **Desenvolvimento local:** Use arquivo `.env.local`
- **GitHub Pages:** Use GitHub Secrets (não use `.env` no deploy!)

**Exemplo de `.env.local` para desenvolvimento:**

```env
# Para usar Supabase localmente
VITE_USE_MOCK=false
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Para deploy no GitHub Pages:**
- **NÃO** use arquivo `.env`
- Configure os secrets no GitHub (Settings → Secrets)
- O workflow `deploy-supabase.yml` já injeta as variáveis automaticamente

---

## 🎯 Resumo das Respostas

### Para fazer deploy em PRODUÇÃO com Supabase:

1. ✅ Configure os secrets no GitHub (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
2. ✅ Execute `npm run deploy:setup` e escolha opção 2
3. ✅ Faça push para `main`
4. ✅ Aguarde 3-5 minutos

### Para resolver a confusão dos workflows:

1. ✅ Use `npm run deploy:setup` para escolher apenas um modo
2. ✅ Delete o arquivo `deploy.yml` (é duplicado)
3. ✅ Mantenha apenas um workflow ativo por vez

### Para entender as variáveis de ambiente:

1. ✅ `VITE_USE_MOCK=false` → usa Supabase
2. ✅ `VITE_USE_MOCK=true` → usa dados mock
3. ✅ Desenvolvimento local: use `.env.local`
4. ✅ Deploy GitHub: use GitHub Secrets

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- **[README_DEPLOY.md](./README_DEPLOY.md)** - Índice principal
- **[DEPLOY_SIMPLE.md](./DEPLOY_SIMPLE.md)** - Guia passo a passo
- **[ENV_VARS.md](./ENV_VARS.md)** - Detalhes sobre variáveis
- **[.github/workflows/README.md](./.github/workflows/README.md)** - Explicação dos workflows

---

## 🚀 Ação Imediata Recomendada

Se você quer fazer deploy **AGORA** para produção com Supabase:

```bash
# 1. Configure os secrets no GitHub primeiro!
# 2. Execute:
npm run deploy:setup
# Escolha: 2 (Supabase Real)

# 3. Faça o push:
git add .
git commit -m "chore: configure production deploy"
git push origin main

# 4. Acompanhe na aba Actions do GitHub
```

✅ **Pronto! Sua aplicação estará no ar em 3-5 minutos conectada ao Supabase!**

---

_Espero ter esclarecido suas dúvidas! Para mais detalhes, consulte a documentação completa._
