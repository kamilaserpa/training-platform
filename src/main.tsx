import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import BreakpointsProvider from 'providers/BreakpointsProvider';
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
