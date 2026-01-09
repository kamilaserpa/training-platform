#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const rootDir = path.join(__dirname, '..');
const workflowsDir = path.join(rootDir, '.github', 'workflows');

function getCurrentMode() {
  const deployFile = path.join(workflowsDir, 'deploy.yml');
  
  if (!fs.existsSync(deployFile)) {
    return 'Nenhum workflow ativo';
  }
  
  const content = fs.readFileSync(deployFile, 'utf8');
  
  if (content.includes('build:mock') || content.includes("VITE_USE_MOCK: 'true'")) {
    return 'Mock Data (Demo)';
  } else if (content.includes('VITE_SUPABASE_STAGING')) {
    return 'Staging (Homologação)';
  } else if (content.includes('VITE_SUPABASE_URL') && !content.includes('STAGING')) {
    return 'Production (Produção)';
  }
  
  return 'Não identificado';
}

function showMenu() {
  console.log('\n🎛️  Alternar Ambiente de Deploy');
  console.log('==========================');
  console.log('');
  
  const currentMode = getCurrentMode();
  console.log(`📍 Ambiente atual: ${currentMode}`);
  console.log('');
  
  console.log('Escolha o ambiente:');
  console.log('1) 🎭 Mock Data (Demo/Portfolio)');
  console.log('2) 🧪 Staging (Homologação com Supabase Dev)');
  console.log('3) 🚀 Production (Produção com Supabase Prod)');
  console.log('4) 📋 Ver status');
  console.log('5) ❌ Cancelar');
  console.log('');
}

function copyFile(source, dest) {
  const sourceFile = path.join(workflowsDir, source);
  const destFile = path.join(workflowsDir, dest);
  
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Erro: Arquivo ${source} não encontrado!`);
    process.exit(1);
  }
  
  fs.copyFileSync(sourceFile, destFile);
}

function handleMockMode() {
  console.log('');
  console.log('🔧 Alterando para MOCK DATA...');
  console.log('');
  
  // Copiar template para deploy.yml
  const templateFile = path.join(workflowsDir, 'deploy-mock.yml.disabled');
  const deployFile = path.join(workflowsDir, 'deploy.yml');
  
  if (!fs.existsSync(templateFile)) {
    console.error('❌ Erro: Template deploy-mock.yml.disabled não encontrado!');
    process.exit(1);
  }
  
  fs.copyFileSync(templateFile, deployFile);
  console.log('   ➜ deploy-mock.yml.disabled → deploy.yml');
  console.log('');
  console.log('✅ Deploy configurado para dados mock');
  console.log('');
  console.log('📝 Para aplicar:');
  console.log('   git add .github/workflows/deploy.yml');
  console.log('   git commit -m "chore: switch to mock data for demo"');
  console.log('   git push origin main');
  console.log('');
  console.log('💡 Benefícios:');
  console.log('   • Zero configuração necessária');
  console.log('   • Demo sempre funcionando');
  console.log('   • Sem secrets no GitHub');
  console.log('');
}

function handleStagingMode() {
  console.log('');
  console.log('🧪 Alterando para STAGING (Homologação)...');
  console.log('');
  
  const templateFile = path.join(workflowsDir, 'deploy-staging.yml.disabled');
  const deployFile = path.join(workflowsDir, 'deploy.yml');
  
  if (!fs.existsSync(templateFile)) {
    console.error('❌ Erro: Template deploy-staging.yml.disabled não encontrado!');
    process.exit(1);
  }
  
  fs.copyFileSync(templateFile, deployFile);
  console.log('   ➜ deploy-staging.yml.disabled → deploy.yml');
  console.log('');
  console.log('✅ Deploy configurado para Staging (Homologação)');
  console.log('');
  console.log('⚠️  IMPORTANTE: Configure os secrets de STAGING:');
  console.log('   1. GitHub: Settings > Secrets and Variables > Actions');
  console.log('   2. Adicionar:');
  console.log('      • VITE_SUPABASE_STAGING_URL = https://seu-projeto-dev.supabase.co');
  console.log('      • VITE_SUPABASE_STAGING_KEY = sua-chave-publica-dev');
  console.log('');
  console.log('📝 Depois aplique:');
  console.log('   git add .github/workflows/deploy.yml');
  console.log('   git commit -m "chore: switch to staging"');
  console.log('   git push origin main');
  console.log('');
}

function handleProductionMode() {
  console.log('');
  console.log('🚀 Alterando para PRODUCTION (Produção)...');
  console.log('');
  
  const templateFile = path.join(workflowsDir, 'deploy-production.yml.disabled');
  const deployFile = path.join(workflowsDir, 'deploy.yml');
  
  if (!fs.existsSync(templateFile)) {
    console.error('❌ Erro: Template deploy-production.yml.disabled não encontrado!');
    process.exit(1);
  }
  
  fs.copyFileSync(templateFile, deployFile);
  console.log('   ➜ deploy-production.yml.disabled → deploy.yml');
  console.log('');
  console.log('✅ Deploy configurado para Production (Produção)');
  console.log('');
  console.log('⚠️  IMPORTANTE: Configure os secrets de PRODUCTION:');
  console.log('   1. GitHub: Settings > Secrets and Variables > Actions');
  console.log('   2. Adicionar:');
  console.log('      • VITE_SUPABASE_URL = https://seu-projeto-prod.supabase.co');
  console.log('      • VITE_SUPABASE_ANON_KEY = sua-chave-publica-prod');
  console.log('');
  console.log('📝 Depois aplique:');
  console.log('   git add .github/workflows/deploy.yml');
  console.log('   git commit -m "chore: switch to production"');
  console.log('   git push origin main');
  console.log('');
}

function handleStatus() {
  console.log('');
  console.log('📊 Status Detalhado:');
  console.log('===================');
  const currentMode = getCurrentMode();
  console.log(`Ambiente atual: ${currentMode}`);
  console.log('');
  console.log('Arquivos de workflow:');
  
  const files = [
    { name: 'deploy.yml', description: 'ATIVO (executado pelo GitHub)' },
    { name: 'deploy-mock.yml.disabled', description: 'Template: Mock' },
    { name: 'deploy-staging.yml.disabled', description: 'Template: Staging' },
    { name: 'deploy-production.yml.disabled', description: 'Template: Production' },
    { name: 'ci.yml', description: 'CI para Pull Requests' }
  ];
  
  files.forEach(file => {
    const filePath = path.join(workflowsDir, file.name);
    if (fs.existsSync(filePath)) {
      let icon = '📄';
      if (file.name === 'deploy.yml') icon = '✅';
      else if (file.name === 'ci.yml') icon = '🔄';
      else if (file.name.includes('.disabled')) icon = '📦';
      
      console.log(`${icon} ${file.name} (${file.description})`);
    }
  });
  
  console.log('');
  console.log('💡 Como funciona:');
  console.log('   • Templates (.disabled) = referência apenas');
  console.log('   • deploy.yml = cópia do template ativo');
  console.log('   • GitHub executa apenas deploy.yml');
  console.log('');
  console.log('🌍 Ambientes disponíveis:');
  console.log('   1. Mock (demo sem banco)');
  console.log('   2. Staging (homologação com banco dev)');
  console.log('   3. Production (produção com banco prod)');
  console.log('');
  console.log('Para trocar: npm run deploy:setup');
  console.log('');
}

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  // Se passou argumento direto na linha de comando
  const arg = process.argv[2];
  
  if (arg === 'mock' || arg === '1') {
    handleMockMode();
    rl.close();
    return;
  }
  
  if (arg === 'staging' || arg === 'homolog' || arg === '2') {
    handleStagingMode();
    rl.close();
    return;
  }
  
  if (arg === 'production' || arg === 'prod' || arg === '3') {
    handleProductionMode();
    rl.close();
    return;
  }
  
  if (arg === 'status' || arg === '4') {
    handleStatus();
    rl.close();
    return;
  }
  
  // Menu interativo
  showMenu();
  
  const answer = await askQuestion('Digite sua opção (1-5): ');
  
  switch (answer.trim()) {
    case '1':
      handleMockMode();
      break;
    case '2':
      handleStagingMode();
      break;
    case '3':
      handleProductionMode();
      break;
    case '4':
      handleStatus();
      break;
    case '5':
      console.log('❌ Operação cancelada');
      break;
    default:
      console.log('❌ Opção inválida');
      process.exit(1);
  }
  
  console.log('📖 Documentação: DEPLOY.md');
  console.log('');
  
  rl.close();
}

main().catch(error => {
  console.error('❌ Erro:', error.message);
  process.exit(1);
});
