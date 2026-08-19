import api from '@/lib/axios';

export const contactApi = {
  submit: (payload) => api.post('/contacts', payload).then((r) => r.data),
  listAdmin: (params) => api.get('/contacts', { params }).then((r) => r.data),
  update: (id, payload) => api.patch(`/contacts/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/contacts/${id}`).then((r) => r.data),
};
