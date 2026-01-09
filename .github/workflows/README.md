# 📂 GitHub Actions Workflows

## 📝 Arquivos Disponíveis

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| **`deploy-supabase.yml`** | 🟢 Template | Deploy com banco Supabase (produção) |
| **`deploy-mock.yml`** | 🟢 Template | Deploy com dados mock (demo) |
| **`deploy.yml`** | 🟡 DUPLICADO | Cópia de deploy-mock.yml (redundante) |
| **`deploy.yml.backup`** | 🔵 Backup | Backup antigo |
| **`ci.yml`** | ✅ ATIVO | CI para Pull Requests |

---

## ⚠️ Problema Atual: Workflows Duplicados

Atualmente existem **3 workflows de deploy** configurados para rodar no push da branch `main`:

1. `deploy-supabase.yml` - Deploy com Supabase
2. `deploy-mock.yml` - Deploy com dados mock
3. `deploy.yml` - **DUPLICADO** de deploy-mock.yml

Isso causa **conflitos**, pois todos rodam ao mesmo tempo e sobrescrevem um ao outro!

---

## ✅ Solução Recomendada

### Opção A: Usar apenas um workflow ativo (Recomendado)

Manter apenas um dos workflows ativos e **desabilitar os outros**:

```bash
# Para usar Supabase (produção)
mv .github/workflows/deploy-mock.yml .github/workflows/_deploy-mock.yml.disabled
mv .github/workflows/deploy.yml .github/workflows/_deploy.yml.disabled
# deploy-supabase.yml fica ativo

# OU usar o script:
npm run deploy:setup
```

### Opção B: Usar diferentes triggers

Fazer cada workflow rodar em situações diferentes:

```yaml
# deploy-supabase.yml - Rodar em tags de release
on:
  push:
    tags:
      - 'v*'

# deploy-mock.yml - Rodar em branch develop
on:
  push:
    branches:
      - develop
```

### Opção C: Usar workflow_dispatch manual

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - production
          - demo
```

---

## 🎯 Recomendação Atual

**Use o script helper para alternar entre os modos:**

```bash
npm run deploy:setup
```

Isso vai:
1. Mostrar o modo atual
2. Permitir trocar entre Mock e Supabase
3. Desabilitar workflows conflitantes automaticamente

---

## 🔧 Como Funciona Cada Workflow

### `deploy-supabase.yml` - Produção

```yaml
- name: Build
  run: npm run build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

✅ Conecta ao banco Supabase real
⚠️ Requer secrets configurados no GitHub

### `deploy-mock.yml` - Demo

```yaml
- name: Build
  run: npm run build:mock
  env:
    VITE_USE_MOCK: 'true'
```

✅ Usa dados hardcoded
✅ Não precisa de secrets

### `ci.yml` - Continuous Integration

```yaml
on:
  pull_request:
    branches:
      - main
```

✅ Roda testes em Pull Requests
✅ Não faz deploy

---

## 📋 Checklist de Limpeza

- [ ] Deletar `deploy.yml` (é duplicado)
- [ ] Manter `deploy-supabase.yml` como template
- [ ] Manter `deploy-mock.yml` como template
- [ ] Mover `deploy.yml.backup` para pasta `backup/`
- [ ] Usar script para ativar/desativar workflows

---

## 🚀 Próximos Passos

1. **Decidir**: Você quer deploy com Supabase ou Mock?
2. **Executar**: `npm run deploy:setup`
3. **Limpar**: Deletar arquivos duplicados
4. **Push**: Fazer push para ativar o workflow escolhido

---

## 📚 Documentação Completa

- [DEPLOY_SIMPLE.md](../../DEPLOY_SIMPLE.md) - Guia rápido
- [DEPLOY_GUIDE.md](../../DEPLOY_GUIDE.md) - Guia completo
