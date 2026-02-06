import { useEffect, useRef, useState } from 'react';
import { RealtimeChannel, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';

interface SubscriptionOptions {
  onError?: (error: Error) => void;
  onReconnect?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Custom hook to manage Supabase subscriptions safely
 * Prevents memory leaks by ensuring proper cleanup
 * Includes error handling and automatic reconnection
 *
 * @param subscribe - Function that returns a RealtimeChannel
 * @param options - Configuration options
 * @param deps - Dependencies array for the effect
 */
export function useSupabaseSubscription(
  subscribe: () => RealtimeChannel | null,
  options: SubscriptionOptions = {},
  deps: React.DependencyList = []
) {
  const {
    onError,
    onReconnect,
    maxRetries = 3,
    retryDelay = 2000,
  } = options;

  const channelRef = useRef<RealtimeChannel | null>(null);
  const isUnmountedRef = useRef(false);
  const retriesRef = useRef(0);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');

  useEffect(() => {
    isUnmountedRef.current = false;
    retriesRef.current = 0;

    const setupSubscription = () => {
      // Cleanup previous subscription if exists
      if (channelRef.current) {
        console.warn('[Subscription] Cleaning up previous subscription...');
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      // Create new subscription
      const channel = subscribe();

      if (!channel) {
        console.error('[Subscription] Failed to create channel');
        setStatus('error');
        return;
      }

      channelRef.current = channel;

      // Monitor subscription status
      channel.subscribe((status, err) => {
        if (isUnmountedRef.current) return;

        console.log('[Subscription] Status:', status);

        switch (status) {
          case REALTIME_SUBSCRIBE_STATES.SUBSCRIBED:
            setStatus('connected');
            retriesRef.current = 0; // Reset retries on successful connection
            if (onReconnect && retriesRef.current > 0) {
              onReconnect();
            }
            break;

          case REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR:
            console.error('[Subscription] Channel error:', err);
            setStatus('error');

            if (onError && err) {
              onError(new Error(err.message || 'Subscription error'));
            }

            // Attempt reconnection
            if (retriesRef.current < maxRetries) {
              retriesRef.current++;
              console.log(`[Subscription] Reconnecting... Attempt ${retriesRef.current}/${maxRetries}`);

              setTimeout(() => {
                if (!isUnmountedRef.current) {
                  setupSubscription();
                }
              }, retryDelay * retriesRef.current); // Exponential backoff
            }
            break;

          case REALTIME_SUBSCRIBE_STATES.TIMED_OUT:
            console.warn('[Subscription] Connection timed out');
            setStatus('error');

            // Retry on timeout
            if (retriesRef.current < maxRetries) {
              retriesRef.current++;
              setTimeout(() => {
                if (!isUnmountedRef.current) {
                  setupSubscription();
                }
              }, retryDelay);
            }
            break;

          case REALTIME_SUBSCRIBE_STATES.CLOSED:
            console.log('[Subscription] Connection closed');
            setStatus('disconnected');
            break;
        }
      });
    };

    setupSubscription();

    // Cleanup function
    return () => {
      isUnmountedRef.current = true;

      if (channelRef.current) {
        console.log('[Subscription] Unsubscribing...');
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { channelRef, status };
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
