# Compatibilidade PWA com iOS Safari

## Problemas Específicos do iOS

O iOS Safari tem limitações conhecidas com Service Workers e PWAs:

### 1. **Loop de Reload**
**Problema**: `window.location.reload()` pode causar loops infinitos
**Solução**: Flag `refreshing` para prevenir múltiplos reloads

```javascript
let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (refreshing) return;
  refreshing = true;
  window.location.reload();
});
```

### 2. **Timeouts Agressivos**
**Problema**: iOS Safari fecha conexões de rede mais rapidamente
**Solução**: Timeouts mais curtos (800ms vs 1000ms)

```javascript
// iOS-friendly timeout
const networkResp = await fetchWithTimeout(request, 800);
```

### 3. **Clients.claim()**
**Problema**: iOS precisa de `clients.claim()` explícito no activate
**Solução**: Verificar disponibilidade antes de chamar

```javascript
if (self.clients && self.clients.claim) {
  await self.clients.claim();
  console.log('[SW] Clients claimed (iOS compatible)');
}
```

### 4. **Update Check Delay**
**Problema**: Verificação imediata de update pode falhar no iOS
**Solução**: Adicionar timeout de 1s antes de `registration.update()`

```javascript
setTimeout(() => registration.update(), 1000);
```

## Melhorias Implementadas (v5)

### ✅ Prevenção de Loop de Reload
- Flag `refreshing` em [main.tsx](src/main.tsx#L44)
- Evita múltiplas chamadas de `window.location.reload()`

### ✅ Timeouts Otimizados
- Navegação: 800ms (era 1000ms)
- Fetch genérico: 2000ms (era 3000ms)

### ✅ Clients.claim() Compatível
- Verificação `if (self.clients && self.clients.claim)`
- Log de confirmação para debug

### ✅ Update Check com Delay
- `setTimeout(() => registration.update(), 1000)`
- Aguarda 1s após registro para forçar atualização

### ✅ Remoção de Reload Duplicado
- Removido reload no `statechange` (era duplicado)
- Mantido apenas no `controllerchange`

## Testes Recomendados

### 1. Teste em iPhone Real
```bash
# Build de produção
npm run build

# Servir localmente com ngrok/localtunnel
npx serve -s dist -l 3000
ngrok http 3000

# Acessar URL do ngrok no iPhone
# Adicionar à tela inicial
# Testar abertura como PWA
```

### 2. Verificar Auto-Update
1. Acessar PWA instalada
2. Fazer alteração no código
3. Build e deploy
4. Aguardar 1-2 minutos
5. Verificar console: "🔄 Controller changed, reloading..."
6. Confirmar que página recarregou automaticamente

### 3. Teste Offline
1. Abrir PWA
2. Ativar modo avião
3. Tentar navegar entre páginas
4. Verificar fallback para index.html
5. Confirmar que assets carregam do cache

## Debug no iOS

### Safari Remote Debugging
1. iPhone: Settings > Safari > Advanced > Web Inspector (ON)
2. Mac: Safari > Preferences > Advanced > Show Develop menu
3. Mac Safari: Develop > [Your iPhone] > [Your PWA]
4. Inspecionar console logs do Service Worker

### Console Logs Importantes
```
✅ SW registered: ...
🔄 SW update found
🔄 Novo SW instalado, ativando...
🔄 Controller changed, reloading...
[SW] Clients claimed (iOS compatible)
```

## Problemas Conhecidos do iOS

### 1. **Cache Storage Limits**
- iOS limita storage a ~50MB por origem
- Cache pode ser limpo se device tiver pouco espaço
- **Solução**: Cachear apenas assets essenciais

### 2. **Background Sync**
- iOS não suporta Background Sync API
- Service Worker é suspenso quando app não está ativo
- **Solução**: Usar apenas cache/offline strategies

### 3. **Push Notifications**
- iOS Safari não suporta Web Push (até iOS 16.4)
- **Solução**: Usar notificações nativas via app wrapper

### 4. **Install Prompt**
- iOS não dispara evento `beforeinstallprompt`
- Usuário precisa adicionar manualmente via Share > Add to Home Screen
- **Solução**: Mostrar instruções visuais

## Compatibilidade por Versão iOS

| Feature | iOS 11-12 | iOS 13-14 | iOS 15+ |
|---------|-----------|-----------|---------|
| Service Workers | ⚠️ Limitado | ✅ Sim | ✅ Sim |
| Cache API | ⚠️ Bugs | ✅ Sim | ✅ Sim |
| IndexedDB | ✅ Sim | ✅ Sim | ✅ Sim |
| Push Notifications | ❌ Não | ❌ Não | ⚠️ iOS 16.4+ |
| Install Prompt | ❌ Não | ❌ Não | ❌ Não |
| Clients.claim() | ⚠️ Bugs | ✅ Sim | ✅ Sim |

## Checklist de Deploy

Antes de fazer deploy para iOS:

- [ ] Versão do SW incrementada (`CACHE_VERSION`)
- [ ] Flag `refreshing` presente em main.tsx
- [ ] Timeouts ajustados para iOS (≤1s)
- [ ] `clients.claim()` com verificação
- [ ] Ícones 192x192 e 512x512 presentes
- [ ] `manifest.webmanifest` com `scope` correto
- [ ] Testado em iPhone real (não apenas simulador)
- [ ] Verificado auto-update funciona
- [ ] Console logs de SW aparecem no Safari Inspector

## Referências

- [Apple PWA Guidelines](https://webkit.org/blog/8090/workers-at-your-service/)
- [iOS Safari Limitations](https://firt.dev/notes/pwa-ios/)
- [Service Worker Cookbook](https://serviceworke.rs/)
