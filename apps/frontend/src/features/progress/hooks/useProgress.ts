import { useQuery } from '@tanstack/react-query';
import type { ProgressMetrics } from '@teach/shared';
import { getProgress } from '@/shared/lib/storage/entities/progress';

export function useProgress(userId: string) {
  return useQuery<ProgressMetrics, Error>({
    queryKey: ['progress', userId],
    queryFn: () => getProgress(userId),
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });
}
