import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

const navLinks = [
  { to: '/', label: 'Trang chủ' },
  { to: '/san-pham', label: 'Sản phẩm' },
  { to: '/kol', label: 'KOL' },
  { to: '/lien-he', label: 'Liên hệ' },
];

export default function PublicHeader() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-base-900/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500 text-base-900">
            <Sparkles size={18} />
          </span>
          <span>
            Affiliate<span className="text-gradient-gold">Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-gold-400' : 'text-ink-300 hover:text-ink-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button as={Link} to={user.role?.name === 'kol' ? '/kol-portal' : '/admin'} variant="secondary" size="sm">
              Vào trang quản trị
            </Button>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Đăng nhập
              </Button>
              <Button as={Link} to="/dang-ky-cong-tac-vien" variant="primary" size="sm">
                Đăng ký CTV
              </Button>
            </>
          )}
        </div>

        <button className="p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-base-800 md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-ink-300 hover:bg-base-700 hover:text-ink-100"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              {user ? (
                <Button as={Link} to={user.role?.name === 'kol' ? '/kol-portal' : '/admin'} variant="secondary" className="flex-1">
                  Trang quản trị
                </Button>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="secondary" className="flex-1">
                    Đăng nhập
                  </Button>
                  <Button as={Link} to="/dang-ky-cong-tac-vien" variant="primary" className="flex-1">
                    Đăng ký CTV
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
