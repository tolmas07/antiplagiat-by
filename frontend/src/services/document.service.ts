import api from './api';

export const documentService = {
  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getDocument(id: string) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  async getMyDocuments() {
    const response = await api.get('/documents/my');
    return response.data;
  },

  async deleteDocument(id: string) {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }
};
