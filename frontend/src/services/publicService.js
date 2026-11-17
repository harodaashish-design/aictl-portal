import api from './api';

export const publicService = {
  getHomepageData: () => api.get('/public/homepage').then((r) => r.data),
  getInstitutions: (params) => api.get('/public/institutions', { params }).then((r) => r.data),
  searchPortal: (q) => api.get('/public/search', { params: { q } }).then((r) => r.data),
  submitSupportQuery: (payload) => api.post('/public/support-query', payload).then((r) => r.data),
  getDocumentDownloadUrl: (slug) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${base}/public/documents/${slug}/download`;
  },
};
