import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin } from 'lucide-react';
import SEO from '@/components/common/SEO';
import { Input, Textarea, Field } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useSubmitContact } from '@/features/contact/hooks';
import { useSettings } from '@/features/admin/hooks';

const schema = z.object({
  name: z.string().min(2, 'Vui lòng nhập họ tên'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5, 'Nội dung quá ngắn'),
});

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  const submitContact = useSubmitContact();
  const { data } = useSettings();
  const settings = data?.data || {};

  const onSubmit = (values) => {
    submitContact.mutate(values, { onSuccess: () => reset() });
  };

  return (
    <div className="container-page py-14">
      <SEO title="Liên hệ" description="Liên hệ với AffiliateHub để được hỗ trợ." />

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h1 className="font-display text-3xl font-bold">Liên hệ với chúng tôi</h1>
          <p className="mt-2 text-ink-500">
            Có câu hỏi về hợp tác Affiliate, KOL hay hỗ trợ kỹ thuật? Gửi cho chúng tôi lời nhắn.
          </p>

          <div className="mt-8 space-y-4 text-sm">
            <p className="flex items-center gap-3 text-ink-300">
              <Mail size={17} className="text-gold-400" /> {settings.contactEmail || 'contact@affiliatehub.vn'}
            </p>
            <p className="flex items-center gap-3 text-ink-300">
              <Phone size={17} className="text-gold-400" /> {settings.contactPhone || '1900 1234'}
            </p>
            <p className="flex items-center gap-3 text-ink-300">
              <MapPin size={17} className="text-gold-400" /> {settings.address || 'TP. Hồ Chí Minh, Việt Nam'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Họ tên" error={errors.name?.message}>
              <Input {...register('name')} placeholder="Nguyễn Văn A" />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input {...register('email')} placeholder="ban@email.com" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Số điện thoại" error={errors.phone?.message}>
              <Input {...register('phone')} placeholder="09xx xxx xxx" />
            </Field>
            <Field label="Chủ đề" error={errors.subject?.message}>
              <Input {...register('subject')} placeholder="Hợp tác Affiliate" />
            </Field>
          </div>
          <Field label="Nội dung" error={errors.message?.message}>
            <Textarea {...register('message')} placeholder="Nội dung liên hệ..." />
          </Field>
          <Button type="submit" size="lg" disabled={submitContact.isPending}>
            {submitContact.isPending ? 'Đang gửi...' : 'Gửi liên hệ'}
          </Button>
        </form>
      </div>
    </div>
  );
}
