import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/features/auth/hooks';
import NotificationBell from './NotificationBell';

export default function AdminTopbar() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-base-800 px-5">
      <div>
        <p className="text-sm text-ink-500">Xin chào,</p>
        <p className="font-display text-sm font-semibold">{user?.name}</p>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-base-700"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-500/20 text-gold-400">
              <User size={14} />
            </span>
            <span className="hidden sm:inline">{user?.role?.displayName}</span>
            <ChevronDown size={14} />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-border bg-base-800 py-1.5 shadow-card">
                <Link
                  to="/admin/ho-so"
                  className="block px-4 py-2 text-sm text-ink-300 hover:bg-base-700 hover:text-ink-100"
                  onClick={() => setOpen(false)}
                >
                  Hồ sơ cá nhân
                </Link>
                <button
                  onClick={() => logout.mutate()}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-hot-500 hover:bg-base-700"
                >
                  <LogOut size={14} /> Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
