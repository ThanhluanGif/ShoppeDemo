import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor tự động gắn Token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xuất các hàm cơ bản để sử dụng tiện lợi
export const get = (url, config = {}) => api.get(url, config);
export const post = (url, data = {}, config = {}) => api.post(url, data, config);
export const put = (url, data = {}, config = {}) => api.put(url, data, config);
export const del = (url, config = {}) => api.delete(url, config);

export default api;
