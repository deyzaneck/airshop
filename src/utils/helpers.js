// Форматирование цены
export const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Работа с корзиной
export const getCart = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error reading cart:', error);
    return [];
  }
};

export const saveCart = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }
  
  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId) => {
  const cart = getCart();
  const newCart = cart.filter(item => item.id !== productId);
  saveCart(newCart);
  return newCart;
};

export const updateCartQuantity = (productId, quantity) => {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart(cart);
  }
  
  return cart;
};

export const clearCart = () => {
  saveCart([]);
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const getCartCount = () => {
  const cart = getCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
};

// Работа с заказами
export const getOrders = () => {
  try {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
};

export const saveOrder = (orderData) => {
  try {
    const orders = getOrders();
    const newOrder = {
      id: Date.now(),
      ...orderData,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'Обработка',
      createdAt: new Date().toISOString()
    };
    orders.unshift(newOrder); // Добавляем в начало массива
    localStorage.setItem('orders', JSON.stringify(orders));
    return newOrder;
  } catch (error) {
    console.error('Error saving order:', error);
    return null;
  }
};

export const updateOrderStatus = (orderId, newStatus) => {
  try {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      localStorage.setItem('orders', JSON.stringify(orders));
    }
    return orders;
  } catch (error) {
    console.error('Error updating order:', error);
    return getOrders(); // Исправлено: используем getOrders() вместо orders
  }
};

export const getOrderById = (orderId) => {
  const orders = getOrders();
  return orders.find(o => o.id === orderId);
};
