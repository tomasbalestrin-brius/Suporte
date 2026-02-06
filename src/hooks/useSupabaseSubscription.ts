import { useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Custom hook to manage Supabase subscriptions safely
 * Prevents memory leaks by ensuring proper cleanup
 *
 * @param subscribe - Function that returns a RealtimeChannel
 * @param deps - Dependencies array for the effect
 */
export function useSupabaseSubscription(
  subscribe: () => RealtimeChannel | null,
  deps: React.DependencyList = []
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    isUnmountedRef.current = false;

    // Cleanup previous subscription if exists
    if (channelRef.current) {
      console.warn('Previous subscription still active, cleaning up...');
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    // Create new subscription
    const channel = subscribe();
    channelRef.current = channel;

    // Cleanup function
    return () => {
      isUnmountedRef.current = true;

      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Return channel ref in case it's needed
  return channelRef;
}

/**
 * Hook to manage timeout cleanup
 * Prevents memory leaks from setTimeout
 *
 * @returns [setManagedTimeout, clearManagedTimeout]
 */
export function useManagedTimeout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setManagedTimeout = (callback: () => void, delay: number) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(callback, delay);
  };

  const clearManagedTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearManagedTimeout();
    };
  }, []);

  return [setManagedTimeout, clearManagedTimeout] as const;
}
