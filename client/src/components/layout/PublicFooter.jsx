import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, Sparkles } from 'lucide-react';
import { useSettings } from '@/features/admin/hooks';

export default function PublicFooter() {
  const { data } = useSettings();
  const settings = data?.data || {};
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-base-800/50">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500 text-base-900">
              <Sparkles size={18} />
            </span>
            Affiliate<span className="text-gradient-gold">Hub</span>
          </Link>
          <p className="mt-3 text-sm text-ink-500">
            {settings.companyDescription ||
              'Nền tảng Affiliate & KOL giúp doanh nghiệp và cộng tác viên cùng phát triển doanh thu.'}
          </p>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-ink-100">Liên kết</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li><Link to="/san-pham" className="hover:text-gold-400">Sản phẩm</Link></li>
            <li><Link to="/kol" className="hover:text-gold-400">Danh sách KOL</Link></li>
            <li><Link to="/dang-ky-cong-tac-vien" className="hover:text-gold-400">Đăng ký cộng tác viên</Link></li>
            <li><Link to="/lien-he" className="hover:text-gold-400">Liên hệ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-ink-100">Liên hệ</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li className="flex items-center gap-2">
              <Mail size={14} /> {settings.contactEmail || 'contact@affiliatehub.vn'}
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} /> {settings.contactPhone || '1900 1234'}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold text-ink-100">Kết nối</h4>
          <div className="mt-3 flex gap-2">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-500 transition-colors hover:border-gold-500 hover:text-gold-400"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-ink-700">
        © {year} AffiliateHub. All rights reserved.
      </div>
    </footer>
  );
}
