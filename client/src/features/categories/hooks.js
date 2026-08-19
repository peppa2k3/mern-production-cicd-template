import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { categoriesApi } from './api';

export const useCategoriesPublic = () =>
  useQuery({ queryKey: ['categories', 'public'], queryFn: categoriesApi.listPublic });

export const useCategoriesAdmin = (params) =>
  useQuery({ queryKey: ['categories', 'admin', params], queryFn: () => categoriesApi.listAdmin(params) });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      toast.success('Đã tạo danh mục');
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => categoriesApi.update(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật danh mục');
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.remove,
    onSuccess: () => {
      toast.success('Đã xoá danh mục');
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};
