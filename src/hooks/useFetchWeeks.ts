import { useCachedQuery, UseCachedQueryResult } from './useCachedQuery';
import { trainingService } from 'services/trainingService';
import type { TrainingWeek } from 'types/database.types';

/**
 * Interface para semana com treinos (inclui trainings e week_focus)
 */
export interface WeekWithTrainings extends TrainingWeek {
  trainings?: any[];
}

/**
 * Hook to fetch all training weeks with cache-first strategy
 *
 * Returns cached data immediately if available, then fetches fresh data
 * in the background and updates the UI when ready.
 *
 * @example
 * ```tsx
 * function WeeksPage() {
 *   const { data: weeks, isLoading, refetch } = useFetchWeeks();
 *
 *   if (isLoading && !weeks) return <Skeleton />;
 *
 *   return (
 *     <div>
 *       {weeks?.map(week => <WeekCard key={week.id} week={week} />)}
 *       <Button onClick={refetch}>Refresh</Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFetchWeeks(): UseCachedQueryResult<WeekWithTrainings[]> {
  return useCachedQuery<WeekWithTrainings[]>({
    cacheKey: 'weeks:all',
    fetcher: () => trainingService.getWeeksWithTrainings(),
    ttl: 5 * 60 * 1000, // 5 minutes
    revalidateOnMount: true,
    revalidateOnFocus: false,
  });
}

/**
 * Hook to fetch a single week by ID with cache-first strategy
 *
 * @param id Week ID
 */
export function useFetchWeek(id: string | null): UseCachedQueryResult<WeekWithTrainings> {
  return useCachedQuery<WeekWithTrainings>({
    cacheKey: `week:${id}`,
    fetcher: async () => {
      if (!id) throw new Error('Week ID is required');
      const weeks = await trainingService.getWeeksWithTrainings();
      const week = weeks.find((w) => w.id === id);
      if (!week) throw new Error('Week not found');
      return week;
    },
    ttl: 10 * 60 * 1000, // 10 minutes
    revalidateOnMount: true,
  });
}

/**
 * Hook to invalidate weeks cache
 * Use after create/update/delete operations
 */
export function useInvalidateWeeksCache() {
  const { clearCache: clearAll } = useFetchWeeks();

  return {
    invalidateAll: clearAll,
    invalidateOne: async (id: string) => {
      const { db } = await import('lib/db');
      await db.deleteCache(`week:${id}`);
    },
  };
}
