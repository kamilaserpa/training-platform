# 🚀 Configuração de Deploy - Mock vs Supabase

Este documento explica como alternar entre dados de mock e Supabase real no deploy do GitHub Pages.

## ⚡ **RESUMO RÁPIDO (TL;DR)**

**✅ Configuração ATUAL = Perfeita para demo/portfolio!**

- **Deploy ativo:** Mock data (zero secrets necessários)
- **Para fazer deploy:** `git push origin main` 
- **Para alternar modos:** `npm run switch-deploy`
- **Funciona agora:** Sem configurar nada no GitHub!

---

## 📋 Estados Disponíveis

### 🔧 **Modo MOCK** (Demonstração) - ATUAL ✅
- ✅ Dados simulados
- ✅ Login com qualquer email/senha
- ✅ Deploy sem dependências externas
- ✅ **ZERO secrets no GitHub necessários**
- ✅ Ideal para demos e portfolio

### 🔗 **Modo SUPABASE** (Produção Real) - Opcional
- ✅ Dados reais do banco
- ✅ Autenticação segura
- ✅ Funcionalidades completas
- ⚠️ **Requer configuração de secrets no GitHub**
- ✅ Usuários reais

---

## ⚙️ Como Alternar os Modos

### 🎯 **Método Principal: Script Automático (Mais Fácil)**

```bash
# Um comando para alternar:
npm run switch-deploy

# Opções:
# 1) Mock Data (atual - zero configuração)
# 2) Supabase Real (requer secrets no GitHub)
```

### 🎯 **Método Manual: Copiar Templates**

```bash
# Para MOCK (sem secrets):
cp .github/workflows/deploy-mock.yml .github/workflows/deploy.yml

# Para SUPABASE (precisa configurar secrets primeiro):
cp .github/workflows/deploy-supabase.yml .github/workflows/deploy.yml
```

### 📁 **Templates Disponíveis:**

```
.github/workflows/
├── deploy.yml           ← ATIVO (usado pelo GitHub)
├── deploy-mock.yml      ← Template para dados mock
├── deploy-supabase.yml  ← Template para Supabase real
└── deploy.yml.backup    ← Backup da versão anterior
```

---

## 🚀 **Como Fazer Deploy**

### **📊 Status Atual:**
| Item | Valor | Configuração Necessária |
|------|-------|------------------------|
| **Modo Ativo** | 🔧 Mock Data | ❌ Nenhuma |
| **Secrets GitHub** | ❌ Não configurados | ❌ Não necessários |
| **Deploy Funciona** | ✅ Sim | ❌ Zero config |

### **🎯 Para fazer deploy AGORA:**
```bash
# É só isso:
git add .
git commit -m "Deploy with mock data - perfect for demo"
git push origin main

# GitHub Actions faz o resto automaticamente!
```

### **🔄 Para alternar para Supabase (futuro):**
```bash
# 1. Alternar workflow:
npm run switch-deploy  # Escolher opção 2

# 2. Configurar secrets no GitHub (obrigatório):
#    Settings > Secrets and Variables > Actions
#    Adicionar: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Deploy:
git add .github/workflows/deploy.yml
git commit -m "Switch to Supabase production"
git push origin main
```

---

##  Quando Configurar GitHub Secrets

### ⚠️ **IMPORTANTE: Secrets SÓ são necessários para Supabase real!**

**🔧 Para dados MOCK (configuração atual):**
- ✅ **Zero secrets necessários**
- ✅ **Deploy funciona imediatamente** 
- ✅ **Ideal para demo/portfolio**

**🔗 Para Supabase REAL (só se precisar futuramente):**
- ⚠️ **Aí sim precisa configurar secrets**
- ⚠️ **Usar o template `deploy-supabase.yml`**

### **� Localização dos Secrets no GitHub (Só para Supabase):**
1. **Acesse:** `https://github.com/kamilaserpa/training-platform`
2. **Clique:** `Settings` (aba do repositório)
3. **Menu lateral:** `Secrets and Variables` → `Actions`
4. **URL direta:** `https://github.com/kamilaserpa/training-platform/settings/secrets/actions`

### **🔑 Secrets necessários (Só para Supabase):**
```
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 **Funcionalidades Demo Disponíveis (Mock):**

- ✅ **Autenticação** (aceita qualquer credencial)
- ✅ **Dashboard** com dados simulados realistas
- ✅ **CRUD Treinos** (simulado mas funcional)
- ✅ **Gerenciamento Usuários** (dados mock)
- ✅ **Histórico de Treinos** completo
- ✅ **Interface Material-UI** responsiva
- ✅ **Todas as páginas** funcionando

### **🚀 Como testar o demo:**
- **URL:** Será `https://kamilaserpa.github.io/training-platform/`
- **Login:** `qualquer@email.com` / `qualquer-senha`
- **Dados:** Todos simulados mas realistas

---

## 🎛️ Scripts Disponíveis

```json
{
  "dev": "vite",                    // Desenvolvimento (Supabase se configurado)
  "dev:mock": "VITE_USE_MOCK=true vite",  // Desenvolvimento com mock
  "build": "vite build",           // Build produção (Supabase)
  "build:mock": "VITE_USE_MOCK=true vite build",  // Build com mock
  "switch-deploy": "bash scripts/switch-deploy.sh"  // Alternar modos
}
```

---

## 🔍 Como Verificar o Modo Atual

### **Durante desenvolvimento:**
```bash
npm run dev:mock  # Console: "🔧 [Config] Modo: MOCK"
npm run dev       # Console: "🔧 [Config] Modo: Supabase Real"
```

### **No site publicado:**
- **Modo Mock:** Banner laranja "🔧 MODO MOCK ATIVO"
- **Modo Supabase:** Sem banner, login normal

### **Verificar workflow ativo:**
```bash
npm run switch-deploy  # Opção 3 - Ver status
```

---

## ⚠️ Checklist Antes de Alternar para Produção

### ✅ **Antes de usar Supabase real:**
- [ ] Projeto Supabase criado e configurado
- [ ] Secrets configurados no GitHub:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Tabelas e RLS policies configuradas
- [ ] Edge Functions deployadas (se necessário)
- [ ] Usuários de teste criados
- [ ] Workflow alterado: `npm run switch-deploy` → opção 2

### ✅ **Para usar Mock (atual - recomendado):**
- [x] **Já configurado!** ✅
- [x] Workflow usando `deploy-mock.yml` ✅
- [x] Zero secrets necessários ✅
- [x] Banner de aviso funcionando ✅

---

## 💡 **Recomendação Final**

**✅ Configuração atual = PERFEITA para seu caso!**

### **🎯 Para Portfolio/Demo (atual):**
- Continuar com mock data
- Zero configuração adicional
- Deploy funciona imediatamente
- Demo sempre disponível

### **🚀 Para Produção Real (futuro):**
```bash
# Quando precisar:
npm run switch-deploy    # Escolher opção 2
# Configurar secrets no GitHub
git add . && git commit -m "Enable Supabase" && git push
```

### **🔄 Voltar para Demo:**
```bash
npm run switch-deploy    # Escolher opção 1
git add . && git commit -m "Back to demo mode" && git push
```

**Flexibilidade total sem complicação!** 🎉