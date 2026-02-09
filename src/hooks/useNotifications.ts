import { useEffect, useState, useCallback } from 'react';
// import { supabase } from '@/lib/supabase'; // Temporariamente desabilitado
// import { useAuthStore } from '@/store/authStore'; // Temporariamente desabilitado
// import { useToast } from '@/hooks/useToast'; // Temporariamente desabilitado
// import { useSupabaseSubscription } from '@/hooks/useSupabaseSubscription'; // Temporariamente desabilitado

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
  // const { user } = useAuthStore(); // Temporariamente desabilitado
  // const { toast } = useToast(); // Temporariamente desabilitado
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

  // Callback to handle ticket changes - TEMPORARIAMENTE DESABILITADO
  /*
  const handleTicketChange = useCallback((payload: any) => {
    try {
      if (payload.eventType === 'INSERT') {
        const notification = {
          title: 'Novo Ticket',
          message: `Um novo ticket foi criado: ${payload.new.title}`,
          type: 'info' as const,
          ticket_id: payload.new.id,
          link: `/tickets/${payload.new.id}`,
        };
        addNotificationWithToast(notification);
      } else if (payload.eventType === 'UPDATE') {
        // Only notify about status changes
        if (payload.old.status !== payload.new.status) {
          const notification = {
            title: 'Status Atualizado',
            message: `Ticket "${payload.new.title}" mudou para ${getStatusLabel(payload.new.status)}`,
            type: 'success' as const,
            ticket_id: payload.new.id,
            link: `/tickets/${payload.new.id}`,
          };
          addNotificationWithToast(notification);
        }
      }
    } catch (error) {
      console.error('Error processing ticket notification:', error);
    }
  }, []);

  // Callback to handle message changes
  const handleMessageChange = useCallback(async (payload: any) => {
    try {
      // Don't notify about own messages
      if (!user || payload.new.user_id === user.id) return;

      // Fetch ticket info
      const { data: ticket } = await supabase
        .from('tickets')
        .select('title, protocol')
        .eq('id', payload.new.ticket_id)
        .single();

      if (ticket) {
        const notification = {
          title: 'Nova Mensagem',
          message: `Nova mensagem no ticket "${ticket.title}"`,
          type: 'info' as const,
          ticket_id: payload.new.ticket_id,
          link: `/tickets/${payload.new.ticket_id}`,
        };
        addNotificationWithToast(notification);
      }
    } catch (error) {
      console.error('Error processing message notification:', error);
    }
  }, [user]);
  */

  // Subscribe to ticket changes with improved error handling
  // TEMPORARIAMENTE DESABILITADO devido a erro de "mismatch between server and client bindings"
  /*
  useSupabaseSubscription(
    () => {
      if (!user) return null;

      return supabase
        .channel('ticket-notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tickets',
          },
          handleTicketChange
        );
    },
    {
      onError: (error) => {
        console.error('Ticket subscription error:', error);
        toast({
          title: 'Erro de Conexão',
          description: 'Falha ao conectar com notificações de tickets',
          variant: 'destructive',
        });
      },
      onReconnect: () => {
        toast({
          title: 'Reconectado',
          description: 'Notificações de tickets reconectadas',
        });
      },
    },
    [user, handleTicketChange]
  );

  // Subscribe to message changes with improved error handling
  useSupabaseSubscription(
    () => {
      if (!user) return null;

      return supabase
        .channel('message-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          handleMessageChange
        );
    },
    {
      onError: (error) => {
        console.error('Message subscription error:', error);
      },
    },
    [user, handleMessageChange]
  );
  */

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

    return newNotification;
  }, []);

  // Add notification and show toast - TEMPORARIAMENTE DESABILITADO
  /*
  const addNotificationWithToast = useCallback((notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    const newNotification = addNotification(notification);

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'error' ? 'destructive' : 'default',
    });

    return newNotification;
  }, [addNotification, toast]);
  */

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

// TEMPORARIAMENTE DESABILITADO
/*
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: 'Aberto',
    in_progress: 'Em Andamento',
    resolved: 'Resolvido',
    closed: 'Fechado',
  };
  return labels[status] || status;
}
*/

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
