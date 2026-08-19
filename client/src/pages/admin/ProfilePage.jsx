import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SEO from '@/components/common/SEO';
import Button from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/features/auth/api';
import api from '@/lib/axios';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setSession = useAuthStore((s) => s.setSession);

  const profileForm = useForm({ defaultValues: { name: user?.name, phone: user?.phone } });
  const passwordForm = useForm();

  const onSaveProfile = async (values) => {
    try {
      const { data } = await api.patch('/users/me', values);
      setSession({ user: data.data, accessToken });
      toast.success('Đã cập nhật hồ sơ');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const onChangePassword = (values) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    authApi
      .changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword })
      .then(() => {
        passwordForm.reset();
        toast.success('Đổi mật khẩu thành công, vui lòng đăng nhập lại');
      })
      .catch((e) => toast.error(e.response?.data?.message || 'Đổi mật khẩu thất bại'));
  };

  return (
    <div className="max-w-2xl">
      <SEO title="Hồ sơ cá nhân" />
      <h1 className="font-display text-2xl font-bold">Hồ sơ cá nhân</h1>

      <Card className="mt-6">
        <CardBody>
          <h2 className="font-display font-semibold">Thông tin cá nhân</h2>
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="mt-4 space-y-4">
            <Field label="Họ tên">
              <Input {...profileForm.register('name')} />
            </Field>
            <Field label="Số điện thoại">
              <Input {...profileForm.register('phone')} />
            </Field>
            <Field label="Email">
              <Input value={user?.email} disabled />
            </Field>
            <Button type="submit">Lưu thay đổi</Button>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardBody>
          <h2 className="font-display font-semibold">Đổi mật khẩu</h2>
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="mt-4 space-y-4">
            <Field label="Mật khẩu hiện tại">
              <Input type="password" {...passwordForm.register('currentPassword', { required: true })} />
            </Field>
            <Field label="Mật khẩu mới">
              <Input type="password" {...passwordForm.register('newPassword', { required: true })} />
            </Field>
            <Field label="Xác nhận mật khẩu mới">
              <Input type="password" {...passwordForm.register('confirmPassword', { required: true })} />
            </Field>
            <Button type="submit" variant="secondary">Đổi mật khẩu</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
