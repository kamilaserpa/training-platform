#!/usr/bin/env node

/**
 * Script para remover console.logs de debug antes do deploy em produção
 * Mantém apenas console.error em blocos catch para erros críticos
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function cleanLogs(content) {
  let lines = content.split('\n');
  let result = [];
  let skip Emoji = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Pular linhas com console.log, console.info ou console.warn
    if (trimmed.startsWith('console.log(') || 
        trimmed.startsWith('console.info(') ||
        trimmed.startsWith('console.warn(')) {
      continue;
    }
    
    // Pular linhas com console.error que tem emojis (debug)
    if (trimmed.startsWith('console.error(') && /[🔄📁📍⬆️✅❌🎭🔧⚠️🎆🗑️💾📤📋🔍✨📊🎯🛠️📝🖼️🏷️📅💡]/.test(line)) {
      continue;
    }
    
    // Pular linhas com if (error.xxx) console.error
    if (/if\s*\(\s*error\.\w+\s*\)\s*console\.error/.test(trimmed)) {
      continue;
    }
    
    result.push(line);
  }
  
  // Join e limpar múltiplas linhas vazias
  let cleaned = result.join('\n');
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
  
  return cleaned;
}

function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return;
  
  // Pular arquivos de teste e node_modules
  if (filePath.includes('node_modules') || filePath.includes('.test.') || filePath.includes('.spec.')) {
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = cleanLogs(content);
    
    if (content !== cleaned) {
      fs.writeFileSync(filePath, cleaned, 'utf8');
      console.log(`✅ Limpo: ${path.relative(__dirname, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (file !== 'node_modules' && !file.startsWith('.')) {
          walkDir(filePath);
        }
      } else {
        processFile(filePath);
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao ler diretório ${dir}:`, error.message);
  }
}

console.log('🧹 Iniciando limpeza de logs...\n');
walkDir(srcDir);
console.log('\n✅ Limpeza concluída!');
