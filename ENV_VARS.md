# 🔐 Variáveis de Ambiente

## 📋 Variáveis Disponíveis

### `VITE_USE_MOCK`
- **Descrição:** Define se a aplicação usa dados mock ou Supabase real
- **Valores:** `'true'` ou `'false'` (string)
- **Padrão:** `true` (modo mock)
- **Uso:**
  ```env
  VITE_USE_MOCK=true   # Usa dados mock (sem banco)
  VITE_USE_MOCK=false  # Usa Supabase real
  ```

### Production (Produção)

#### `VITE_SUPABASE_URL`
- **Descrição:** URL do projeto Supabase de **produção**
- **Formato:** `https://seu-projeto-prod.supabase.co`
- **Onde encontrar:** Supabase Dashboard → Projeto PROD → Settings → API
- **Uso:**
  ```env
  VITE_SUPABASE_URL=https://xyz-prod.supabase.co
  ```

#### `VITE_SUPABASE_ANON_KEY`
- **Descrição:** Chave pública do Supabase de **produção**
- **Formato:** JWT token longo
- **Onde encontrar:** Supabase Dashboard → Projeto PROD → Settings → API → anon public
- **Uso:**
  ```env
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

### Staging (Homologação)

#### `VITE_SUPABASE_STAGING_URL`
- **Descrição:** URL do projeto Supabase de **desenvolvimento/staging**
- **Formato:** `https://seu-projeto-dev.supabase.co`
- **Onde encontrar:** Supabase Dashboard → Projeto DEV → Settings → API
- **Uso:**
  ```env
  VITE_SUPABASE_STAGING_URL=https://xyz-dev.supabase.co
  ```

#### `VITE_SUPABASE_STAGING_KEY`
- **Descrição:** Chave pública do Supabase de **desenvolvimento/staging**
- **Formato:** JWT token longo
- **Onde encontrar:** Supabase Dashboard → Projeto DEV → Settings → API → anon public
- **Uso:**
  ```env
  VITE_SUPABASE_STAGING_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

---

## 🏠 Desenvolvimento Local

### Modo Mock (Padrão)

Não precisa configurar nada! Por padrão a aplicação roda em modo mock.

```bash
npm run dev
```

### Modo Staging (Desenvolvimento Local)

1. Crie um arquivo `.env.local`:

```bash
# .env.local
VITE_USE_MOCK=false
VITE_SUPABASE_URL=https://seu-projeto-dev.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Execute:

```bash
npm run dev
```

### Modo Production (Desenvolvimento Local)

⚠️ **NÃO RECOMENDADO** - Use staging para desenvolvimento local!

Se realmente precisar:

```bash
# .env.local
VITE_USE_MOCK=false
VITE_SUPABASE_URL=https://seu-projeto-prod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:** O arquivo `.env.local` **NÃO** deve ser commitado no git!

---

## 🚀 Deploy (GitHub Pages)

### Modo Mock (Demo)

✅ Não precisa configurar secrets!

```bash
npm run deploy:setup -- mock
```

### Modo Staging (Homologação)

Configure os secrets de **STAGING** no GitHub:

1. Vá em **Settings → Secrets and Variables → Actions**
2. Clique em **New repository secret**
3. Adicione:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_STAGING_URL` | `https://seu-projeto-dev.supabase.co` |
| `VITE_SUPABASE_STAGING_KEY` | `eyJhbGc...` (chave do projeto dev) |

```bash
npm run deploy:setup -- staging
```

### Modo Production (Produção)

Configure os secrets de **PRODUCTION** no GitHub:

1. Vá em **Settings → Secrets and Variables → Actions**
2. Clique em **New repository secret**
3. Adicione:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | `https://seu-projeto-prod.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` (chave do projeto prod) |

```bash
npm run deploy:setup -- production
```

⚠️ **NÃO** adicione `VITE_USE_MOCK` nos secrets. Os workflows já injetam as variáveis corretas.

---

## 🔍 Como a Aplicação Decide Qual Modo Usar?

### Lógica no código (`src/config/env.ts`)

```typescript
export const config = {
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true' || 
            import.meta.env.VITE_USE_MOCK === undefined,
  // ...
};
```

### Comportamento

| Situação | `VITE_USE_MOCK` | Resultado |
|----------|-----------------|-----------|
| Variável não definida | `undefined` | ✅ Usa Mock |
| `VITE_USE_MOCK=true` | `'true'` | ✅ Usa Mock |
| `VITE_USE_MOCK=false` | `'false'` | ❌ Usa Supabase |
| Supabase URL vazio | N/A | ⚠️ Erro |

---

## 🧪 Como Testar se as Variáveis Funcionam?

### No Browser Console

```javascript
// Ver configuração atual
console.log(import.meta.env);

// Verificar modo
console.log('Modo Mock:', import.meta.env.VITE_USE_MOCK);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

### Na Aplicação

A aplicação mostra automaticamente no console (modo dev):

```
🔧 [Config] Configuração atual: {
  useMock: true,
  supabaseUrl: "https://placeholder.supabase.co",
  hasSupabaseKey: false
}
```

---

## 🆘 Troubleshooting

### ❌ "Cannot connect to Supabase"

**Causa:** Variáveis não configuradas ou incorretas.

**Solução:**
1. Verifique se `.env.local` existe (desenvolvimento local)
2. Verifique se os secrets estão no GitHub (deploy)
3. Teste as credenciais diretamente no Supabase Dashboard

### ❌ Aplicação sempre usa mock mesmo com secrets configurados

**Causa:** Workflow incorreto ou variável `VITE_USE_MOCK=true` explicitamente definida.

**Solução:**
1. Verifique se está usando `deploy-supabase.yml` (não `deploy-mock.yml`)
2. Remova `VITE_USE_MOCK` dos secrets (ele não deve estar lá)

### ❌ Build falha com erro de variáveis

```
error during build:
RollupError: VITE_SUPABASE_URL is not defined
```

**Causa:** Build rodando sem as variáveis necessárias.

**Solução (local):**
```bash
# Certifique-se que .env.local existe e tem os valores
cat .env.local

# Build com variáveis
npm run build
```

**Solução (GitHub):**
- Configure os secrets corretamente
- Use o workflow `deploy-supabase.yml`

---

## 📖 Exemplo Completo

### Arquivo `.env.local` (Desenvolvimento)

```env
# Modo de operação
VITE_USE_MOCK=false

# Credenciais Supabase (pegue no dashboard)
VITE_SUPABASE_URL=https://xyzabc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE5NTU1NzYwMDB9.fake-signature-here
```

### GitHub Secrets (Deploy)

```
Nome: VITE_SUPABASE_URL
Valor: https://xyzabc123.supabase.co

Nome: VITE_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE5NTU1NzYwMDB9.fake-signature-here
```

---

## 🔒 Segurança

### ✅ Pode commitar:
- `.env.example` (valores de exemplo)
- Documentação sobre variáveis

### ❌ NUNCA commitar:
- `.env.local` (valores reais)
- Chaves privadas do Supabase
- Service role keys

### ℹ️ Nota sobre anon key:

A `anon key` é **pública** e pode ser exposta no frontend. Ela tem permissões limitadas configuradas via RLS (Row Level Security) no Supabase.

---

## 📞 Links Úteis

- [Vite Env Docs](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase API Settings](https://app.supabase.com)
- [GitHub Secrets Docs](https://docs.github.com/pt/actions/security-guides/encrypted-secrets)
