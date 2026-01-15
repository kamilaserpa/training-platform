# Padrão de Lint e Formatação

Este projeto utiliza uma configuração padronizada de lint e formatação para garantir consistência entre diferentes editores (VS Code, IntelliJ, etc.) e entre membros da equipe.

## Ferramentas Configuradas

### 1. EditorConfig
Define configurações básicas de editor que funcionam em qualquer IDE:
- Encoding: UTF-8
- Fim de linha: LF (Unix)
- Indentação: 2 espaços
- Remove espaços em branco no final das linhas
- Adiciona linha em branco no final dos arquivos

**Arquivo:** `.editorconfig`

### 2. Prettier
Formatador de código automático:
- **Aspas:** simples (`'`) para JS/TS, duplas (`"`) para JSX
- **Ponto e vírgula:** obrigatório
- **Trailing comma:** sempre
- **Arrow parens:** sempre
- **Largura de linha:** 100 caracteres
- **Indentação:** 2 espaços

**Arquivo:** `.prettierrc`

### 3. ESLint
Analisador de código para identificar problemas:
- Regras do TypeScript ESLint
- Regras do React Hooks
- Regras do React Refresh
- Integração com Prettier (desativa regras conflitantes)

**Arquivo:** `eslint.config.js`

## Scripts Disponíveis

```bash
# Verificar erros de lint
npm run lint

# Corrigir automaticamente erros de lint
npm run lint:fix

# Verificar formatação
npm run format:check

# Formatar todos os arquivos
npm run format
```

## Configuração do VS Code

O projeto já inclui configurações para o VS Code em [.vscode/settings.json](.vscode/settings.json):

- **Formatação automática ao salvar:** ✅
- **Correção ESLint ao salvar:** ✅
- **Organização de imports ao salvar:** ✅
- **Formatador padrão:** Prettier

### Extensões Recomendadas

O VS Code sugerirá automaticamente a instalação das extensões necessárias:
- **Prettier** - Formatador de código
- **ESLint** - Linter JavaScript/TypeScript
- **EditorConfig** - Suporte para .editorconfig

## Configuração do IntelliJ/WebStorm

### Habilitar EditorConfig
1. EditorConfig já é suportado nativamente
2. As configurações em `.editorconfig` serão aplicadas automaticamente

### Configurar Prettier
1. Vá em: `Settings > Languages & Frameworks > JavaScript > Prettier`
2. Selecione o package Prettier: `node_modules/prettier`
3. Marque: `On 'Reformat Code' action` e `On save`
4. Selecione: `Run for files: {**/*,*}.{js,ts,jsx,tsx,json,css,scss,md}`

### Configurar ESLint
1. Vá em: `Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint`
2. Marque: `Automatic ESLint configuration`
3. Marque: `Run eslint --fix on save`

## Regras de Lint Importantes

### Variáveis Não Utilizadas
- Prefixe com `_` para ignorar: `const _unusedVar = 123`
- Aplica-se a: variáveis, argumentos, destructuring

### Console
- `console.log()`: permitido (útil para desenvolvimento)
- `console.warn()`: permitido
- `console.error()`: permitido

### TypeScript
- `any`: warning (evitar quando possível)
- Variáveis não tipadas: erro
- Imports não utilizados: warning

### React Hooks
- Dependências do `useEffect`: warning se faltando
- Hooks em componentes: obrigatório seguir regras do React

## Boas Práticas

1. **Antes de commitar:**
   ```bash
   npm run format
   npm run lint:fix
   ```

2. **Ao abrir o projeto:**
   - Certifique-se de que as extensões estão instaladas
   - Verifique se a formatação automática está funcionando

3. **Em caso de conflitos:**
   - A configuração do Prettier tem precedência sobre formatação do editor
   - EditorConfig define o básico (espaços, fim de linha)
   - ESLint valida regras de código

## Troubleshooting

### Formatação diferente entre editores
- Execute `npm run format` para garantir consistência
- Verifique se o Prettier está usando o arquivo `.prettierrc`

### ESLint não está funcionando
- Execute `npm install` para garantir que as dependências estão instaladas
- Reinicie o editor após alterar configurações

### Conflitos entre Prettier e ESLint
- A configuração já inclui `eslint-config-prettier` que desativa regras conflitantes
- Se encontrar conflitos, reporte como issue

## Estrutura de Arquivos de Configuração

```
.
├── .editorconfig              # Configuração básica do editor
├── .prettierrc               # Configuração do Prettier
├── .prettierignore           # Arquivos ignorados pelo Prettier
├── eslint.config.js          # Configuração do ESLint
└── .vscode/
    ├── settings.json         # Configurações do VS Code
    └── extensions.json       # Extensões recomendadas
```

## Padrão de Código Estabelecido

Baseado na análise do código existente, mantivemos:
- ✅ Indentação de 2 espaços
- ✅ Aspas simples em JavaScript/TypeScript
- ✅ Ponto e vírgula obrigatório
- ✅ Trailing commas
- ✅ Arrow functions sempre com parênteses

Este padrão garante que o código formatado seja consistente com o código existente no projeto.
