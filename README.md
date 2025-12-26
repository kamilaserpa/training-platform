# 💪 Treinos Online - Sistema Profissional

Sistema completo de gestão profissional de treinos físicos com compartilhamento seguro de treinos individuais para alunos. Aplicação web responsiva, acessível via computador e Android (PWA), protegendo o método do profissional de educação física.

## 🚀 Tecnologias

- **Frontend**: React + Vite
- **Roteamento**: react-router-dom
- **Backend/Banco**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Hospedagem**: GitHub Pages
- **PWA**: Manifest + Service Worker

## 📋 Funcionalidades

### 👤 Owner (Profissional Autenticado)
- Login por email e senha
- Criar, editar e excluir exercícios
- Criar, editar e excluir tipos de treino
- Criar, editar e excluir semanas de periodização
- Criar treinos com múltiplos blocos:
  - Padrão de Movimento
  - Mobilidade Articular
  - Ativação de Core
  - Ativação Neural
  - Treino
  - Condicionamento Físico
- Definir prescrições por bloco
- Associar padrões de movimento
- Adicionar exercícios aos blocos (Core e Treino)
- **Compartilhar treinos via link único**
- Visualizar semanas, histórico e todos os treinos

### 👁️ Visitante / Aluno
- **Acesso somente via link compartilhado**
- Visualiza apenas o treino correspondente ao link
- **Nenhuma listagem global permitida**
- **Nenhuma permissão de escrita**
- Interface limpa e focada no treino

## 🔒 Segurança e Proteção

- **Método protegido**: Visitantes não têm acesso a listagens ou outros treinos
- **Acesso por token**: Cada treino tem um token único de compartilhamento
- **RLS (Row Level Security)**: Políticas rigorosas no Supabase
  - Owner: Acesso total
  - Visitante: SELECT somente via token_compartilhamento
  - Nenhuma escrita permitida para anon

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **exercicios**: Exercícios disponíveis
- **tipos_treino**: Tipos de treino (Hipertrofia, Resistência, etc.)
- **semanas**: Semanas de periodização
- **treinos**: Treinos diários (com token_compartilhamento)
- **blocos_treino**: Blocos que compõem cada treino
- **padroes_movimento**: Padrões fixos de movimento
- **bloco_padrao_movimento**: Associação entre blocos e padrões
- **bloco_exercicios**: Exercícios dentro de cada bloco

### Tipos de Bloco

- **PADRAO_MOVIMENTO**: Bloco com padrões de movimento associados
- **MOBILIDADE_ARTICULAR**: Mobilidade e alongamento
- **ATIVACAO_CORE**: Ativação de core (com prescrição + exercícios)
- **ATIVACAO_NEURAL**: Ativação neural
- **TREINO**: Bloco principal de treino (com prescrição + exercícios)
- **CONDICIONAMENTO_FISICO**: Condicionamento e cardio

### Padrões de Movimento (Fixos)

- DOBRAR E PUXAR H
- EMPURRAR E AGACHAR
- DOBRAR E PUXAR V
- CÁRDIO E CORE
- AGACHAR E EMPURRAR V

## 🛠️ Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd treinos-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta (plano gratuito)
2. Crie um novo projeto
3. Vá em **Settings > API** e copie:
   - **Project URL** (VITE_SUPABASE_URL)
   - **anon public** key (VITE_SUPABASE_ANON_KEY)

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 5. Execute o script SQL

1. No painel do Supabase, vá em **SQL Editor**
2. Copie e execute o conteúdo do arquivo `supabase-schema.sql`
3. Isso criará todas as tabelas, índices e políticas RLS necessárias

### 6. Configure a autenticação no Supabase

1. No painel do Supabase, vá em **Authentication > Settings**
2. Configure o **Site URL** (para desenvolvimento: `http://localhost:5173`)
3. Adicione URLs permitidas se necessário
4. Crie um usuário em **Authentication > Users > Add User**

### 7. Execute o projeto localmente

```bash
npm run dev
```

Acesse `http://localhost:5173`

## 📱 Deploy no GitHub Pages

### 1. Configure o Vite

O arquivo `vite.config.js` já está configurado para GitHub Pages. Se seu repositório tiver um nome diferente de `treinos-app`, ajuste a linha `base`:

```js
base: process.env.NODE_ENV === 'production' ? '/seu-repositorio/' : '/',
```

### 2. Instale o plugin do GitHub Pages

```bash
npm install --save-dev gh-pages
```

### 3. Atualize o package.json

Adicione os scripts:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

### 4. Configure as variáveis de ambiente no GitHub

1. Vá em **Settings > Secrets and variables > Actions**
2. Adicione as variáveis:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

Ou configure via GitHub Actions (recomendado):

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 5. Faça o deploy

```bash
npm run deploy
```

### 6. Configure o GitHub Pages

1. Vá em **Settings > Pages**
2. Selecione a branch `gh-pages` como source
3. Acesse sua aplicação em: `https://seu-usuario.github.io/treinos-app/`

### 7. Atualize o Supabase

No painel do Supabase, em **Authentication > Settings**, adicione a URL de produção:

```
https://seu-usuario.github.io
```

## 🔗 Compartilhamento de Treinos

### Como Compartilhar

1. Acesse um treino na área do Owner
2. Clique no botão **"Compartilhar"**
3. O sistema gerará automaticamente um token único (se ainda não existir)
4. O link será copiado automaticamente para a área de transferência
5. Envie o link para o aluno

### Link de Compartilhamento

O link segue o formato:
```
https://seu-dominio.com/treino-publico/{token}
```

### Segurança do Compartilhamento

- Cada treino tem um token único e não sequencial
- Visitantes só podem ver o treino específico do link
- Nenhuma listagem ou navegação entre treinos é permitida
- O método do profissional permanece protegido

## 📱 PWA (Progressive Web App)

A aplicação já está configurada como PWA:

- **Manifest**: `public/manifest.json`
- **Service Worker**: `public/sw.js`
- **Ícones**: Adicione `icon-192.png` e `icon-512.png` na pasta `public/`

### Adicionar à tela inicial (Android)

1. Abra a aplicação no navegador
2. Toque no menu (3 pontos)
3. Selecione "Adicionar à tela inicial"

## 🎨 Personalização

### Cores

As cores principais estão definidas em:
- Gradiente: `#667eea` → `#764ba2`
- Ajuste nos arquivos CSS conforme necessário

### Ícones PWA

Gere ícones de 192x192 e 512x512 pixels e adicione em `public/`:
- `icon-192.png`
- `icon-512.png`

## 🐛 Troubleshooting

### Erro de autenticação
- Verifique se as credenciais do Supabase estão corretas no `.env`
- Confirme que o RLS está configurado corretamente

### Erro ao fazer deploy
- Verifique se o `base` no `vite.config.js` está correto
- Confirme que as variáveis de ambiente estão configuradas

### PWA não funciona
- Verifique se o Service Worker está registrado (console do navegador)
- Confirme que está usando HTTPS (necessário para PWA)

### Link de compartilhamento não funciona
- Verifique se o token foi gerado corretamente no banco
- Confirme que as políticas RLS permitem SELECT por token para anon

## 📝 Scripts Disponíveis

- `npm run dev`: Inicia servidor de desenvolvimento
- `npm run build`: Cria build de produção
- `npm run preview`: Preview do build de produção
- `npm run deploy`: Deploy para GitHub Pages

## 🔐 Políticas RLS (Row Level Security)

O sistema implementa políticas rigorosas de segurança:

- **SELECT**: 
  - Owner: Acesso a todos os dados
  - Visitante: Apenas treinos com token válido
- **INSERT/UPDATE/DELETE**: 
  - Apenas usuários autenticados (Owner)
  - Nenhuma escrita permitida para anon

## 📄 Licença

Este projeto é de uso pessoal e livre para modificação.

## 👨‍💻 Desenvolvimento

Para contribuir ou modificar:

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Abra um Pull Request

---

**Desenvolvido com ❤️ para profissionais de educação física**

**Protege seu método. Compartilhe com segurança.**
