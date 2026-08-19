import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { kolApi } from './api';

export const useKolPublicList = (params) =>
  useQuery({ queryKey: ['kol', 'public', params], queryFn: () => kolApi.listPublic(params) });

export const useKolByRoute = (route) =>
  useQuery({ queryKey: ['kol', 'route', route], queryFn: () => kolApi.getByRoute(route), enabled: !!route });

export const useOwnKolProfile = () =>
  useQuery({ queryKey: ['kol', 'me'], queryFn: kolApi.getOwnProfile });

export const useKolAdminList = (params) =>
  useQuery({ queryKey: ['kol', 'admin', params], queryFn: () => kolApi.listAdmin(params) });

const invalidateKol = (qc) => qc.invalidateQueries({ queryKey: ['kol'] });

export const useCreateKol = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: kolApi.create,
    onSuccess: () => {
      toast.success('Đã tạo trang KOL');
      invalidateKol(qc);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};

export const useUpdateKol = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => kolApi.update(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật');
      invalidateKol(qc);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};

export const useDeleteKol = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: kolApi.remove,
    onSuccess: () => {
      toast.success('Đã xoá trang KOL');
      invalidateKol(qc);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};

export const useAddKolProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kolId, productId }) => kolApi.addProduct(kolId, productId),
    onSuccess: () => {
      toast.success('Đã thêm sản phẩm vào trang KOL');
      invalidateKol(qc);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};

export const useRemoveKolProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kolId, productId }) => kolApi.removeProduct(kolId, productId),
    onSuccess: () => {
      toast.success('Đã gỡ sản phẩm');
      invalidateKol(qc);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};

export const useSetKolProductPin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ kolId, productId, isPinned }) => kolApi.setPin(kolId, productId, isPinned),
    onSuccess: () => invalidateKol(qc),
    onError: (e) => toast.error(e.response?.data?.message || 'Có lỗi xảy ra'),
  });
};

export const useTrackKolClick = () =>
  useMutation({ mutationFn: ({ kolId, productId }) => kolApi.trackClick(kolId, productId) });
