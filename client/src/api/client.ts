import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('gpkarta_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear token and redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gpkarta_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
