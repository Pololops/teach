import { useQuery } from '@tanstack/react-query';
import { gameDb } from '@/shared/lib/storage/gameDb';
import type { GameStats } from '@teach/shared';

/**
 * Hook to fetch and manage game statistics
 */
export function useGameStats(userId: string) {
  return useQuery<GameStats>({
    queryKey: ['gameStats', userId],
    queryFn: async () => {
      return await gameDb.getStats(userId);
    },
    staleTime: 0, // Always fetch fresh stats
    refetchOnMount: true,
  });
}

