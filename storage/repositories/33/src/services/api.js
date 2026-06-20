import axios from 'axios';

const API_BASE_URL = 'https://back.coodhuub.ir:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getUserInfo: () => api.get('/auth/user-info'),
};

export const repoService = {
    getAll: () => api.get('/repo/getAll'),
    getUser: () => api.get('/repo'),
    getOne: (repoName) => api.get(`/repo/${repoName}`),
    create: (data) => api.post('/repo', data),
    update: (data) => api.put('/repo', data),
    delete: (data) => api.delete('/repo', { data }),
};

export const fileService = {
    getFiles: (repoId) => api.get(`/file/${repoId}/files`),
    getContent: (repoId, fileId) => api.get(`/file/${repoId}/files/${fileId}/content`),
    downloadFile: (repoId, fileId) => api.get(`/file/${repoId}/files/${fileId}/download`, { responseType: 'blob' }),
    uploadFiles: (repoId, formData) => api.post(`/file/${repoId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    importZip: (repoId, formData) => api.post(`/file/${repoId}/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export default api;
