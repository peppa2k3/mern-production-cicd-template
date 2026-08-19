import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { contactApi } from './api';

export const useSubmitContact = () =>
  useMutation({
    mutationFn: contactApi.submit,
    onSuccess: () => toast.success('Đã gửi liên hệ! Chúng tôi sẽ phản hồi sớm.'),
    onError: (e) => toast.error(e.response?.data?.message || 'Gửi liên hệ thất bại'),
  });

export const useContactsAdmin = (params) =>
  useQuery({ queryKey: ['contacts', 'admin', params], queryFn: () => contactApi.listAdmin(params) });

export const useUpdateContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => contactApi.update(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật');
      qc.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};

export const useDeleteContact = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: contactApi.remove,
    onSuccess: () => {
      toast.success('Đã xoá');
      qc.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};
