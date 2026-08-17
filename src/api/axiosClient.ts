import axios from 'axios';
import { handleAutoLogout, isTokenExpired } from '../utils/auth';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      if (isTokenExpired(token)) {
        handleAutoLogout('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        return Promise.reject(new axios.Cancel('Token expired'));
      }
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      handleAutoLogout('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
