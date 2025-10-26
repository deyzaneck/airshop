# Frontend Integration Guide

Руководство по подключению React фронтенда к Flask бэкенду.

## Обзор изменений

Текущая версия фронтенда использует `localStorage` для хранения данных. Для подключения к бэкенду необходимо:

1. Создать API клиент для общения с бэкендом
2. Заменить localStorage вызовы на API запросы
3. Добавить управление JWT токенами
4. Обновить обработку ошибок

## Шаг 1: Установка зависимостей

```bash
cd airshop-fixed
npm install axios
```

## Шаг 2: Создание API клиента

Создайте файл `src/api/client.js`:

```javascript
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
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## Шаг 3: Создание API сервисов

Создайте `src/api/services.js`:

```javascript
import apiClient from './client';

// ============= AUTHENTICATION =============

export const authAPI = {
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    // Сохраняем токен
    if (response.data.access_token) {
      localStorage.setItem('jwt_token', response.data.access_token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  verify: async () => {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('admin_user');
  },
};

// ============= PRODUCTS =============

export const productsAPI = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data.products;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.product;
  },

  create: async (productData) => {
    const response = await apiClient.post('/products', productData);
    return response.data.product;
  },

  update: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data.product;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  bulkCreate: async (products) => {
    const response = await apiClient.post('/products/bulk', { products });
    return response.data;
  },
};

// ============= ORDERS =============

export const ordersAPI = {
  create: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data.order;
  },

  getAll: async (params = {}) => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data.order;
  },

  getByNumber: async (orderNumber) => {
    const response = await apiClient.get(`/orders/by-number/${orderNumber}`);
    return response.data.order;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data.order;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/orders/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/orders/stats');
    return response.data;
  },
};

// ============= PAYMENT =============

export const paymentAPI = {
  create: async (orderNumber, amount, paymentMethod) => {
    const response = await apiClient.post('/payment/create', {
      orderNumber,
      amount,
      paymentMethod,
      returnUrl: window.location.origin + '/payment/success'
    });
    return response.data;
  },

  getStatus: async (paymentId) => {
    const response = await apiClient.get(`/payment/status/${paymentId}`);
    return response.data;
  },

  refund: async (paymentId, amount = null) => {
    const response = await apiClient.post('/payment/refund', { payment_id: paymentId, amount });
    return response.data;
  },
};

// ============= SETTINGS =============

export const settingsAPI = {
  get: async () => {
    const response = await apiClient.get('/settings');
    return response.data.settings;
  },

  update: async (settings) => {
    const response = await apiClient.put('/settings', { settings });
    return response.data.settings;
  },

  updateHero: async (heroData) => {
    const response = await apiClient.put('/settings/hero', heroData);
    return response.data.hero;
  },

  updateContact: async (contactData) => {
    const response = await apiClient.put('/settings/contact', contactData);
    return response.data.contact;
  },

  reset: async () => {
    const response = await apiClient.post('/settings/reset');
    return response.data.settings;
  },
};
```

## Шаг 4: Обновление переменных окружения

Создайте `.env` в корне фронтенда:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Для production:
```env
REACT_APP_API_URL=https://api.airshop.ru/api
```

## Шаг 5: Миграция существующих данных

Создайте скрипт для миграции данных из localStorage в бэкенд:

`src/utils/migrateData.js`:

```javascript
import { productsAPI, settingsAPI } from '../api/services';

export const migrateProductsToBackend = async () => {
  try {
    // Получаем товары из localStorage
    const localProducts = JSON.parse(localStorage.getItem('products') || '[]');

    if (localProducts.length === 0) {
      console.log('No products to migrate');
      return;
    }

    console.log(`Migrating ${localProducts.length} products to backend...`);

    // Массовое создание товаров
    const result = await productsAPI.bulkCreate(localProducts);
    console.log(`✓ Migrated ${result.created} products`);

    return result;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

export const migrateSettingsToBackend = async () => {
  try {
    // Получаем настройки из localStorage
    const localSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');

    if (Object.keys(localSettings).length === 0) {
      console.log('No settings to migrate');
      return;
    }

    console.log('Migrating settings to backend...');

    // Обновление настроек
    const result = await settingsAPI.update(localSettings);
    console.log('✓ Settings migrated');

    return result;
  } catch (error) {
    console.error('Settings migration failed:', error);
    throw error;
  }
};
```

## Шаг 6: Обновление компонентов

### 6.1. Catalog.jsx

Замените использование `products` из `src/data/products.js` на API:

```javascript
import { useState, useEffect } from 'react';
import { productsAPI } from '../api/services';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll({ visible: true });
      setProducts(data);
    } catch (err) {
      setError('Не удалось загрузить товары');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  // остальной код компонента...
};
```

### 6.2. Checkout.jsx

Замените создание заказа:

```javascript
import { ordersAPI, paymentAPI } from '../api/services';

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const orderNumber = generateOrderNumber();

    // Подготовка данных заказа
    const orderData = {
      orderNumber: orderNumber,
      customer: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        telegram: formData.telegram
      },
      delivery: {
        address: formData.address,
        city: formData.city,
        zipcode: formData.zipCode
      },
      comment: formData.comment,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      paymentMethod: paymentMethod
    };

    // Создание заказа на бэкенде
    const order = await ordersAPI.create(orderData);

    // Если оплата наличными
    if (paymentMethod === 'cash') {
      clearCart();
      window.dispatchEvent(new Event('cartUpdated'));
      setOrderComplete(true);
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    // Создание платежа через ЮКассу
    const payment = await paymentAPI.create(
      orderNumber,
      total,
      paymentMethod === 'sbp' ? 'sbp' : 'bank_card'
    );

    if (payment.success) {
      // Перенаправление на страницу оплаты
      window.location.href = payment.confirmation_url;
    } else {
      alert(`Ошибка создания платежа: ${payment.error}`);
    }

  } catch (error) {
    console.error('Ошибка оформления заказа:', error);
    alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
  } finally {
    setIsSubmitting(false);
  }
};
```

### 6.3. Admin.jsx

Обновите все операции CRUD:

```javascript
import { productsAPI, ordersAPI, settingsAPI } from '../api/services';

// Загрузка товаров
useEffect(() => {
  const loadData = async () => {
    try {
      const [productsData, ordersData, settingsData] = await Promise.all([
        productsAPI.getAll({ visible: false }), // Получаем все товары, включая скрытые
        ordersAPI.getAll(),
        settingsAPI.get()
      ]);

      setProducts(productsData);
      setOrders(ordersData.orders);
      setSiteSettings(settingsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Ошибка загрузки данных');
    }
  };

  loadData();
}, []);

// Создание товара
const handleAddProduct = async () => {
  try {
    const newProduct = await productsAPI.create(currentProduct);
    setProducts([...products, newProduct]);
    setShowProductModal(false);
    setCurrentProduct(defaultProduct);
  } catch (error) {
    console.error('Failed to create product:', error);
    alert('Ошибка создания товара');
  }
};

// Обновление товара
const handleUpdateProduct = async () => {
  try {
    const updated = await productsAPI.update(currentProduct.id, currentProduct);
    setProducts(products.map(p => p.id === updated.id ? updated : p));
    setShowProductModal(false);
    setCurrentProduct(defaultProduct);
  } catch (error) {
    console.error('Failed to update product:', error);
    alert('Ошибка обновления товара');
  }
};

// Удаление товара
const handleDeleteProduct = async (id) => {
  if (!window.confirm('Вы уверены что хотите удалить этот товар?')) return;

  try {
    await productsAPI.delete(id);
    setProducts(products.filter(p => p.id !== id));
  } catch (error) {
    console.error('Failed to delete product:', error);
    alert('Ошибка удаления товара');
  }
};

// Обновление статуса заказа
const handleUpdateOrderStatus = async (orderId, newStatus) => {
  try {
    const updated = await ordersAPI.updateStatus(orderId, newStatus);
    setOrders(orders.map(o => o.id === updated.id ? updated : o));
  } catch (error) {
    console.error('Failed to update order:', error);
    alert('Ошибка обновления заказа');
  }
};

// Сохранение настроек
const handleSaveSettings = async () => {
  try {
    await settingsAPI.update(siteSettings);
    alert('Настройки сохранены');
  } catch (error) {
    console.error('Failed to save settings:', error);
    alert('Ошибка сохранения настроек');
  }
};
```

### 6.4. AdminLogin.jsx

Замените на реальную аутентификацию:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/services';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.login(formData.username, formData.password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... JSX с формой логина
    {error && <div className="text-red-500 mb-4">{error}</div>}
    <button type="submit" disabled={loading}>
      {loading ? 'Вход...' : 'Войти'}
    </button>
  );
};
```

## Шаг 7: Защита админских роутов

Создайте `src/components/ProtectedRoute.jsx`:

```javascript
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI } from '../api/services';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        await authAPI.verify();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('admin_user');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (loading) {
    return <div>Проверка авторизации...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

export default ProtectedRoute;
```

Обновите `App.jsx`:

```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Route path="/admin" element={
  <ProtectedRoute>
    <Admin />
  </ProtectedRoute>
} />
```

## Шаг 8: Обработка ошибок

Создайте глобальный обработчик ошибок в `src/utils/errorHandler.js`:

```javascript
export const handleAPIError = (error, customMessage = 'Произошла ошибка') => {
  if (error.response) {
    // Сервер вернул ошибку
    const message = error.response.data?.error || customMessage;
    console.error('API Error:', error.response.status, message);
    return message;
  } else if (error.request) {
    // Запрос отправлен, но ответа нет
    console.error('Network Error:', error.request);
    return 'Ошибка соединения с сервером';
  } else {
    // Другая ошибка
    console.error('Error:', error.message);
    return customMessage;
  }
};
```

## Шаг 9: Тестирование

1. Запустите бэкенд:
```bash
cd backend
python run.py
```

2. Запустите фронтенд:
```bash
cd ..
npm start
```

3. Проверьте:
   - [ ] Загрузка товаров в каталоге
   - [ ] Создание заказа
   - [ ] Оплата через ЮКассу
   - [ ] Вход в админку с реальными учетными данными
   - [ ] CRUD операции с товарами
   - [ ] Обновление статусов заказов
   - [ ] Сохранение настроек

## Шаг 10: Production deployment

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://api.airshop.ru/api
```

### Backend
Настройте CORS для production домена в `backend/.env`:
```env
FRONTEND_URL=https://airshop.ru
```

## Troubleshooting

### CORS ошибки
Убедитесь, что `FRONTEND_URL` в backend/.env совпадает с адресом фронтенда.

### 401 Unauthorized
Проверьте, что JWT токен сохраняется в localStorage и добавляется к запросам.

### Товары не загружаются
Проверьте консоль браузера и логи бэкенда. Убедитесь, что бэкенд запущен и доступен.

### Платежи не работают
Проверьте настройки ЮКассы в backend/.env. В тестовом режиме используйте тестовые карты из документации ЮКассы.

## Дополнительные улучшения

1. **Кэширование**: Добавьте React Query или SWR для кэширования данных
2. **Загрузка**: Добавьте loading состояния и скелетоны
3. **Оптимистичные обновления**: Обновляйте UI сразу, не дожидаясь ответа сервера
4. **Ретраи**: Добавьте автоматические повторные попытки при ошибках сети
5. **Websockets**: Добавьте реал-тайм обновления для админки (Socket.io)
