// Функции для работы с заказами
export const getOrders = () => {
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
};

export const addOrder = (order) => {
  const orders = getOrders();
  const newOrder = {
    ...order,
    id: Date.now(),
    date: new Date().toLocaleDateString('ru-RU'),
    status: 'Обработка'
  };
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));
  return newOrder;
};

export const deleteOrder = (orderId) => {
  const orders = getOrders();
  const filtered = orders.filter(order => order.id !== orderId);
  localStorage.setItem('orders', JSON.stringify(filtered));
};

export const updateOrderStatus = (orderId, status) => {
  const orders = getOrders();
  const updated = orders.map(order => 
    order.id === orderId ? { ...order, status } : order
  );
  localStorage.setItem('orders', JSON.stringify(updated));
};

// Функции для работы с настройками сайта
export const getSiteSettings = () => {
  const settings = localStorage.getItem('siteSettings');
  return settings ? JSON.parse(settings) : {
    heroTitle: 'Откройте мир оригинальных ароматов',
    heroSubtitle: 'Премиальная парфюмерия с гарантией подлинности',
    phone: '+7 (999) 123-45-67',
    email: 'info@airshop.ru',
    telegram: '@airshop_support',
    description: 'Премиальная парфюмерия с гарантией подлинности и быстрой доставкой по всей России.'
  };
};

export const updateSiteSettings = (settings) => {
  localStorage.setItem('siteSettings', JSON.stringify(settings));
};

// Функции для работы с товарами
export const saveProducts = (products) => {
  localStorage.setItem('products', JSON.stringify(products));
};

export const loadProducts = () => {
  const products = localStorage.getItem('products');
  return products ? JSON.parse(products) : null;
};
