import api from '@/lib/axios';

export const categoriesApi = {
  listPublic: () => api.get('/categories/public').then((r) => r.data),
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`).then((r) => r.data),

  listAdmin: (params) => api.get('/categories', { params }).then((r) => r.data),
  create: (payload) => api.post('/categories', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/categories/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
};
