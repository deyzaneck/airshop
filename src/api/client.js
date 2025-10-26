import axios from 'axios';

// Базовый URL бэкенда
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Создание axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд
});

// Interceptor для добавления JWT токена к запросам
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек или невалиден - выход из админки
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('admin_user');

      // Перенаправляем только если мы на админской странице
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
