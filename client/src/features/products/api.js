import api from '@/lib/axios';

export const productsApi = {
  listPublic: (params) => api.get('/products/public', { params }).then((r) => r.data),
  featured: (limit = 8) => api.get('/products/public/featured', { params: { limit } }).then((r) => r.data),
  hot: (limit = 8) => api.get('/products/public/hot', { params: { limit } }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/products/public/slug/${slug}`).then((r) => r.data),
  trackClick: (id) => api.post(`/products/public/${id}/click`).then((r) => r.data),

  listAdmin: (params) => api.get('/products', { params }).then((r) => r.data),
  getById: (id) => api.get(`/products/${id}`).then((r) => r.data),
  create: (payload) => api.post('/products', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/products/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
};
