import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AppLoadingTimeoutProps {
  timeout?: number; // milliseconds (padrão: 10 segundos)
  onRetry?: () => void;
}

/**
 * Componente que detecta timeout de carregamento e oferece opções de recovery.
 * Útil principalmente para PWA standalone onde não há botão de atualizar.
 * 
 * @example
 * // No App.tsx ou layout principal:
 * <Suspense fallback={<AppLoadingTimeout />}>
 *   <Routes />
 * </Suspense>
 */
export const AppLoadingTimeout = ({ 
  timeout = 10000, // 10 segundos padrão
  onRetry 
}: AppLoadingTimeoutProps) => {
  const [showTimeout, setShowTimeout] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Timer principal: detecta timeout
    const timeoutTimer = setTimeout(() => {
      console.warn('[AppLoadingTimeout] Timeout detectado após', timeout, 'ms');
      setShowTimeout(true);
    }, timeout);

    // Timer de contagem: atualiza a cada segundo
    const countInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(timeoutTimer);
      clearInterval(countInterval);
    };
  }, [timeout]);

  const handleRetry = () => {
    console.log('[AppLoadingTimeout] Tentando novamente...');
    
    if (onRetry) {
      onRetry();
    } else {
      // Fallback: recarregar página
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    console.log('[AppLoadingTimeout] Navegando para home...');
    navigate('/');
  };

  const handleClearCache = async () => {
    console.log('[AppLoadingTimeout] Limpando cache...');
    
    try {
      // Limpar Service Worker cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
        console.log('[AppLoadingTimeout] Cache limpo:', cacheNames);
      }

      // Limpar localStorage
      localStorage.clear();
      
      // Limpar sessionStorage
      sessionStorage.clear();

      // Recarregar
      window.location.reload();
    } catch (err) {
      console.error('[AppLoadingTimeout] Erro ao limpar cache:', err);
      window.location.reload();
    }
  };

  if (!showTimeout) {
    // Loading normal (antes do timeout)
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Stack spacing={3} alignItems="center">
          {/* Spinner animado */}
          <Box
            sx={{
              width: 60,
              height: 60,
              border: '4px solid rgba(255,255,255,0.3)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          
          <Typography variant="h6" fontWeight="600">
            Carregando...
          </Typography>
          
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {elapsedTime > 0 ? `${elapsedTime}s` : 'Aguarde'}
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Timeout UI: mostra opções de recovery
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} alignItems="center" textAlign="center">
          {/* Ícone de alerta */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
            }}
          >
            ⏰
          </Box>

          {/* Mensagem principal */}
          <Typography variant="h5" fontWeight="700">
            Carregamento Demorado
          </Typography>

          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            O aplicativo está demorando mais que o esperado para carregar.
            Isso pode ser devido a uma conexão lenta ou um problema temporário.
          </Typography>

          {/* Tempo decorrido */}
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Aguardando há {elapsedTime} segundos
          </Typography>

          {/* Botões de ação */}
          <Stack spacing={2} sx={{ width: '100%', mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              sx={{
                bgcolor: 'white',
                color: '#667eea',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              Tentar Novamente
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Ir para Início
            </Button>

            <Button
              variant="text"
              size="small"
              onClick={handleClearCache}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'underline',
                '&:hover': {
                  color: 'white',
                  bgcolor: 'transparent',
                },
              }}
            >
              Limpar Cache e Tentar Novamente
            </Button>
          </Stack>

          {/* Informação adicional */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: 'rgba(0,0,0,0.2)',
              borderRadius: 2,
              width: '100%',
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              💡 <strong>Dica:</strong> Se o problema persistir, verifique sua conexão
              com a internet ou tente fechar e abrir o aplicativo novamente.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default AppLoadingTimeout;
