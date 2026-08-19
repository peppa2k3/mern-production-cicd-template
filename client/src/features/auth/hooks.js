import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from './api';
import { useAuthStore } from '@/store/authStore';

export const useLogin = () => {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      setSession({ user: data.user, accessToken: data.accessToken });
      toast.success('Đăng nhập thành công');
      const role = data.user.role?.name;
      navigate(role === 'kol' ? '/kol-portal' : '/admin', { replace: true });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Đăng nhập thất bại'),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => toast.success('Đăng ký thành công! Vui lòng chờ quản trị viên duyệt tài khoản.'),
    onError: (e) => toast.error(e.response?.data?.message || 'Đăng ký thất bại'),
  });
};

export const useLogout = () => {
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearSession();
      navigate('/login', { replace: true });
    },
    onError: () => {
      clearSession();
      navigate('/login', { replace: true });
    },
  });
};
