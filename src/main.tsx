import { CssBaseline, ThemeProvider } from '@mui/material';
import BreakpointsProvider from 'providers/BreakpointsProvider';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from 'routes/router';
import { theme } from 'theme/theme';

// Suprimir erros relacionados a extensões do browser
window.addEventListener('error', (e) => {
  if (e.message?.includes('message channel closed before a response was received') ||
    e.message?.includes('listener indicated an asynchronous response')) {
    e.preventDefault();
    return false;
  }
});

// Suprimir erros de promise rejeitada relacionados a extensões
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('message channel closed before a response was received') ||
    e.reason?.message?.includes('listener indicated an asynchronous response')) {
    e.preventDefault();
    return false;
  }
});

// Suprimir apenas erros de extensões do browser (que não controlamos)
window.addEventListener('error', (e) => {
  if (e.message?.includes('message channel closed before a response was received') ||
    e.message?.includes('listener indicated an asynchronous response')) {
    e.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('message channel closed before a response was received') ||
    e.reason?.message?.includes('listener indicated an asynchronous response')) {
    e.preventDefault();
    return false;
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BreakpointsProvider>
        <CssBaseline />
        <RouterProvider router={router} />
      </BreakpointsProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

// Register Service Worker (respects Vite base)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;

    // Flag para prevenir loop de reload (iOS Safari)
    let refreshing = false;

    // Mostra um aviso simples de atualização disponível
    const showUpdateBanner = () => {
      if (document.getElementById('sw-update-banner')) return;
      const banner = document.createElement('div');
      banner.id = 'sw-update-banner';
      banner.style.position = 'fixed';
      banner.style.left = '50%';
      banner.style.bottom = '16px';
      banner.style.transform = 'translateX(-50%)';
      banner.style.zIndex = '10000';
      banner.style.background = '#1A1F3D';
      banner.style.color = 'white';
      banner.style.padding = '10px 16px';
      banner.style.borderRadius = '8px';
      banner.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)';
      banner.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      banner.style.fontSize = '14px';
      banner.textContent = 'Atualização disponível. Atualizando...';
      document.body.appendChild(banner);
    };

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        // Force update check (timeout para iOS)
        setTimeout(() => registration.update(), 1000);

        // Force update on waiting worker
        if (registration.waiting) {
          showUpdateBanner();
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Novo SW instalado, força ativação
                showUpdateBanner();
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });

        // Detecta quando o controller muda (novo SW ativou)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
      })
      .catch((error) => {
        console.error('❌ SW registration failed:', error);
        // App should still work without SW
      });
  });
}
