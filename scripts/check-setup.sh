#!/bin/bash

# Script para verificar se o ambiente está configurado corretamente
# Copyright © 2025 - Todos os direitos reservados

echo "🔍 Verificando configuração do ambiente..."
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# 1. Verificar Node.js
echo "1️⃣  Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    echo "   Instale em: https://nodejs.org/"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Verificar npm
echo "2️⃣  Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm instalado: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm não encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Verificar node_modules
echo "3️⃣  Verificando dependências..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules não encontrado${NC}"
    echo "   Execute: npm install"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Verificar arquivo .env
echo "4️⃣  Verificando arquivo .env..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
    
    # Verificar se as variáveis estão configuradas
    if grep -q "VITE_SUPABASE_URL=https://" .env && ! grep -q "seu-projeto" .env; then
        echo -e "${GREEN}✅ VITE_SUPABASE_URL configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  VITE_SUPABASE_URL precisa ser configurado${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY=eyJ" .env && ! grep -q "sua-chave" .env; then
        echo -e "${GREEN}✅ VITE_SUPABASE_ANON_KEY configurado${NC}"
    else
        echo -e "${YELLOW}⚠️  VITE_SUPABASE_ANON_KEY precisa ser configurado${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Arquivo .env não encontrado${NC}"
    echo "   Execute: cp .env.example .env"
    echo "   Depois edite o .env com suas credenciais"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 5. Verificar package.json
echo "5️⃣  Verificando package.json..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json encontrado${NC}"
else
    echo -e "${RED}❌ package.json não encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 6. Verificar arquivos principais
echo "6️⃣  Verificando arquivos principais..."
FILES=("src/main.jsx" "src/App.jsx" "index.html" "vite.config.js")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file não encontrado${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# Resumo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Tudo pronto! Execute: npm run dev${NC}"
else
    echo -e "${RED}⚠️  Encontrados $ERRORS problema(s)${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Instale as dependências: npm install"
    echo "2. Configure o .env: cp .env.example .env"
    echo "3. Edite o .env com suas credenciais do Supabase"
    echo "4. Execute novamente: ./scripts/check-setup.sh"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

