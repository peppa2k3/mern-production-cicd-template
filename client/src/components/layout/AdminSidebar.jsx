import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users2,
  ShieldCheck,
  Bell,
  Mail,
  Settings,
  Sparkles,
  Star,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { can, PERMISSIONS } from '@/lib/permissions';
import { cn } from '@/lib/utils';

const items = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutDashboard, perm: PERMISSIONS.DASHBOARD_VIEW, end: true },
  { to: '/kol-portal', label: 'Trang KOL của tôi', icon: Star, perm: PERMISSIONS.KOL_MANAGE_OWN },
  { to: '/admin/san-pham', label: 'Sản phẩm', icon: Package, perm: PERMISSIONS.PRODUCT_READ },
  { to: '/admin/danh-muc', label: 'Danh mục', icon: FolderTree, perm: PERMISSIONS.CATEGORY_MANAGE },
  { to: '/admin/kol', label: 'Quản lý KOL', icon: Star, perm: PERMISSIONS.KOL_MANAGE },
  { to: '/admin/nguoi-dung', label: 'Người dùng', icon: Users2, perm: PERMISSIONS.USER_MANAGE },
  { to: '/admin/vai-tro', label: 'Vai trò & Quyền', icon: ShieldCheck, perm: PERMISSIONS.ROLE_MANAGE },
  { to: '/admin/thong-bao', label: 'Thông báo', icon: Bell, perm: PERMISSIONS.NOTIFICATION_SEND },
  { to: '/admin/lien-he', label: 'Liên hệ', icon: Mail, perm: PERMISSIONS.CONTACT_MANAGE },
  { to: '/admin/cai-dat', label: 'Cài đặt', icon: Settings, perm: PERMISSIONS.SETTINGS_MANAGE },
];

export default function AdminSidebar() {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-base-800 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5 font-display text-lg font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500 text-base-900">
          <Sparkles size={18} />
        </span>
        Admin Panel
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items
          .filter((item) => can(user, item.perm))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                    : 'text-ink-300 hover:bg-base-700 hover:text-ink-100'
                )
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
