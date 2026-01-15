import { useCachedQuery, UseCachedQueryResult } from './useCachedQuery';
import { exerciseService } from 'services/exerciseService';
import type { Exercise } from 'types/database.types';

/**
 * Hook to fetch all exercises with cache-first strategy
 *
 * Returns cached data immediately if available, then fetches fresh data
 * in the background and updates the UI when ready.
 *
 * @example
 * ```tsx
 * function ExercisesPage() {
 *   const { data: exercises, isLoading, isRevalidating, refetch } = useFetchExercises();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <div>
 *       {isRevalidating && <Badge>Updating...</Badge>}
 *       {exercises?.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)}
 *       <Button onClick={refetch}>Refresh</Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFetchExercises(): UseCachedQueryResult<Exercise[]> {
  return useCachedQuery<Exercise[]>({
    cacheKey: 'exercises:all',
    fetcher: () => exerciseService.getAllExercises(),
    ttl: 5 * 60 * 1000, // 5 minutes
    revalidateOnMount: true,
    revalidateOnFocus: false,
  });
}

/**
 * Hook to fetch a single exercise by ID with cache-first strategy
 *
 * @param id Exercise ID
 */
export function useFetchExercise(id: string | null): UseCachedQueryResult<Exercise> {
  return useCachedQuery<Exercise>({
    cacheKey: `exercise:${id}`,
    fetcher: async () => {
      if (!id) throw new Error('Exercise ID is required');
      const exercises = await exerciseService.getAllExercises();
      const exercise = exercises.find((ex) => ex.id === id);
      if (!exercise) throw new Error('Exercise not found');
      return exercise;
    },
    ttl: 10 * 60 * 1000, // 10 minutes
    revalidateOnMount: true,
  });
}

/**
 * Hook to invalidate exercises cache
 * Use after create/update/delete operations
 */
export function useInvalidateExercisesCache() {
  const { clearCache: clearAll } = useFetchExercises();

  return {
    invalidateAll: clearAll,
    invalidateOne: async (id: string) => {
      const { db } = await import('lib/db');
      await db.deleteCache(`exercise:${id}`);
    },
  };
}
