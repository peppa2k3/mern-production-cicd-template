import api from '@/lib/axios';

export const kolApi = {
  listPublic: (params) => api.get('/kol/public', { params }).then((r) => r.data),
  getByRoute: (route) => api.get(`/kol/public/${route}`).then((r) => r.data),
  trackClick: (kolId, productId) =>
    api.post(`/kol/public/${kolId}/products/${productId}/click`).then((r) => r.data),

  getOwnProfile: () => api.get('/kol/me').then((r) => r.data),
  listAdmin: (params) => api.get('/kol', { params }).then((r) => r.data),
  create: (payload) => api.post('/kol', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/kol/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/kol/${id}`).then((r) => r.data),

  addProduct: (kolId, productId) => api.post(`/kol/${kolId}/products`, { productId }).then((r) => r.data),
  removeProduct: (kolId, productId) =>
    api.delete(`/kol/${kolId}/products/${productId}`).then((r) => r.data),
  setPin: (kolId, productId, isPinned) =>
    api.patch(`/kol/${kolId}/products/${productId}/pin`, { isPinned }).then((r) => r.data),
  reorder: (kolId, productIds) =>
    api.patch(`/kol/${kolId}/products/reorder`, { productIds }).then((r) => r.data),
};
