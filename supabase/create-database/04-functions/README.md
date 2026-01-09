# 🚀 Edge Functions - Training Platform

## 📋 Funções Disponíveis

### 1. create-viewer-user

**Descrição:** Cria usuários com role "viewer" no workspace do owner/admin.

**Endpoint:** `https://[PROJECT_REF].supabase.co/functions/v1/create-viewer-user`

**Método:** `POST`

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer [USER_JWT_TOKEN]",
  "apikey": "[SUPABASE_ANON_KEY]"
}
```

**Body:**
```json
{
  "email": "viewer@exemplo.com",
  "password": "senha123",
  "name": "Nome do Viewer" // opcional
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "user_id": "uuid-do-usuario",
  "message": "Usuário viewer criado com sucesso"
}
```

**Response (Erro):**
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

---

## 🚀 Como Fazer Deploy

### Pré-requisitos

1. **Instalar Supabase CLI:**
```bash
npm install -g supabase
```

2. **Login:**
```bash
supabase login
```

3. **Link com seu projeto:**
```bash
supabase link --project-ref SEU_PROJECT_REF
```

### Deploy da Função

```bash
# Navegar para a pasta da função
cd supabase-instructions/create-database/04-functions

# Deploy
supabase functions deploy create-viewer-user

# Ou deploy de todas as funções
supabase functions deploy
```

### Verificar Deploy

```bash
# Listar funções
supabase functions list

# Ver logs
supabase functions logs create-viewer-user
```

---

## 🧪 Testar a Função

### Via cURL

```bash
curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/create-viewer-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [USER_JWT_TOKEN]" \
  -H "apikey: [SUPABASE_ANON_KEY]" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123",
    "name": "Teste Viewer"
  }'
```

### Via Frontend (JavaScript)

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const { data: { session } } = await supabase.auth.getSession();

const response = await fetch(`${supabaseUrl}/functions/v1/create-viewer-user`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  body: JSON.stringify({
    email: 'viewer@exemplo.com',
    password: 'senha123',
    name: 'Viewer Teste'
  }),
});

const result = await response.json();
console.log(result);
```

---

## 🔐 Segurança

### Permissões Necessárias

A função verifica:
- ✅ Usuário está autenticado (JWT válido)
- ✅ Usuário existe na tabela `users`
- ✅ Usuário está ativo (`active = true`)
- ✅ Usuário é Owner ou Admin
- ✅ Email não está duplicado

### Isolamento de Workspace

- Owner cria viewer → `owner_id` = ID do Owner
- Admin cria viewer → `owner_id` = ID do Owner do Admin
- **Resultado:** Viewer pertence ao mesmo workspace

### CORS

A função está configurada com CORS aberto (`Access-Control-Allow-Origin: *`).

Para produção, considere restringir:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://seu-dominio.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

---

## 🆘 Problemas Comuns

### Erro: "SUPABASE_SERVICE_ROLE_KEY not found"

**Solução:** Configurar secrets da função:

```bash
# Via CLI
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key

# Ou via Dashboard
# Settings > Edge Functions > Secrets
```

### Erro: "Failed to load resource: 400"

**Causa:** Alguma validação falhou (email duplicado, senha curta, etc.)

**Solução:** Verificar a mensagem de erro no response:
```javascript
const result = await response.json();
console.log(result.error); // Mensagem de erro
```

### Erro: "Not authenticated"

**Causa:** Token JWT inválido ou expirado

**Solução:** Renovar o token:
```javascript
const { data: { session } } = await supabase.auth.refreshSession();
// Usar novo session.access_token
```

### Erro de CORS

**Causa:** Requisição de origem não permitida

**Solução:** Verificar CORS headers na função e no browser.

---

## 📝 Logs

### Ver logs em tempo real

```bash
supabase functions logs create-viewer-user --follow
```

### Ver logs específicos

```bash
# Últimas 100 linhas
supabase functions logs create-viewer-user --limit 100

# Com filtro
supabase functions logs create-viewer-user --grep "Erro"
```

---

## 🔄 Atualizar a Função

Após fazer mudanças no código:

```bash
# Re-deploy
supabase functions deploy create-viewer-user

# Verificar versão
supabase functions list
```

---

## 📚 Referências

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy/docs)
- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-createuser)

---

**Última atualização:** Janeiro 2026  
**Versão:** 1.0.0
