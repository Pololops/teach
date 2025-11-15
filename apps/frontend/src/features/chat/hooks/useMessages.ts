import { useQuery } from '@tanstack/react-query';
import type { Message } from '@teach/shared';
import { getMessages } from '@/shared/lib/storage/entities/message';

export function useMessages(conversationId: string) {
  return useQuery<Message[], Error>({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
  });
}
