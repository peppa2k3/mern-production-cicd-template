import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SEO from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import { Input, Textarea, Field } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { useSettings, useUpdateSettings } from '@/features/admin/hooks';

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (data?.data) reset(data.data);
  }, [data, reset]);

  const onSubmit = (values) => updateSettings.mutate(values);

  if (isLoading) return null;

  return (
    <div>
      <SEO title="Cài đặt hệ thống" />
      <h1 className="font-display text-2xl font-bold">Cài đặt hệ thống</h1>

      <Card className="mt-6 max-w-2xl">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Mô tả công ty (hiển thị ở footer)">
              <Textarea {...register('companyDescription')} placeholder="Nền tảng Affiliate & KOL..." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email liên hệ">
                <Input {...register('contactEmail')} placeholder="contact@affiliatehub.vn" />
              </Field>
              <Field label="Số điện thoại">
                <Input {...register('contactPhone')} placeholder="1900 1234" />
              </Field>
            </div>
            <Field label="Địa chỉ">
              <Input {...register('address')} placeholder="TP. Hồ Chí Minh, Việt Nam" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Facebook">
                <Input {...register('facebook')} placeholder="https://facebook.com/..." />
              </Field>
              <Field label="TikTok">
                <Input {...register('tiktok')} placeholder="https://tiktok.com/@..." />
              </Field>
            </div>
            <Button type="submit" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? 'Đang lưu...' : 'Lưu cấu hình'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
