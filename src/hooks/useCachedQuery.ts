import { useEffect, useState, useCallback, useRef } from 'react';
import { db } from 'lib/db';

export interface UseCachedQueryOptions<T> {
  /**
   * Unique cache key for this query
   */
  cacheKey: string;

  /**
   * Function that fetches fresh data from the server
   */
  fetcher: () => Promise<T>;

  /**
   * Cache Time-To-Live in milliseconds (default: 5 minutes)
   */
  ttl?: number;

  /**
   * Whether to fetch on mount even if cache exists (default: true)
   * Set to false for truly cache-first behavior
   */
  revalidateOnMount?: boolean;

  /**
   * Whether to automatically refetch when window regains focus (default: false)
   */
  revalidateOnFocus?: boolean;

  /**
   * Callback when data is updated
   */
  onSuccess?: (data: T) => void;

  /**
   * Callback when fetch fails
   */
  onError?: (error: Error) => void;
}

export interface UseCachedQueryResult<T> {
  /**
   * Current data (from cache or fresh fetch)
   */
  data: T | null;

  /**
   * Whether initial load is complete (cache or first fetch)
   */
  isLoading: boolean;

  /**
   * Whether background revalidation is in progress
   */
  isRevalidating: boolean;

  /**
   * Error from the last fetch attempt
   */
  error: Error | null;

  /**
   * Whether data came from cache
   */
  isFromCache: boolean;

  /**
   * Timestamp of current data
   */
  timestamp: number | null;

  /**
   * Manually trigger a refetch
   */
  refetch: () => Promise<void>;

  /**
   * Clear cache for this query
   */
  clearCache: () => Promise<void>;
}

/**
 * Cache-first data fetching hook with IndexedDB via Dexie
 * 
 * Pattern:
 * 1. Return cached data immediately if available
 * 2. Fetch fresh data in background
 * 3. Update cache and re-render when fresh data arrives
 * 4. Does not block navigation or UI
 * 
 * @example
 * ```tsx
 * const { data, isLoading, isRevalidating, refetch } = useCachedQuery({
 *   cacheKey: 'exercises:all',
 *   fetcher: () => exerciseService.getAllExercises(),
 *   ttl: 5 * 60 * 1000, // 5 minutes
 * });
 * ```
 */
export function useCachedQuery<T>({
  cacheKey,
  fetcher,
  ttl = 5 * 60 * 1000, // 5 minutes default
  revalidateOnMount = true,
  revalidateOnFocus = false,
  onSuccess,
  onError,
}: UseCachedQueryOptions<T>): UseCachedQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const isMountedRef = useRef(true);
  const fetchInProgressRef = useRef(false);

  /**
   * Load data from cache
   */
  const loadFromCache = useCallback(async () => {
    try {
      const cached = await db.getCache<T>(cacheKey);
      
      if (cached && isMountedRef.current) {
        setData(cached.data);
        setIsFromCache(true);
        setTimestamp(cached.timestamp);
        setIsLoading(false);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Failed to load from cache:', err);
      return false;
    }
  }, [cacheKey]);

  /**
   * Fetch fresh data from server and update cache
   */
  const fetchAndCache = useCallback(async (isBackground = false) => {
    // Prevent concurrent fetches
    if (fetchInProgressRef.current) return;
    
    fetchInProgressRef.current = true;
    
    if (!isBackground) {
      setIsLoading(true);
    } else {
      setIsRevalidating(true);
    }
    
    setError(null);

    try {
      const freshData = await fetcher();
      
      if (!isMountedRef.current) return;

      // Update cache
      await db.setCache(cacheKey, freshData, ttl);

      // Update state
      setData(freshData);
      setIsFromCache(false);
      setTimestamp(Date.now());
      setError(null);

      onSuccess?.(freshData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (!isMountedRef.current) return;
      
      setError(error);
      onError?.(error);
      
      console.error('Failed to fetch data:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRevalidating(false);
      }
      fetchInProgressRef.current = false;
    }
  }, [cacheKey, fetcher, ttl, onSuccess, onError]);

  /**
   * Manual refetch
   */
  const refetch = useCallback(async () => {
    await fetchAndCache(false);
  }, [fetchAndCache]);

  /**
   * Clear cache for this key
   */
  const clearCache = useCallback(async () => {
    await db.deleteCache(cacheKey);
    setIsFromCache(false);
  }, [cacheKey]);

  /**
   * Initial load: cache first, then revalidate
   */
  useEffect(() => {
    isMountedRef.current = true;

    (async () => {
      // Try to load from cache first
      const hasCache = await loadFromCache();

      // If we have cache and don't want to revalidate on mount, we're done
      if (hasCache && !revalidateOnMount) {
        return;
      }

      // Fetch fresh data (in background if we have cache)
      await fetchAndCache(hasCache);
    })();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, revalidateOnMount]);

  /**
   * Revalidate on window focus
   */
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      if (!document.hidden && !fetchInProgressRef.current) {
        fetchAndCache(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revalidateOnFocus]);

  return {
    data,
    isLoading,
    isRevalidating,
    error,
    isFromCache,
    timestamp,
    refetch,
    clearCache,
  };
}
