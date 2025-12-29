#!/bin/bash
# 🚀 Informações sobre a configuração de deploy

set -e

echo "🎛️  Configuração de Deploy - Training Platform"
echo "=============================================="
echo

echo "📊 Status Atual:"
echo "=================="
echo "✅ Modo: 🔧 Mock Data (Demonstração)"
echo "✅ Configuração: Simples e público"
echo "✅ Deploy: Automático no GitHub Pages"
echo "✅ Sem secrets necessários"
echo
echo "🎯 Este projeto está configurado para ser 100% demo-friendly:"
echo "   • Zero configuração necessária"
echo "   • Funciona para qualquer visitante"  
echo "   • Portfolio/demo sempre disponível"
echo "   • Repositório totalmente público"
echo
echo "� Funcionalidades demo disponíveis:"
echo "   • Login: qualquer@email.com / qualquer-senha"
echo "   • Todos os CRUDs funcionando (simulado)"
echo "   • Interface Material-UI completa"
echo "   • Dados realistas para demonstração"
echo

echo "Opções disponíveis:"
echo "1) 📖 Ver documentação completa"
echo "2) � Verificar configuração atual"
echo "3) 🚀 Como fazer deploy"
echo "4) ❌ Sair"
echo

read -p "Digite sua opção (1-4): " choice

case $choice in
    1)
        echo
        echo "� Documentação:"
        echo "=================="
        echo "• DEPLOY_SIMPLE.md - Configuração atual (recomendado)"
        echo "• DEPLOY_CONFIG.md - Opções avançadas (se precisar de Supabase real)"
        echo "• README.md - Documentação geral do projeto"
        echo
        echo "Para ver:"
        echo "   cat DEPLOY_SIMPLE.md"
        ;;
    2)
        echo
        echo "🔍 Configuração Atual:"
        echo "======================"
        echo "Workflow: npm run build:mock"
        echo "Variável: VITE_USE_MOCK=true"
        echo "Secrets: Nenhum necessário"
        echo
        echo "Arquivo completo:"
        echo "   cat .github/workflows/deploy.yml"
        ;;
    3)
        echo
        echo "� Como Fazer Deploy:"
        echo "====================="
        echo "É automático! Só fazer:"
        echo "   git add ."
        echo "   git commit -m 'Sua mensagem'"
        echo "   git push origin main"
        echo
        echo "O GitHub Actions vai:"
        echo "   • Buildar com dados mock"
        echo "   • Fazer deploy no GitHub Pages"
        echo "   • Site fica disponível em poucos minutos"
        ;;
    4)
        echo "✅ Configuração perfeita para projeto público!"
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo
echo "� Resumo: Este setup é ideal para portfolio e demos!"