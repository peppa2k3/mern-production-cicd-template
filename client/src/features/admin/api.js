import api from '@/lib/axios';

export const adminApi = {
  // Users
  listUsers: (params) => api.get('/users', { params }).then((r) => r.data),
  createUser: (payload) => api.post('/users', payload).then((r) => r.data),
  updateUser: (id, payload) => api.patch(`/users/${id}`, payload).then((r) => r.data),
  setUserActive: (id, isActive) => api.patch(`/users/${id}/status`, { isActive }).then((r) => r.data),
  deleteUser: (id) => api.delete(`/users/${id}`).then((r) => r.data),

  // Roles
  listRoles: () => api.get('/roles').then((r) => r.data),
  listPermissions: () => api.get('/roles/permissions').then((r) => r.data),
  createRole: (payload) => api.post('/roles', payload).then((r) => r.data),
  updateRole: (id, payload) => api.patch(`/roles/${id}`, payload).then((r) => r.data),
  deleteRole: (id) => api.delete(`/roles/${id}`).then((r) => r.data),

  // Notifications
  listNotifications: (params) => api.get('/notifications', { params }).then((r) => r.data),
  sendNotification: (payload) => api.post('/notifications', payload).then((r) => r.data),
  myNotifications: (params) => api.get('/notifications/me', { params }).then((r) => r.data),
  unreadCount: () => api.get('/notifications/me/unread-count').then((r) => r.data),
  markNotificationRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),

  // Dashboard
  dashboardSummary: () => api.get('/dashboard/summary').then((r) => r.data),

  // Settings
  getSettings: () => api.get('/settings/public').then((r) => r.data),
  updateSettings: (payload) => api.patch('/settings', payload).then((r) => r.data),

  // Files
  uploadSingle: (file, onProgress) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post('/files/single', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
      })
      .then((r) => r.data);
  },
  uploadMultiple: (files, onProgress) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return api
      .post('/files/multiple', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
      })
      .then((r) => r.data);
  },
};
