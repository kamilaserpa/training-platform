#!/bin/bash

# Script de Teste PWA - iOS Fix v5
# Uso: ./scripts/test-pwa.sh [comando]

set -e

PURPLE='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 Training Platform PWA - iOS Fix v5${NC}"
echo ""

# Função para verificar versão no sw.js
check_version() {
    echo -e "${YELLOW}🔍 Verificando versão do Service Worker...${NC}"
    
    if grep -q "CACHE_VERSION = 'v5'" public/sw.js; then
        echo -e "${GREEN}✅ Service Worker v5 confirmado!${NC}"
    else
        echo -e "${RED}❌ ATENÇÃO: sw.js não está na versão v5!${NC}"
        echo "Versão encontrada:"
        grep "CACHE_VERSION" public/sw.js
        exit 1
    fi
    
    if grep -q "handleNavigateNetworkOnly" public/sw.js; then
        echo -e "${GREEN}✅ Função de correção iOS confirmada!${NC}"
    else
        echo -e "${RED}❌ Função handleNavigateNetworkOnly não encontrada!${NC}"
        exit 1
    fi
    
    echo ""
}

# Função para build
build() {
    echo -e "${YELLOW}🔨 Gerando build...${NC}"
    npm run build
    
    if [ -d "dist" ]; then
        echo -e "${GREEN}✅ Build gerado em dist/${NC}"
        ls -lh dist/ | head -5
        echo ""
    else
        echo -e "${RED}❌ Erro: pasta dist não encontrada${NC}"
        exit 1
    fi
}

# Função para deploy
deploy() {
    echo -e "${YELLOW}🚀 Fazendo deploy...${NC}"
    
    # Verificar se há mudanças
    if git diff --quiet && git diff --staged --quiet; then
        echo -e "${YELLOW}⚠️  Nenhuma mudança para commitar${NC}"
    else
        echo -e "${GREEN}📝 Commitando mudanças...${NC}"
        git add .
        git commit -m "fix(pwa): iOS standalone hang - network-only navigation v5" || echo "Nada para commitar"
    fi
    
    echo -e "${GREEN}📤 Enviando para GitHub...${NC}"
    git push origin main || git push
    
    echo ""
    echo -e "${GREEN}✅ Deploy iniciado!${NC}"
    echo -e "${YELLOW}⏰ Aguarde 2-5 minutos para propagar...${NC}"
    echo ""
    echo "Verifique o status em:"
    echo "https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
    echo ""
}

# Função para servir localmente
serve() {
    echo -e "${YELLOW}🌐 Servindo localmente...${NC}"
    
    if [ ! -d "dist" ]; then
        echo -e "${YELLOW}⚠️  Build não encontrado, gerando...${NC}"
        build
    fi
    
    echo ""
    echo -e "${GREEN}✅ Acesse: http://localhost:5173${NC}"
    echo -e "${YELLOW}📱 Para testar no iPhone:${NC}"
    echo "   1. iPhone e Mac na mesma rede WiFi"
    echo "   2. Acesse: http://$(ipconfig getifaddr en0):5173"
    echo ""
    
    npm run preview
}

# Função para info
info() {
    echo -e "${PURPLE}📊 Informações do Projeto${NC}"
    echo ""
    
    echo -e "${YELLOW}Git Branch:${NC}"
    git branch --show-current
    
    echo ""
    echo -e "${YELLOW}Último Commit:${NC}"
    git log -1 --oneline
    
    echo ""
    echo -e "${YELLOW}Status Git:${NC}"
    git status --short
    
    echo ""
    echo -e "${YELLOW}Service Worker:${NC}"
    grep "CACHE_VERSION" public/sw.js
    
    echo ""
    echo -e "${YELLOW}Package Version:${NC}"
    grep '"version"' package.json | head -1
    
    echo ""
}

# Função para limpar
clean() {
    echo -e "${YELLOW}🧹 Limpando arquivos de build...${NC}"
    
    if [ -d "dist" ]; then
        rm -rf dist
        echo -e "${GREEN}✅ dist/ removido${NC}"
    fi
    
    if [ -d "node_modules/.vite" ]; then
        rm -rf node_modules/.vite
        echo -e "${GREEN}✅ Cache Vite limpo${NC}"
    fi
    
    echo -e "${GREEN}✅ Limpeza concluída${NC}"
    echo ""
}

# Função para full flow
full() {
    echo -e "${PURPLE}🚀 Fluxo Completo: Check → Clean → Build → Deploy${NC}"
    echo ""
    
    check_version
    clean
    build
    deploy
    
    echo ""
    echo -e "${GREEN}✅ TUDO PRONTO!${NC}"
    echo ""
    echo -e "${YELLOW}📱 Próximos passos no iPhone:${NC}"
    echo "   1. Desinstale o PWA antigo"
    echo "   2. Limpe cache do Safari (Ajustes → Safari → Dados de Websites)"
    echo "   3. Feche Safari completamente"
    echo "   4. Aguarde 10 segundos"
    echo "   5. Abra Safari e acesse seu site"
    echo "   6. Instale o PWA novamente"
    echo "   7. Teste 3+ vezes (não deve travar!)"
    echo ""
    echo -e "${PURPLE}📚 Guia detalhado: TESTE_RAPIDO_IOS.md${NC}"
    echo ""
}

# Função para ajuda
help() {
    echo -e "${PURPLE}Comandos disponíveis:${NC}"
    echo ""
    echo "  check    - Verificar versão do Service Worker"
    echo "  build    - Gerar build de produção"
    echo "  deploy   - Commit e push para GitHub (deploy automático)"
    echo "  serve    - Servir localmente para teste"
    echo "  clean    - Limpar arquivos de build"
    echo "  info     - Mostrar informações do projeto"
    echo "  full     - Executar fluxo completo (check + clean + build + deploy)"
    echo "  help     - Mostrar esta ajuda"
    echo ""
    echo -e "${YELLOW}Exemplos:${NC}"
    echo "  ./scripts/test-pwa.sh check"
    echo "  ./scripts/test-pwa.sh full"
    echo "  ./scripts/test-pwa.sh serve"
    echo ""
}

# Processar comando
case "${1:-help}" in
    check)
        check_version
        ;;
    build)
        check_version
        build
        ;;
    deploy)
        check_version
        deploy
        ;;
    serve)
        serve
        ;;
    clean)
        clean
        ;;
    info)
        info
        ;;
    full)
        full
        ;;
    help|*)
        help
        ;;
esac
