# 🚀 Guia de Deploy Multi-Ambiente

Este projeto suporta deploy em **GitHub Pages**, **Cloudflare Pages**, **Netlify**, **Vercel** e **localhost**.

---

## 🎯 Configuração Automática de Base Path

### Como Funciona

A aplicação detecta automaticamente o ambiente através da variável `VITE_BASE_PATH`:

```javascript
// vite.config.js
const basePath = process.env.VITE_BASE_PATH || '/';
```

| Ambiente | Base Path | Configuração |
|----------|-----------|--------------|
| **Localhost** | `/` | Padrão (não precisa configurar) |
| **GitHub Pages** | `/training-platform/` | Via workflow |
| **Cloudflare** | `/` | Padrão ou via env var |
| **Netlify** | `/` | Padrão ou via env var |
| **Vercel** | `/` | Padrão ou via env var |

---

## 📦 1. GitHub Pages (Automático)

**Status:** ✅ Já configurado

O workflow em `.github/workflows/deploy.yml` já injeta a variável:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_BASE_PATH: /training-platform/
```

**URL final:** `https://username.github.io/training-platform/`

### Trocar para Outro Repositório

Se mudar o nome do repo de `training-platform` para `my-app`:

1. Edite `.github/workflows/deploy.yml`:
   ```yaml
   VITE_BASE_PATH: /my-app/
   ```

2. Edite `package.json`:
   ```json
   "homepage": "https://username.github.io/my-app"
   ```

---

## ☁️ 2. Cloudflare Pages

### Opção A: Configurar via Dashboard (Recomendado)

1. Acesse o painel do Cloudflare Pages
2. Selecione seu projeto
3. Vá em **Settings > Environment Variables**
4. Adicione:
   ```
   Nome: VITE_BASE_PATH
   Valor: /
   Environment: Production
   ```
5. Faça redeploy

### Opção B: Sem Configuração (usa '/' por padrão)

Se não configurar nada, a aplicação já usa `/` como padrão.

### Build Settings no Cloudflare

```
Build command: npm run build
Build output directory: dist
Root directory: (vazio)
Environment variables:
  - VITE_SUPABASE_URL: (seu valor)
  - VITE_SUPABASE_ANON_KEY: (seu valor)
  - VITE_BASE_PATH: / (opcional, já é o padrão)
```

**URL final:** `https://your-project.pages.dev/`

---

## 🌐 3. Netlify

### Build Settings

```
Build command: npm run build
Publish directory: dist
```

### Environment Variables

No painel do Netlify, adicione:

```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = sua-key
VITE_BASE_PATH = /
```

**URL final:** `https://your-site.netlify.app/`

---

## ▲ 4. Vercel

### Build Settings

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Environment Variables

No painel do Vercel, adicione:

```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = sua-key
VITE_BASE_PATH = /
```

**URL final:** `https://your-project.vercel.app/`

---

## 💻 5. Desenvolvimento Local

### Configuração

No arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-key
VITE_USE_MOCK=false
VITE_BASE_PATH=/
```

### Comandos

```bash
# Dev server (porta 3000)
npm run dev

# Preview do build (porta 5000)
npm run build
npm run preview
```

**URLs:**
- Dev: `http://localhost:3000/`
- Preview: `http://localhost:5000/`

---

## 🐛 Troubleshooting

### Problema: Assets retornam 404

**Sintomas:**
```
Failed to load resource: /training-platform/assets/index-xxx.js 404
```

**Causa:** Base path incorreto

**Solução:**
1. Verifique a variável `VITE_BASE_PATH` no ambiente
2. GitHub Pages precisa: `/training-platform/`
3. Outros ambientes (Cloudflare, Netlify, etc): `/`

### Problema: Manifest.webmanifest não encontrado

**Sintomas:**
```
Manifest fetch failed, code 404
```

**Causa:** Manifest usa path absoluto

**Solução:** Já corrigido! O manifest usa `start_url: "./"` (relativo)

### Problema: PWA não instala no iOS

**Sintomas:** Loading infinito ao abrir PWA

**Solução:** Já corrigido! Service Worker tem timeout e fallback

### Problema: Hash Router não funciona

**Sintomas:** Rotas dão 404

**Solução:**
- Hash Router (`#/exercicios`) funciona em todos os ambientes
- Não precisa configurar rewrites/redirects
- GitHub Pages, Cloudflare, Netlify, Vercel: todos funcionam

---

## 🔄 Migração entre Ambientes

### De GitHub Pages para Cloudflare:

1. **No Cloudflare:**
   - Conecte o repositório
   - Configure build: `npm run build`
   - Output: `dist`
   - Adicione env vars (VITE_SUPABASE_*)
   - **IMPORTANTE:** Adicione `VITE_BASE_PATH=/`

2. **No código:** Não precisa mudar nada!

### De Cloudflare para GitHub Pages:

1. **No GitHub:**
   - Habilite GitHub Pages (branch `gh-pages`)
   - O workflow já tem `VITE_BASE_PATH: /training-platform/`

2. **No código:** Não precisa mudar nada!

---

## 🧪 Como Testar Localmente com Base Path

Se quiser testar localmente com o mesmo base path do GitHub Pages:

```bash
# .env.local
VITE_BASE_PATH=/training-platform/

# Rodar
npm run dev

# Acessar
http://localhost:3000/training-platform/
```

---

## 📊 Resumo de Configuração

| Arquivo | GitHub Pages | Cloudflare | Local |
|---------|--------------|------------|-------|
| `.env` | - | `VITE_BASE_PATH=/` | `VITE_BASE_PATH=/` |
| `deploy.yml` | `VITE_BASE_PATH: /training-platform/` | - | - |
| Cloudflare Dashboard | - | Env var opcional | - |

✅ **Resultado:** Funciona em todos os ambientes sem duplicar código!

---

## 🚀 Quick Start por Ambiente

### GitHub Pages
```bash
git push origin main
# Deploy automático via GitHub Actions
```

### Cloudflare Pages
```bash
# Push para repositório conectado
git push

# OU via CLI
npx wrangler pages publish dist --project-name=training-platform
```

### Netlify
```bash
# Via Netlify CLI
netlify deploy --prod

# OU conecte o repo no dashboard
```

### Vercel
```bash
# Via Vercel CLI
vercel --prod

# OU conecte o repo no dashboard
```

---

**Dúvidas?** Veja os logs de build de cada plataforma para diagnosticar problemas.
