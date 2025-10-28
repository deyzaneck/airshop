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

// ============= ADMIN =============

export const adminAPI = {
  importCSV: async (csvData) => {
    const response = await apiClient.post('/admin/import-csv', { csv_data: csvData });
    return response.data;
  }
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
