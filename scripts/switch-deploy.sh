#!/bin/bash
# 🚀 Alternar entre Mock e Supabase no deploy

set -e

echo "🎛️  Alternar Modo de Deploy"
echo "=========================="
echo

# Verificar modo atual
if [ -f ".github/workflows/deploy.yml" ]; then
    if grep -q "build:mock" .github/workflows/deploy.yml; then
        current="Mock Data (Demonstração)"
    else
        current="Supabase Real (Produção)"
    fi
else
    current="Não configurado"
fi

echo "📍 Modo atual: $current"
echo

echo "Escolha o modo de deploy:"
echo "1) 🔧 Mock Data (Demo/Portfolio)"
echo "2) 🔗 Supabase Real (Produção)"  
echo "3) 📋 Ver status"
echo "4) ❌ Cancelar"
echo

read -p "Digite sua opção (1-4): " choice

case $choice in
    1)
        echo
        echo "🔧 Alterando para MOCK DATA..."
        cp .github/workflows/deploy-mock.yml .github/workflows/deploy.yml
        echo "✅ Deploy configurado para dados mock"
        echo
        echo "📝 Para aplicar:"
        echo "   git add .github/workflows/deploy.yml"
        echo "   git commit -m 'Switch to mock data for demo'"
        echo "   git push origin main"
        echo
        echo "💡 Benefícios:"
        echo "   • Zero configuração necessária"
        echo "   • Demo sempre funcionando"
        echo "   • Sem secrets no GitHub"
        ;;
    2)
        echo
        echo "🔗 Alterando para SUPABASE REAL..."
        cp .github/workflows/deploy-supabase.yml .github/workflows/deploy.yml
        echo "✅ Deploy configurado para Supabase"
        echo
        echo "⚠️  IMPORTANTE: Configure os secrets primeiro:"
        echo "   1. GitHub: Settings > Secrets and Variables > Actions"
        echo "   2. Adicionar:"
        echo "      • VITE_SUPABASE_URL = https://seu-projeto.supabase.co"
        echo "      • VITE_SUPABASE_ANON_KEY = sua-chave-publica"
        echo
        echo "📝 Depois aplique:"
        echo "   git add .github/workflows/deploy.yml"
        echo "   git commit -m 'Switch to Supabase for production'"
        echo "   git push origin main"
        ;;
    3)
        echo
        echo "📊 Status Detalhado:"
        echo "==================="
        echo "Modo atual: $current"
        echo
        echo "Arquivos disponíveis:"
        echo "• deploy.yml ← ATIVO (usado pelo GitHub)"
        echo "• deploy-mock.yml ← Template para dados mock"  
        echo "• deploy-supabase.yml ← Template para Supabase"
        echo "• deploy.yml.backup ← Backup da versão anterior"
        echo
        echo "Para trocar: npm run toggle-deploy"
        ;;
    4)
        echo "❌ Operação cancelada"
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo
echo "📖 Documentação: DEPLOY_SIMPLE.md"