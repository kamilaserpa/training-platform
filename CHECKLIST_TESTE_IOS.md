# ✅ Checklist: Teste iOS PWA v5

**Imprima ou mantenha aberto durante o teste**

---

## 📋 Preparação (No Computador)

### Fase 1: Build e Deploy

- [ ] ✅ Executar `npm run build`
- [ ] ✅ Verificar que `public/sw.js` tem `CACHE_VERSION = 'v5'`
- [ ] ✅ Commit: `git commit -m "fix(pwa): iOS standalone hang v5"`
- [ ] ✅ Push: `git push origin main`
- [ ] ⏰ Aguardar 2-5 minutos (GitHub Actions)
- [ ] ✅ Verificar deploy concluído (Actions ✅ verde)
- [ ] ✅ Testar no navegador do computador (deve funcionar)

**Comando rápido:**
```bash
./scripts/test-pwa.sh full
```

---

## 📱 Teste no iPhone (Parte 1: Limpeza)

### Fase 2: Remover App Antigo

- [ ] Localizar ícone do PWA na tela inicial
- [ ] Pressionar e segurar o ícone
- [ ] Tocar "Remover App"
- [ ] Confirmar "Deletar App"
- [ ] ✅ Ícone removido da tela inicial

### Fase 3: Limpar Cache Safari

- [ ] Abrir app **Ajustes** (Settings)
- [ ] Rolar até **Safari**
- [ ] Tocar em **Avançado** (Advanced)
- [ ] Tocar em **Dados de Websites** (Website Data)
- [ ] **Opção A:** Encontrar `github.io` → Deslizar esquerda → "Excluir"
- [ ] **Opção B (recomendado):** Tocar "Remover Todos os Dados"
- [ ] Confirmar remoção
- [ ] ✅ Cache limpo

### Fase 4: Fechar Safari

- [ ] Deslizar de baixo para cima (ou duplo clique Home)
- [ ] Localizar Safari nos apps abertos
- [ ] Deslizar Safari para cima (force quit)
- [ ] ✅ Safari fechado
- [ ] ⏰ **Aguardar 10 segundos** (importante!)

---

## 📱 Teste no iPhone (Parte 2: Instalação)

### Fase 5: Primeira Visita no Safari

- [ ] Abrir **Safari** (fresh)
- [ ] Digitar URL completa:
  ```
  https://SEU-USUARIO.github.io/training-platform/
  ```
- [ ] Pressionar "Ir"
- [ ] ✅ Página deve carregar em **1-3 segundos**
- [ ] ✅ Interface aparece completa (sem erros)

**Se não carregar:** Aguardar mais 5 minutos (deploy pode estar propagando)

### Fase 6: Instalar PWA

- [ ] No Safari, tocar botão **Compartilhar** (caixa com seta ↑)
- [ ] Rolar menu e tocar **"Adicionar à Tela de Início"**
- [ ] (Opcional) Editar nome do app
- [ ] Tocar **"Adicionar"**
- [ ] ✅ Ícone aparece na tela inicial

---

## 🧪 Teste no iPhone (Parte 3: Validação)

### Fase 7: Teste de Regressão (CRUCIAL!)

**Tentativa 1:**
- [ ] Tocar ícone do PWA na tela inicial
- [ ] ✅ Deve carregar normalmente (1-3s)
- [ ] ✅ Interface completa aparece
- [ ] ⏱️ Anotar tempo: ______ segundos

**Tentativa 2 (BUG FOI AQUI!):**
- [ ] Fechar app (deslizar de baixo → swipe up)
- [ ] Tocar ícone do PWA novamente
- [ ] ✅ **Deve carregar normalmente** (NÃO TRAVA!) ⭐
- [ ] ✅ Interface aparece (não fica em "Carregando...")
- [ ] ⏱️ Anotar tempo: ______ segundos

**Tentativa 3:**
- [ ] Fechar app novamente
- [ ] Abrir PWA
- [ ] ✅ Carrega normalmente
- [ ] ⏱️ Anotar tempo: ______ segundos

**Tentativa 4:**
- [ ] Fechar e abrir mais uma vez
- [ ] ✅ Continua funcionando
- [ ] ⏱️ Anotar tempo: ______ segundos

**Se passou em TODAS:** 🎉 **CORREÇÃO VALIDADA!**

---

## 🔍 Debug (Se Necessário)

### Fase 8: Verificação com Debug Page

- [ ] No Safari (ou no PWA), acessar:
  ```
  https://SEU-USUARIO.github.io/training-platform/sw-debug.html
  ```
- [ ] ✅ "Service Worker Ativo" deve mostrar **v5**
- [ ] ✅ Caches devem ter sufixo **-v5** (não v3 ou v4)
- [ ] Se mostrar v4: cache antigo! → Tocar "Reset Completo"

### Fase 9: Reset Completo (Último Recurso)

- [ ] Na debug page, tocar **"Reset Completo"**
- [ ] Confirmar
- [ ] ⏰ Aguardar reload
- [ ] Voltar para **Fase 2** (remover app)
- [ ] Repetir processo completo

---

## 📊 Resultados Esperados

| Teste | Esperado | Resultado Real | ✅/❌ |
|-------|----------|----------------|-------|
| Safari 1ª vez | Carrega em 1-3s | _____ s | [ ] |
| Instalação PWA | Sucesso | Sim/Não | [ ] |
| PWA - Tentativa 1 | Carrega normal | Sim/Não | [ ] |
| PWA - Tentativa 2 | **Carrega (não trava!)** ⭐ | Sim/Não | [ ] |
| PWA - Tentativa 3 | Carrega normal | Sim/Não | [ ] |
| PWA - Tentativa 4 | Carrega normal | Sim/Não | [ ] |
| Debug page | Versão v5 | v_____ | [ ] |

**Critério de sucesso:** TODAS as tentativas PWA devem funcionar ✅

---

## ⚠️ Troubleshooting Rápido

### Problema: Ainda trava na 2ª tentativa

**Solução:**
1. [ ] Verificar debug page (deve ser v5)
2. [ ] Se v4: Executar "Reset Completo"
3. [ ] Desinstalar PWA
4. [ ] Repetir Fases 2-7

### Problema: Debug page mostra v4 ou v3

**Solução:**
1. [ ] Aguardar 10-30 minutos (cache persistente)
2. [ ] OU executar reset completo
3. [ ] Verificar se deploy completou no GitHub

### Problema: Funciona no Safari mas não no PWA

**Solução:**
1. [ ] Acessar debug page **no PWA instalado** (não Safari)
2. [ ] Executar "Reset Completo" **no PWA**
3. [ ] Desinstalar e reinstalar

---

## ✅ Validação Final

### Checklist Completo

- [ ] ✅ Build v5 gerado e deployado
- [ ] ✅ Cache iPhone limpo
- [ ] ✅ PWA instalado
- [ ] ✅ Testado 4+ vezes sem travar
- [ ] ✅ Debug page confirma v5
- [ ] ✅ Tempos de carregamento: 1-3s

### Assinatura de Aprovação

**Data:** ____/____/2026  
**Testador:** _________________________  
**iPhone modelo:** _________________________  
**iOS versão:** _________________________  
**Resultado:** ✅ APROVADO / ❌ REPROVADO

**Observações:**
```
_____________________________________________________
_____________________________________________________
_____________________________________________________
```

---

## 📚 Recursos

- **Guia completo:** `IOS_PWA_HANG_FIX_V5.md`
- **Teste rápido:** `TESTE_RAPIDO_IOS.md`
- **Resumo:** `RESUMO_CORRECAO_IOS_PWA.md`
- **Debug page:** `/sw-debug.html`
- **Script:** `./scripts/test-pwa.sh`

---

**Tempo estimado:** 5-10 minutos  
**Dificuldade:** ⭐⭐ (média)  
**Impacto:** 🎯 CRÍTICO

*Boa sorte! 🍀*
