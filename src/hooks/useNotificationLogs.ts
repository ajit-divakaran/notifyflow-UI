import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/supabaseClient';

export const useNotificationLogs = (userId: string | undefined) => {
  // 1. Get the QueryClient so we can control the cache
  const queryClient = useQueryClient();
  
  // We define the key here so we can use it in both the query and the subscription
  const queryKey = ['notification_logs', userId];

  // 2. The Standard Fetch (Handles initial loading & error states)
  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }); // Best practice: order logs

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!userId,
  });

  // 3. The Realtime Subscription (Handles live updates)
  useEffect(() => {
    if (!userId) return;

    // Create a subscription specifically for this user's logs
    const channel = supabase
      .channel(`realtime-logs-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'notification_logs',
          filter: `user_id=eq.${userId}`, // IMPORTANT: Only listen to THIS user's data
        },
        (payload) => {
          console.log('Change received!', payload);
          // STRATEGY: When a change happens, tell React Query the data is "dirty".
          // It will automatically trigger a background refetch to get the fresh list.
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    // Cleanup: Unsubscribe when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]); // Re-run if userId changes

  return queryResult;
};