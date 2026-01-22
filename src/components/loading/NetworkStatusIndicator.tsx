import { Alert, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';

/**
 * Componente que monitora status da rede e mostra alerta quando offline.
 * Importante para PWA onde usuário pode não perceber que está sem internet.
 */
export const NetworkStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[NetworkStatus] Online');
      setIsOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      console.warn('[NetworkStatus] Offline');
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificação inicial
    if (!navigator.onLine) {
      setShowOfflineAlert(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Alerta de offline */}
      <Snackbar
        open={showOfflineAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: { xs: 16, sm: 24 } }}
      >
        <Alert
          severity="warning"
          variant="filled"
          sx={{ width: '100%' }}
          onClose={() => setShowOfflineAlert(false)}
        >
          📡 Sem conexão com a internet. Alguns recursos podem não funcionar.
        </Alert>
      </Snackbar>

      {/* Alerta de volta online */}
      <Snackbar
        open={isOnline && showOfflineAlert === false && !navigator.onLine}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ top: { xs: 16, sm: 24 } }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          Conexão restaurada!
        </Alert>
      </Snackbar>
    </>
  );
};

export default NetworkStatusIndicator;
