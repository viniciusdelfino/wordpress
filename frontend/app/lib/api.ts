import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost:8080/moove/backend/wp-json',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  return config;
});

export default api;