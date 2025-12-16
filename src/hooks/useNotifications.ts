import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  ticket_id?: string;
  link?: string;
}

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
      setUnreadCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications]);

  // Subscribe to ticket changes
  useEffect(() => {
    if (!user) return;

    let channel: any;
    let messagesChannel: any;

    try {
      // Subscribe to all ticket updates
      channel = supabase
        .channel('ticket-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tickets',
          },
          (payload) => {
            try {
              if (payload.eventType === 'INSERT') {
                addNotification({
                  title: 'Novo Ticket',
                  message: `Um novo ticket foi criado: ${payload.new.title}`,
                  type: 'info',
                  ticket_id: payload.new.id,
                  link: `/tickets/${payload.new.id}`,
                });
              } else if (payload.eventType === 'UPDATE') {
                // Only notify about status changes
                if (payload.old.status !== payload.new.status) {
                  addNotification({
                    title: 'Status Atualizado',
                    message: `Ticket "${payload.new.title}" mudou para ${getStatusLabel(payload.new.status)}`,
                    type: 'success',
                    ticket_id: payload.new.id,
                    link: `/tickets/${payload.new.id}`,
                  });
                }
              }
            } catch (error) {
              console.error('Error processing ticket notification:', error);
            }
          }
        )
        .subscribe();

      // Subscribe to new messages
      messagesChannel = supabase
        .channel('message-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          async (payload) => {
            try {
              // Don't notify about own messages
              if (payload.new.user_id === user.id) return;

              // Fetch ticket info
              const { data: ticket } = await supabase
                .from('tickets')
                .select('title, protocol')
                .eq('id', payload.new.ticket_id)
                .single();

              if (ticket) {
                addNotification({
                  title: 'Nova Mensagem',
                  message: `Nova mensagem no ticket "${ticket.title}"`,
                  type: 'info',
                  ticket_id: payload.new.ticket_id,
                  link: `/tickets/${payload.new.ticket_id}`,
                });
              }
            } catch (error) {
              console.error('Error processing message notification:', error);
            }
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error setting up notification channels:', error);
    }

    return () => {
      try {
        if (channel) channel.unsubscribe();
        if (messagesChannel) messagesChannel.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing channels:', error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      created_at: new Date().toISOString(),
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep only last 50

    // Play sound if enabled
    const soundEnabled = localStorage.getItem('notifications-sound') !== 'false';
    if (soundEnabled) {
      playNotificationSound();
    }

    // Show desktop notification if enabled and permitted
    const desktopEnabled = localStorage.getItem('notifications-desktop') === 'true';
    if (desktopEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        tag: newNotification.id,
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  }, []);

  const requestDesktopPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem('notifications-desktop', 'true');
        return true;
      }
    }
    return false;
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
    requestDesktopPermission,
  };
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: 'Aberto',
    in_progress: 'Em Andamento',
    resolved: 'Resolvido',
    closed: 'Fechado',
  };
  return labels[status] || status;
}

function playNotificationSound() {
  try {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    // Silently fail if audio not supported
  }
}
