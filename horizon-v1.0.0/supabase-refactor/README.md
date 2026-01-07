# 🗄️ Supabase Database Setup - Versão 2.3 (Schema Completo)

Este diretório contém scripts modulares para recriar completamente o banco de dados Supabase com suporte tanto para **desenvolvimento** quanto **produção**.

## ✨ Novas Funcionalidades (v2.3)

- 🔄 **Auto-preenchimento de `created_by`** via triggers
- 🧪 **Políticas RLS flexíveis** para desenvolvimento local  
- 🚀 **Script de migração para produção** incluído
- 🛡️ **Segurança mantida** com RLS sempre habilitado
- 📱 **Compatível com frontend** sem modificações
- ⏱️ **Schema otimizado** - campo `duration_seconds` adicionado
- 🔧 **Bug fixes** - persistência de `weight_kg` corrigida
- 🎯 **Movement patterns** - treinos com padrões de movimento
- 🔒 **RLS policies** - exercícios com controle de acesso
- 🏷️ **Block types** - enum atualizado com valores em português

## 📁 Estrutura dos Scripts

```
supabase-refactor/
├── 00-reset-database.sql      # ⚠️  APAGA TUDO - Execute primeiro
├── 01-create-types.sql        # Tipos customizados (ENUMs) - ATUALIZADO
├── 02-create-tables.sql       # Estrutura das tabelas - ATUALIZADO
├── 03-create-functions.sql    # Funções + triggers auto-preenchimento
├── 04-create-policies.sql     # Políticas RLS FLEXÍVEIS
├── 05-insert-seed-data.sql    # Dados iniciais
├── 06-create-indexes.sql      # Índices para performance - ATUALIZADO
├── 07-rls-fixes.sql          # 🆕 Correções avançadas de RLS
├── 99-validate-setup.sql      # Validação final - ATUALIZADO
├── 10-production-migration.sql # ⚠️  Migração para produção - ATUALIZADO
├── SCHEMA_CHANGES_LOG.md      # 📋 Log de mudanças de schema - ATUALIZADO
└── run-all.sql               # Script master que executa tudo - ATUALIZADO
```

## 📊 Mudanças de Schema Recentes

### Exercise Prescriptions (2024-12-19)
- ✅ **Adicionado**: `duration_seconds INTEGER` - Para exercícios com duração específica
- ✅ **Mantido**: `weight_kg DECIMAL(5,2)` - Peso/carga do exercício  
- ✅ **Mantido**: `tempo TEXT` - Cadência do movimento (ex: "2-1-2-1")

### Training Movement Patterns (2024-12-19)  
- ✅ **Adicionado**: `movement_pattern_id UUID` na tabela `trainings`
- ✅ **Índice**: `idx_trainings_movement_pattern` para performance

### Exercise Security (2024-12-19)
- ✅ **RLS Policies**: Controle de acesso por usuário para exercícios
- ✅ **Campo**: `created_by UUID` para associação de propriedade

### Block Types (2024-12-19)
- ✅ **Enum atualizado**: Valores em português (`MOBILIDADE_ARTICULAR`, `ATIVACAO_CORE`, etc.)

### RLS Advanced Fixes (2024-12-19)
- ✅ **Anti-recursão**: Políticas simplificadas para `users` sem subconsultas
- ✅ **Políticas flexíveis**: `training_weeks` com suporte a desenvolvimento
- ✅ **Auto-preenchimento**: Trigger automático para `created_by`
- ✅ **Dados públicos**: `movement_patterns` acessível por todos

📋 **Documentação completa**: Ver `SCHEMA_CHANGES_LOG.md`

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