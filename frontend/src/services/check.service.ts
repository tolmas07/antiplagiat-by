import api from './api';

export const checkService = {
  async startCheck(documentId: string) {
    const response = await api.post('/checks/start', { documentId });
    return response.data;
  },

  async getCheckStatus(checkId: string) {
    const response = await api.get(`/checks/${checkId}/status`);
    return response.data;
  },

  async getCheckResult(checkId: string) {
    const response = await api.get(`/checks/${checkId}/result`);
    return response.data;
  },

  async getMyChecks() {
    const response = await api.get('/checks/my/history');
    return response.data;
  }
};
