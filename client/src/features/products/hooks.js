import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productsApi } from './api';

export const useProductsPublic = (params) =>
  useQuery({
    queryKey: ['products', 'public', params],
    queryFn: () => productsApi.listPublic(params),
    placeholderData: (prev) => prev,
  });

export const useFeaturedProducts = (limit) =>
  useQuery({ queryKey: ['products', 'featured', limit], queryFn: () => productsApi.featured(limit) });

export const useHotProducts = (limit) =>
  useQuery({ queryKey: ['products', 'hot', limit], queryFn: () => productsApi.hot(limit) });

export const useProductBySlug = (slug) =>
  useQuery({
    queryKey: ['products', 'slug', slug],
    queryFn: () => productsApi.getBySlug(slug),
    enabled: !!slug,
  });

export const useProductsAdmin = (params) =>
  useQuery({ queryKey: ['products', 'admin', params], queryFn: () => productsApi.listAdmin(params) });

export const useProductAdmin = (id) =>
  useQuery({ queryKey: ['products', 'admin', id], queryFn: () => productsApi.getById(id), enabled: !!id });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      toast.success('Đã tạo sản phẩm');
      qc.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => productsApi.update(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật sản phẩm');
      qc.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => {
      toast.success('Đã xoá sản phẩm');
      qc.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};

export const useTrackClick = () => useMutation({ mutationFn: productsApi.trackClick });
