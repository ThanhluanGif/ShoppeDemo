import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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

// Interceptor xử lý lỗi tập trung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại';
    
    // Chỉ hiển thị toast cho các lỗi thực sự (không phải do user cancel request hoặc auto-checks)
    if (error.response?.status !== 401) {
       toast.error(message);
    } else {
       // Xử lý khi token hết hạn (401)
       // localStorage.removeItem('token');
       // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Xuất các hàm cơ bản để sử dụng tiện lợi
export const get = (url, config = {}) => api.get(url, config);
export const post = (url, data = {}, config = {}) => api.post(url, data, config);
export const put = (url, data = {}, config = {}) => api.put(url, data, config);
export const del = (url, config = {}) => api.delete(url, config);

export default api;
