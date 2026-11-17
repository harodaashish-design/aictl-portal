import api from './api';

export const studentService = {
  getDashboard: () => api.get('/student/dashboard').then((r) => r.data),
  getProfile: () => api.get('/student/profile').then((r) => r.data),
  updateProfile: (payload) => api.put('/student/profile', payload).then((r) => r.data),
  uploadProfilePhoto: (file) => {
    const fd = new FormData();
    fd.append('photo', file);
    return api
      .post('/student/profile/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  getSupportTickets: () => api.get('/student/support').then((r) => r.data),
  createSupportTicket: (payload) => api.post('/student/support', payload).then((r) => r.data),
};

export const applicationService = {
  createApplication: (payload) => api.post('/applications', payload).then((r) => r.data),
  getMyApplications: (params) => api.get('/applications/my', { params }).then((r) => r.data),
  getApplicationById: (id) => api.get(`/applications/${id}`).then((r) => r.data),
  updateDraft: (id, payload) => api.put(`/applications/${id}`, payload).then((r) => r.data),
  submitDraft: (id) => api.post(`/applications/${id}/submit`).then((r) => r.data),
  deleteDraft: (id) => api.delete(`/applications/${id}`).then((r) => r.data),
  uploadDocument: (applicationId, file, docType) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('docType', docType);
    return api
      .post(`/applications/${applicationId}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
  deleteDocument: (applicationId, filename) =>
    api.delete(`/applications/${applicationId}/documents/${filename}`).then((r) => r.data),
  getMyDocuments: () => api.get('/applications/documents/my').then((r) => r.data),
  getDocumentAccessUrl: (applicationId, filename, download = false) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token =
      localStorage.getItem('aicte_token') || sessionStorage.getItem('aicte_token') || '';
    const dl = download ? '&download=true' : '';
    return `${base}/applications/${applicationId}/documents/${filename}?token=${encodeURIComponent(
      token
    )}${dl}`;
  },
};

export const notificationService = {
  getNotifications: () => api.get('/notifications').then((r) => r.data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.put('/notifications/read-all').then((r) => r.data),
};
