import { useEffect, useState } from 'react';

interface UseAppLoadingDetectorOptions {
  timeout?: number; // milliseconds
  enabled?: boolean;
  onTimeout?: () => void;
}

/**
 * Hook que detecta quando o app está travado em loading por muito tempo.
 * Útil para detectar problemas de rede, cache corrompido, etc.
 * 
 * @example
 * const { hasTimedOut, elapsedTime } = useAppLoadingDetector({
 *   timeout: 10000, // 10 segundos
 *   onTimeout: () => console.log('App travado!')
 * });
 * 
 * if (hasTimedOut) {
 *   return <TimeoutUI />;
 * }
 */
export const useAppLoadingDetector = ({
  timeout = 10000,
  enabled = true,
  onTimeout,
}: UseAppLoadingDetectorOptions = {}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    // Timer de timeout
    const timeoutTimer = setTimeout(() => {
      console.warn('[useAppLoadingDetector] Timeout detectado após', timeout, 'ms');
      setHasTimedOut(true);
      onTimeout?.();
    }, timeout);

    // Contador de tempo
    const countInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(timeoutTimer);
      clearInterval(countInterval);
    };
  }, [timeout, enabled, onTimeout]);

  const reset = () => {
    setHasTimedOut(false);
    setElapsedTime(0);
  };

  return {
    hasTimedOut,
    elapsedTime,
    reset,
  };
};

export default useAppLoadingDetector;
