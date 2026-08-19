import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from './api';

const onErr = (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra');

// --- Users ---
export const useUsers = (params) =>
  useQuery({ queryKey: ['users', params], queryFn: () => adminApi.listUsers(params) });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      toast.success('Đã tạo tài khoản');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: onErr,
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => adminApi.updateUser(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: onErr,
  });
};

export const useSetUserActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => adminApi.setUserActive(id, isActive),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: onErr,
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      toast.success('Đã xoá tài khoản');
      qc.invalidateQueries({ queryKey: ['users'] });
    },
    onError: onErr,
  });
};

// --- Roles ---
export const useRoles = () => useQuery({ queryKey: ['roles'], queryFn: adminApi.listRoles });
export const usePermissionsList = () =>
  useQuery({ queryKey: ['permissions'], queryFn: adminApi.listPermissions });

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.createRole,
    onSuccess: () => {
      toast.success('Đã tạo vai trò');
      qc.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: onErr,
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => adminApi.updateRole(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật vai trò');
      qc.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: onErr,
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteRole,
    onSuccess: () => {
      toast.success('Đã xoá vai trò');
      qc.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: onErr,
  });
};

// --- Notifications ---
export const useAdminNotifications = (params) =>
  useQuery({ queryKey: ['notifications', 'admin', params], queryFn: () => adminApi.listNotifications(params) });

export const useMyNotifications = (params) =>
  useQuery({ queryKey: ['notifications', 'me', params], queryFn: () => adminApi.myNotifications(params) });

export const useUnreadCount = () =>
  useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: adminApi.unreadCount,
    refetchInterval: 30000,
  });

export const useSendNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.sendNotification,
    onSuccess: () => {
      toast.success('Đã gửi thông báo');
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: onErr,
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

// --- Dashboard ---
export const useDashboardSummary = () =>
  useQuery({ queryKey: ['dashboard', 'summary'], queryFn: adminApi.dashboardSummary });

// --- Settings ---
export const useSettings = () => useQuery({ queryKey: ['settings'], queryFn: adminApi.getSettings });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateSettings,
    onSuccess: () => {
      toast.success('Đã lưu cấu hình');
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: onErr,
  });
};
