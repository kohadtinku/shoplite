import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shoplite_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper: turn any axios error into a readable message
export const errMsg = (err) => {
  const d = err?.response?.data;
  if (d?.errors?.length) return d.errors.map((e) => e.message).join(', ');
  return d?.message || err.message || 'Something went wrong';
};

export const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default api;
