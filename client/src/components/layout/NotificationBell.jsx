import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { getSocket } from '@/lib/socket';
import { useUnreadCount, useMyNotifications, useMarkNotificationRead } from '@/features/admin/hooks';
import { formatDate } from '@/lib/utils';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: unread, refetch: refetchUnread } = useUnreadCount();
  const { data: list } = useMyNotifications({ limit: 8 });
  const markRead = useMarkNotificationRead();

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket(accessToken);
    const handler = (notification) => {
      toast(notification.title, { icon: '🔔' });
      refetchUnread();
    };
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [accessToken, refetchUnread]);

  const count = unread?.data?.count || 0;
  const notifications = list?.data || [];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-ink-300 hover:bg-base-700 hover:text-ink-100"
        aria-label="Thông báo"
      >
        <Bell size={19} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-hot-500 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl2 border border-border bg-base-800 shadow-card">
            <div className="border-b border-border p-4 font-display text-sm font-semibold">Thông báo</div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="p-4 text-center text-sm text-ink-700">Không có thông báo</p>
              )}
              {notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => markRead.mutate(n._id)}
                  className="block w-full border-b border-border p-4 text-left last:border-0 hover:bg-base-700"
                >
                  <p className="text-sm font-medium text-ink-100">{n.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-500">{n.message}</p>
                  <p className="mt-1 text-[11px] text-ink-700">{formatDate(n.createdAt)}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
