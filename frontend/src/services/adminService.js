import api from './api';

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard').then((r) => r.data),
  getStudents: (params) => api.get('/admin/students', { params }).then((r) => r.data),
  getStudentDetails: (id) => api.get(`/admin/students/${id}`).then((r) => r.data),
  toggleStudentStatus: (id, isActive) =>
    api.patch(`/admin/students/${id}/status`, { isActive }).then((r) => r.data),
  getApplications: (params) => api.get('/admin/applications', { params }).then((r) => r.data),
  updateApplicationStatus: (id, payload) =>
    api.patch(`/admin/applications/${id}/status`, payload).then((r) => r.data),
  getAnnouncements: () => api.get('/admin/announcements').then((r) => r.data),
  createAnnouncement: (payload) => api.post('/admin/announcements', payload).then((r) => r.data),
  updateAnnouncement: (id, payload) =>
    api.put(`/admin/announcements/${id}`, payload).then((r) => r.data),
  deleteAnnouncement: (id) => api.delete(`/admin/announcements/${id}`).then((r) => r.data),
  exportCsv: async (status = 'All') => {
    const res = await api.get('/admin/reports/export-csv', {
      params: { status },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `aicte_applications_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  getSettings: () => api.get('/admin/settings').then((r) => r.data),
  updateSettings: (payload) => api.put('/admin/settings', payload).then((r) => r.data),
  getSupportTickets: () => api.get('/admin/support').then((r) => r.data),
  replySupportTicket: (id, payload) =>
    api.patch(`/admin/support/${id}`, payload).then((r) => r.data),
};
