# �️ Supabase Database Setup - Versão 2.1 (Desenvolvimento Amigável)

Este diretório contém scripts modulares para recriar completamente o banco de dados Supabase com suporte tanto para **desenvolvimento** quanto **produção**.

## ✨ Novas Funcionalidades (v2.1)

- 🔄 **Auto-preenchimento de `created_by`** via triggers
- 🧪 **Políticas RLS flexíveis** para desenvolvimento local
- 🚀 **Script de migração para produção** incluído
- 🛡️ **Segurança mantida** com RLS sempre habilitado
- 📱 **Compatível com frontend** sem modificações

## 📁 Estrutura dos Scripts

```
supabase-refactor/
├── 00-reset-database.sql      # ⚠️  APAGA TUDO - Execute primeiro
├── 01-create-types.sql        # Tipos customizados (ENUMs)
├── 02-create-tables.sql       # Estrutura das tabelas (created_by nullable)
├── 03-create-functions.sql    # Funções + triggers auto-preenchimento
├── 04-create-policies.sql     # Políticas RLS FLEXÍVEIS
├── 05-insert-seed-data.sql    # Dados iniciais
├── 06-create-indexes.sql      # Índices para performance
├── 99-validate-setup.sql      # Validação final
├── 10-production-migration.sql # ⚠️  Migração para produção
└── run-all.sql               # Script master que executa tudo
```

## ⚡ Execução Rápida

**Execute APENAS este arquivo no Supabase SQL Editor:**
```sql
\i run-all.sql
```

## 🔒 Sistema de Roles

| **Role** | **Descrição** | **Permissões** |
|----------|---------------|----------------|
| `owner` | Proprietário do sistema | ✅ CRUD completo em todos os dados |
| `admin` | Administrador | ✅ CRUD completo em todos os dados |
| `viewer` | Usuário padrão | ✅ Leitura própria + Edição própria |
| `guest` | Visitante | ❌ Sem acesso aos dados |

## 📋 Ordem de Execução Manual

Se preferir executar manualmente (para debug):

1. `00-reset-database.sql` - ⚠️ **CUIDADO:** Apaga tudo
2. `01-create-types.sql` - Cria tipos customizados
3. `02-create-tables.sql` - Cria estrutura das tabelas
4. `03-create-functions.sql` - Funções auxiliares
5. `04-create-policies.sql` - Políticas RLS
6. `05-insert-seed-data.sql` - Dados iniciais
7. `06-create-indexes.sql` - Índices
8. `99-validate-setup.sql` - Validação

## ⚠️ Avisos Importantes

- **BACKUP**: Faça backup antes de executar
- **PRODUÇÃO**: NÃO execute em ambiente de produção sem testes
- **DADOS**: Todos os dados existentes serão perdidos

## 🛠️ Pós-Execução

Após executar os scripts:
1. Verifique se não há erros no output
2. Execute `99-validate-setup.sql` para confirmar
3. Teste login e permissões no frontend
4. Configure seu primeiro usuário como `owner`