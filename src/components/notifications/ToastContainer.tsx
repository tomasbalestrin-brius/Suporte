import { useState, useEffect } from 'react';
import { ToastNotification } from './ToastNotification';
import { useNotifications } from '@/hooks/useNotifications';

export function ToastContainer() {
  const { notifications, markAsRead } = useNotifications();
  const [activeToasts, setActiveToasts] = useState<string[]>([]);

  useEffect(() => {
    // Show unread notifications as toasts
    const unreadNotifications = notifications.filter(n => !n.read);

    // Add new notifications to active toasts
    unreadNotifications.forEach(notification => {
      if (!activeToasts.includes(notification.id)) {
        setActiveToasts(prev => [...prev, notification.id]);
      }
    });
  }, [notifications]);

  const handleClose = (id: string) => {
    setActiveToasts(prev => prev.filter(toastId => toastId !== id));
  };

  const handleRead = (id: string) => {
    markAsRead(id);
  };

  const activeNotifications = notifications.filter(n => activeToasts.includes(n.id));

  if (activeNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {activeNotifications.slice(0, 3).map(notification => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onClose={() => handleClose(notification.id)}
            onRead={() => handleRead(notification.id)}
          />
        ))}
      </div>
    </div>
  );
}
