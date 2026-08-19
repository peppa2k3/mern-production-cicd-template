import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import SEO from '@/components/common/SEO';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <SEO title="Không tìm thấy trang" />
      <span className="font-display text-7xl font-extrabold text-gradient-gold">404</span>
      <h1 className="mt-3 font-display text-xl font-semibold">Không tìm thấy trang</h1>
      <p className="mt-2 text-ink-500">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      <Button as={Link} to="/" className="mt-6">
        Về trang chủ
      </Button>
    </div>
  );
}
