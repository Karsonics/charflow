import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const charactersAPI = {
  getAll: (params) => api.get('/characters', { params }),
  getById: (id) => api.get(`/characters/${id}`),
  getMy: () => api.get('/characters/my'),
  create: (data) => api.post('/characters', data),
  update: (id, data) => api.put(`/characters/${id}`, data),
  delete: (id) => api.delete(`/characters/${id}`)
};

export const chatAPI = {
  start: (data) => api.post('/chat/start', data),
  sendMessage: (data) => api.post('/chat/message', data),
  getChat: (id) => api.get(`/chat/${id}`),
  getHistory: () => api.get('/chat/history'),
  delete: (id) => api.delete(`/chat/${id}`),
  rate: (data) => api.post('/chat/rate', data)
};

export const settingsAPI = {
  getLLM: () => api.get('/settings/llm'),
  updateLLM: (data) => api.post('/settings/llm', data)
};

export const modelsAPI = {
  getOpenRouter: () => api.get('/models/openrouter'),
  getOllama: () => api.get('/models/ollama')
};

export default api;