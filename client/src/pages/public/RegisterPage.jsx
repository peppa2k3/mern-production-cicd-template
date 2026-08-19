import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import SEO from '@/components/common/SEO';
import { Input, Field } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useRegister } from '@/features/auth/hooks';

const schema = z
  .object({
    name: z.string().min(2, 'Vui lòng nhập họ tên'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  const registerMutation = useRegister();

  if (registerMutation.isSuccess) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-14">
        <div className="w-full max-w-md rounded-xl2 border border-border bg-base-800 p-8 text-center shadow-card">
          <CheckCircle2 className="mx-auto text-teal-400" size={40} />
          <h1 className="mt-4 font-display text-xl font-bold">Đăng ký thành công!</h1>
          <p className="mt-2 text-sm text-ink-500">
            Đội ngũ quản trị viên sẽ xem xét và kích hoạt tài khoản KOL của bạn sớm nhất.
          </p>
          <Button as={Link} to="/login" className="mt-6">
            Về trang đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-14">
      <SEO title="Đăng ký cộng tác viên" description="Đăng ký trở thành KOL/cộng tác viên Affiliate." />
      <div className="w-full max-w-md rounded-xl2 border border-border bg-base-800 p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-500 text-base-900">
            <Sparkles size={22} />
          </span>
          <h1 className="mt-3 font-display text-xl font-bold">Đăng ký cộng tác viên</h1>
          <p className="mt-1 text-sm text-ink-500">Miễn phí — bắt đầu kiếm hoa hồng ngay hôm nay</p>
        </div>

        <form
          onSubmit={handleSubmit((v) => registerMutation.mutate(v))}
          className="space-y-4"
        >
          <Field label="Họ và tên" error={errors.name?.message}>
            <Input {...register('name')} placeholder="Nguyễn Văn A" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" {...register('email')} placeholder="ban@email.com" />
          </Field>
          <Field label="Số điện thoại" error={errors.phone?.message}>
            <Input {...register('phone')} placeholder="09xx xxx xxx" />
          </Field>
          <Field label="Mật khẩu" error={errors.password?.message}>
            <Input type="password" {...register('password')} placeholder="Tối thiểu 8 ký tự" />
          </Field>
          <Field label="Xác nhận mật khẩu" error={errors.confirmPassword?.message}>
            <Input type="password" {...register('confirmPassword')} placeholder="••••••••" />
          </Field>
          <Button type="submit" className="w-full" size="lg" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Đang gửi...' : 'Đăng ký'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-gold-400 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
