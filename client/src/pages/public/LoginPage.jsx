import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import SEO from '@/components/common/SEO';
import { Input, Field } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useLogin } from '@/features/auth/hooks';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const login = useLogin();

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-14">
      <SEO title="Đăng nhập" />
      <div className="w-full max-w-md rounded-xl2 border border-border bg-base-800 p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500 text-base-900">
            <Sparkles size={22} />
          </span>
          <h1 className="mt-3 font-display text-xl font-bold">Đăng nhập quản trị</h1>
          <p className="mt-1 text-sm text-ink-500">Dành cho Admin, Nhân viên và KOL</p>
        </div>

        <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-4">
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register('email')} placeholder="ban@email.com" />
          </Field>
          <Field label="Mật khẩu" error={errors.password?.message}>
            <Input type="password" {...register('password')} placeholder="••••••••" />
          </Field>
          <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
            {login.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Chưa có tài khoản KOL?{' '}
          <Link to="/dang-ky-cong-tac-vien" className="text-gold-400 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
