import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingBag, DollarSign, X, Eye, Phone, Mail, MapPin, Send, Settings, Edit, Trash2, Plus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/helpers';
import { productsAPI, ordersAPI, settingsAPI, authAPI } from '../api/services';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Products state
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Settings state
  const [siteSettings, setSiteSettings] = useState({
    hero: { title: '', subtitle: '' },
    contact: { phone: '', email: '', telegram: '' }
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [productsData, ordersData, settingsData] = await Promise.all([
        productsAPI.getAll({ visible: false }), // Загружаем все товары, включая скрытые
        ordersAPI.getAll(),
        settingsAPI.get().catch(() => ({ hero: {}, contact: {} })) // С fallback
      ]);

      setProducts(productsData);
      setOrders(ordersData.orders || ordersData);
      setSiteSettings(settingsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      alert('Ошибка загрузки данных. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await productsAPI.getAll({ visible: false });
      setProducts(productsData);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    }
  };

  // Маппинг английских статусов на русские для отображения
  const statusFromAPI = {
    'pending': 'Обработка',
    'awaiting_payment': 'Ожидает оплаты',
    'paid': 'Оплачен',
    'processing': 'В обработке',
    'shipping': 'В пути',
    'delivered': 'Доставлен',
    'canceled': 'Отменен'
  };

  const loadOrders = async () => {
    try {
      const ordersData = await ordersAPI.getAll();
      const orders = ordersData.orders || ordersData;
      // Преобразуем английские статусы в русские для отображения
      const ordersWithRussianStatus = orders.map(order => ({
        ...order,
        status: statusFromAPI[order.status] || order.status
      }));
      setOrders(ordersWithRussianStatus);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    }
  };

  // Маппинг русских статусов на английские для API
  const statusToAPI = {
    'Обработка': 'pending',
    'Ожидает оплаты': 'awaiting_payment',
    'Оплачен': 'paid',
    'В обработке': 'processing',
    'В пути': 'shipping',
    'Доставлен': 'delivered',
    'Отменен': 'canceled'
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Преобразуем русский статус в английский для API
      const apiStatus = statusToAPI[newStatus] || newStatus;
      await ordersAPI.updateStatus(orderId, apiStatus);

      // Перезагружаем заказы
      await loadOrders();

      // ВАЖНО: Обновляем selectedOrder, если модальное окно открыто
      if (selectedOrder && selectedOrder.id === orderId) {
        const ordersData = await ordersAPI.getAll();
        const orders = ordersData.orders || ordersData;
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
          // Преобразуем английский статус в русский для отображения
          const statusFromAPI = {
            'pending': 'Обработка',
            'awaiting_payment': 'Ожидает оплаты',
            'paid': 'Оплачен',
            'processing': 'В обработке',
            'shipping': 'В пути',
            'delivered': 'Доставлен',
            'canceled': 'Отменен'
          };
          updatedOrder.status = statusFromAPI[updatedOrder.status] || updatedOrder.status;
          setSelectedOrder(updatedOrder);
        }
      }

      alert('Статус заказа обновлен!');
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      alert('Ошибка обновления статуса заказа');
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const handleSaveSettings = async () => {
    try {
      await settingsAPI.update(siteSettings);
      alert('Настройки сохранены!');
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      alert('Ошибка сохранения настроек');
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/admin/login');
  };

  const handleAddProduct = () => {
    const newProduct = {
      name: '',
      brand: '',
      price: 0,
      oldPrice: null,
      discount: 0,
      volume: '50ml',
      category: 'women',
      description: '',
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
      isFeatured: false,
      isNew: true,
      isVisible: true,
    };
    setEditingProduct(newProduct);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Удалить этот товар?')) {
      try {
        await productsAPI.delete(productId);
        await loadProducts();
        alert('Товар удален!');
      } catch (error) {
        console.error('Ошибка удаления товара:', error);
        alert('Ошибка удаления товара');
      }
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct.id) {
        // Обновление существующего товара
        await productsAPI.update(editingProduct.id, editingProduct);
      } else {
        // Создание нового товара
        await productsAPI.create(editingProduct);
      }
      await loadProducts();
      closeProductModal();
      alert('Товар сохранен!');
    } catch (error) {
      console.error('Ошибка сохранения товара:', error);
      alert('Ошибка сохранения товара');
    }
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
  };

  // Статистика
  const stats = [
    { 
      title: 'Общая выручка', 
      value: formatPrice(orders.reduce((sum, order) => sum + (order.amount || 0), 0)),
      change: `+${orders.length}`, 
      icon: DollarSign,
      color: 'from-green-400 to-emerald-500'
    },
    { 
      title: 'Заказы', 
      value: orders.length.toString(), 
      change: `+${orders.length}`, 
      icon: ShoppingBag,
      color: 'from-peach-400 to-wine-500'
    },
    { 
      title: 'Товары', 
      value: products.length.toString(), 
      change: `+${products.length}`, 
      icon: Package,
      color: 'from-blue-400 to-indigo-500'
    },
    { 
      title: 'Клиенты', 
      value: new Set(orders.map(o => o.contactInfo?.email || '')).size.toString(),
      change: `+${new Set(orders.map(o => o.contactInfo?.email || '')).size}`, 
      icon: Users,
      color: 'from-purple-400 to-pink-500'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Доставлен':
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'В пути':
      case 'shipping':
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'Обработка':
      case 'pending':
      case 'В обработке':
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'Отменен':
      case 'canceled':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'Ожидает оплаты':
      case 'awaiting_payment':
        return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'Оплачен':
      case 'paid':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-light-100 mb-2">Панель управления</h1>
            <p className="text-light-300">Добро пожаловать в админ панель AirShop</p>
          </div>
          <div className="flex gap-3">
            <button className="btn btn-secondary" onClick={loadAllData} disabled={loading}>
              {loading ? 'Загрузка...' : 'Обновить данные'}
            </button>
            <button className="btn btn-secondary flex items-center gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Выход
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card-dark">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm font-semibold">
                  {stat.change}
                </span>
              </div>
              <p className="text-light-400 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-light-100">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="card-dark mb-8">
          <div className="flex gap-4 border-b border-glass pb-4 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-peach-400/20 text-peach-400'
                  : 'text-light-300 hover:text-peach-400'
              }`}
            >
              Обзор
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-peach-400/20 text-peach-400'
                  : 'text-light-300 hover:text-peach-400'
              }`}
            >
              Заказы ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-peach-400/20 text-peach-400'
                  : 'text-light-300 hover:text-peach-400'
              }`}
            >
              Товары
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-peach-400/20 text-peach-400'
                  : 'text-light-300 hover:text-peach-400'
              }`}
            >
              Настройки
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-xl font-bold text-light-100 mb-4">Последние заказы</h3>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-light-400" />
                  <p className="text-light-300 text-lg">Заказов пока нет</p>
                  <p className="text-light-400 text-sm mt-2">Заказы будут появляться здесь</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="bg-glass p-4 rounded-xl border border-glass">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-light-100">#{order.id}</p>
                          <p className="text-sm text-light-300">{order.customer?.name || order.customer}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <button
                            onClick={() => openOrderDetails(order)}
                            className="btn-icon hover:bg-peach-400/10"
                            title="Просмотр деталей"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-light-400 mb-2">{order.product}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-peach-400">{formatPrice(order.amount)}</span>
                        <span className="text-xs text-light-400">{order.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-xl font-bold text-light-100 mb-4">Все заказы</h3>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-light-400" />
                  <p className="text-light-300 text-lg">Заказов пока нет</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-glass">
                        <th className="text-left py-3 px-4 text-light-200 font-semibold">ID</th>
                        <th className="text-left py-3 px-4 text-light-200 font-semibold">Клиент</th>
                        <th className="text-left py-3 px-4 text-light-200 font-semibold">Контакт</th>
                        <th className="text-left py-3 px-4 text-light-200 font-semibold">Сумма</th>
                        <th className="text-left py-3 px-4 text-light-200 font-semibold">Статус</th>
                        <th className="text-left py-3 px-4 text-light-200 font-semibold">Дата</th>
                        <th className="text-left py-3 px-4 text-light-200 font-semibold">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-glass/50 hover:bg-glass/50 transition-colors">
                          <td className="py-3 px-4 text-light-100 font-semibold">#{order.id}</td>
                          <td className="py-3 px-4 text-light-300">{order.customer?.name || order.customer}</td>
                          <td className="py-3 px-4 text-light-300 text-sm">
                            {order.customer?.email || order.contactInfo?.email || 'Не указан'}
                          </td>
                          <td className="py-3 px-4 text-peach-400 font-semibold">{formatPrice(order.totalAmount || order.amount)}</td>
                          <td className="py-3 px-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(order.status)} bg-dark-700 cursor-pointer`}
                            >
                              <option value="Обработка">Обработка</option>
                              <option value="Ожидает оплаты">Ожидает оплаты</option>
                              <option value="Оплачен">Оплачен</option>
                              <option value="В обработке">В обработке</option>
                              <option value="В пути">В пути</option>
                              <option value="Доставлен">Доставлен</option>
                              <option value="Отменен">Отменен</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-light-400">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ru-RU') : order.date}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => openOrderDetails(order)}
                              className="btn-icon hover:bg-peach-400/10"
                              title="Просмотр деталей"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-light-100">Управление товарами</h3>
                <button
                  className="btn btn-primary"
                  onClick={handleAddProduct}
                >
                  <Plus className="w-5 h-5" />
                  Добавить товар
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-glass p-4 rounded-xl border border-glass">
                    <div className="aspect-[3/4] bg-light-100 rounded-xl mb-3 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="text-xs text-light-400 uppercase mb-1">{product.brand}</p>
                        <h4 className="font-semibold text-light-100 mb-1">{product.name}</h4>
                        <p className="text-sm text-light-400">{product.volume}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-light-400">Цена:</span>
                        <span className="text-peach-400 font-semibold">{formatPrice(product.price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-light-400">Категория:</span>
                        <span className="text-light-200">
                          {product.category === 'women' ? 'Женские' : product.category === 'men' ? 'Мужские' : 'Унисекс'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="btn btn-secondary flex-1 text-sm py-2"
                      >
                        <Edit className="w-4 h-4" />
                        Редактировать
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="btn btn-secondary text-sm py-2 px-3 hover:bg-red-500/20 hover:border-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h3 className="text-xl font-bold text-light-100 mb-6">Настройки сайта</h3>
              
              <div className="space-y-6">
                {/* Hero Section Settings */}
                <div className="bg-glass p-6 rounded-xl border border-glass">
                  <h4 className="text-lg font-semibold text-light-100 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-peach-400" />
                    Главная страница
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-light-200 text-sm font-medium mb-2">
                        Заголовок Hero секции
                      </label>
                      <input
                        type="text"
                        value={siteSettings.hero?.title || ''}
                        onChange={(e) => setSiteSettings({...siteSettings, hero: {...siteSettings.hero, title: e.target.value}})}
                        className="input w-full"
                        placeholder="Откройте мир оригинальных ароматов"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-light-200 text-sm font-medium mb-2">
                        Подзаголовок Hero секции
                      </label>
                      <input
                        type="text"
                        value={siteSettings.hero?.subtitle || ''}
                        onChange={(e) => setSiteSettings({...siteSettings, hero: {...siteSettings.hero, subtitle: e.target.value}})}
                        className="input w-full"
                        placeholder="Премиальная парфюмерия с гарантией подлинности"
                      />
                    </div>
                    
                  </div>
                </div>

                {/* Contact Settings */}
                <div className="bg-glass p-6 rounded-xl border border-glass">
                  <h4 className="text-lg font-semibold text-light-100 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-peach-400" />
                    Контактная информация
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-light-200 text-sm font-medium mb-2">
                        Телефон
                      </label>
                      <input
                        type="text"
                        value={siteSettings.contact?.phone || ''}
                        onChange={(e) => setSiteSettings({...siteSettings, contact: {...siteSettings.contact, phone: e.target.value}})}
                        className="input w-full"
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-light-200 text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={siteSettings.contact?.email || ''}
                        onChange={(e) => setSiteSettings({...siteSettings, contact: {...siteSettings.contact, email: e.target.value}})}
                        className="input w-full"
                        placeholder="info@airshop.ru"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-light-200 text-sm font-medium mb-2">
                        Telegram
                      </label>
                      <input
                        type="text"
                        value={siteSettings.contact?.telegram || ''}
                        onChange={(e) => setSiteSettings({...siteSettings, contact: {...siteSettings.contact, telegram: e.target.value}})}
                        className="input w-full"
                        placeholder="@airshop_support"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSaveSettings}
                  className="btn btn-primary w-full"
                >
                  Сохранить настройки
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card-dark max-w-3xl w-full my-8 border-0 custom-scrollbar" style={{maxHeight: '90vh', overflowY: 'auto'}}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-light-100">Заказ #{selectedOrder.orderNumber || selectedOrder.id}</h2>
                <p className="text-light-400">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('ru-RU') : selectedOrder.date}
                </p>
              </div>
              <button
                onClick={closeOrderModal}
                className="btn-icon hover:bg-wine-500/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Status */}
            <div className="mb-6">
              <label className="block text-light-200 text-sm font-medium mb-2">
                Статус заказа
              </label>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                className="input w-full"
              >
                <option value="Обработка">Обработка</option>
                <option value="Ожидает оплаты">Ожидает оплаты</option>
                <option value="Оплачен">Оплачен</option>
                <option value="В обработке">В обработке</option>
                <option value="В пути">В пути</option>
                <option value="Доставлен">Доставлен</option>
                <option value="Отменен">Отменен</option>
              </select>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-light-100 mb-4">Информация о клиенте</h3>
              <div className="bg-glass p-4 rounded-xl space-y-3 border-0">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-peach-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-light-400">Имя</p>
                    <p className="text-light-100 font-semibold">
                      {selectedOrder.customer?.name || `${selectedOrder.contactInfo?.firstName} ${selectedOrder.contactInfo?.lastName}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-peach-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-light-400">Email</p>
                    <a
                      href={`mailto:${selectedOrder.customer?.email || selectedOrder.contactInfo?.email}`}
                      className="text-light-100 hover:text-peach-400 transition-colors"
                    >
                      {selectedOrder.customer?.email || selectedOrder.contactInfo?.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-peach-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-light-400">Телефон</p>
                    <a
                      href={`tel:${selectedOrder.customer?.phone || selectedOrder.contactInfo?.phone}`}
                      className="text-light-100 hover:text-peach-400 transition-colors"
                    >
                      {selectedOrder.customer?.phone || selectedOrder.contactInfo?.phone}
                    </a>
                  </div>
                </div>
                {(selectedOrder.customer?.telegram || selectedOrder.contactInfo?.telegram) && (
                  <div className="flex items-start gap-3">
                    <Send className="w-5 h-5 text-peach-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-light-400">Telegram</p>
                      <a
                        href={`https://t.me/${(selectedOrder.customer?.telegram || selectedOrder.contactInfo?.telegram).replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-light-100 hover:text-peach-400 transition-colors"
                      >
                        {selectedOrder.customer?.telegram || selectedOrder.contactInfo?.telegram}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-light-100 mb-4">Адрес доставки</h3>
              <div className="bg-glass p-4 rounded-xl border-0">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-peach-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-light-100">
                      {selectedOrder.delivery?.city || selectedOrder.contactInfo?.city}, {selectedOrder.delivery?.zipcode || selectedOrder.contactInfo?.zipCode}
                    </p>
                    <p className="text-light-300 mt-1">
                      {selectedOrder.delivery?.address || selectedOrder.contactInfo?.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment */}
            {(selectedOrder.comment || selectedOrder.contactInfo?.comment) && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-light-100 mb-4">Комментарий</h3>
                <div className="bg-glass p-4 rounded-xl border-0">
                  <p className="text-light-300">{selectedOrder.comment || selectedOrder.contactInfo?.comment}</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-light-100 mb-4">Товары</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => {
                  // Ищем полную информацию о товаре
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={index} className="bg-glass p-4 rounded-xl flex gap-4 border-0">
                      {product?.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-light-100">
                          {product?.name || item.name || `Товар #${item.productId}`}
                        </h4>
                        {product && (
                          <p className="text-sm text-light-400">{product.brand} • {product.volume}</p>
                        )}
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-light-400">Цена за единицу:</span>
                            <span className="text-light-200 font-medium">{formatPrice(item.price)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-light-400">Количество:</span>
                            <span className="text-light-200 font-medium">{item.quantity} шт.</span>
                          </div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-light-300 font-semibold">Сумма:</span>
                            <span className="font-bold text-peach-400 text-lg">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Total */}
            <div className="pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-light-300">
                  <span>Товары:</span>
                  <span className="text-light-100 font-semibold">
                    {formatPrice(selectedOrder.totalAmount || selectedOrder.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-light-300">
                  <span>Доставка:</span>
                  <span className="text-light-100 font-semibold">
                    {(selectedOrder.totalAmount || selectedOrder.amount) >= 5000 ? 'Бесплатно' : formatPrice(300)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2">
                  <span className="text-light-100">Итого:</span>
                  <span className="text-peach-400">
                    {formatPrice((selectedOrder.totalAmount || selectedOrder.amount) + ((selectedOrder.totalAmount || selectedOrder.amount) >= 5000 ? 0 : 300))}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => {
                  closeOrderModal();
                  loadOrders();
                }}
                className="btn btn-primary flex-1"
              >
                Сохранить изменения
              </button>
              <button 
                onClick={closeOrderModal}
                className="btn btn-secondary"
              >
                Закрыть
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit/Add Modal */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="card-dark max-w-2xl w-full my-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-light-100">
                {products.find(p => p.id === editingProduct.id) ? 'Редактирование товара' : 'Добавление товара'}
              </h2>
              <button
                onClick={closeProductModal}
                className="btn-icon hover:bg-wine-500/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveProduct();
            }}>
              {/* Product Image */}
              <div className="mb-6">
                <label className="block text-light-200 text-sm font-medium mb-2">
                  URL изображения
                </label>
                <input
                  type="url"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                  className="input w-full"
                  required
                />
                {editingProduct.image && (
                  <div className="mt-3 aspect-[3/4] max-w-xs bg-light-100 rounded-xl overflow-hidden">
                    <img
                      src={editingProduct.image}
                      alt={editingProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-light-200 text-sm font-medium mb-2">
                    Бренд *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-light-200 text-sm font-medium mb-2">
                    Объем *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.volume}
                    onChange={(e) => setEditingProduct({...editingProduct, volume: e.target.value})}
                    className="input w-full"
                    placeholder="100ml"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-light-200 text-sm font-medium mb-2">
                  Название товара *
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="input w-full"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-light-200 text-sm font-medium mb-2">
                  Описание
                </label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="input w-full"
                  rows="3"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-light-200 text-sm font-medium mb-2">
                    Цена *
                  </label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => {
                      const newPrice = parseInt(e.target.value) || 0;
                      const updated = { ...editingProduct, price: newPrice };
                      // Пересчитываем старую цену если есть скидка
                      if (editingProduct.discount > 0) {
                        updated.oldPrice = Math.round(newPrice / (1 - editingProduct.discount / 100));
                      }
                      setEditingProduct(updated);
                    }}
                    className="input w-full"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-light-200 text-sm font-medium mb-2">
                    Старая цена
                  </label>
                  <input
                    type="number"
                    value={editingProduct.oldPrice || ''}
                    onChange={(e) => {
                      const newOldPrice = e.target.value ? parseInt(e.target.value) : null;
                      const updated = { ...editingProduct, oldPrice: newOldPrice };
                      // Автоматически рассчитываем скидку из старой цены
                      if (newOldPrice && newOldPrice > editingProduct.price) {
                        updated.discount = Math.round(((newOldPrice - editingProduct.price) / newOldPrice) * 100);
                      } else {
                        updated.discount = 0;
                      }
                      setEditingProduct(updated);
                    }}
                    className="input w-full"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-light-200 text-sm font-medium mb-2">
                    Скидка (%)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.discount}
                    onChange={(e) => {
                      const newDiscount = parseInt(e.target.value) || 0;
                      const updated = { ...editingProduct, discount: newDiscount };
                      // Автоматически рассчитываем старую цену из скидки
                      if (newDiscount > 0 && newDiscount <= 100) {
                        updated.oldPrice = Math.round(editingProduct.price / (1 - newDiscount / 100));
                      } else {
                        updated.oldPrice = null;
                      }
                      setEditingProduct(updated);
                    }}
                    className="input w-full"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Category and Rating */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-light-200 text-sm font-medium mb-2">
                    Категория *
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="input w-full"
                    required
                  >
                    <option value="women">Женские</option>
                    <option value="men">Мужские</option>
                    <option value="unisex">Унисекс</option>
                  </select>
                </div>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={editingProduct.isVisible !== false}
                    onChange={(e) => setEditingProduct({...editingProduct, isVisible: e.target.checked})}
                    className="w-5 h-5 rounded border-glass bg-glass text-peach-400 focus:ring-peach-400"
                  />
                  <label htmlFor="isVisible" className="text-light-200 font-semibold">
                    Показывать на сайте
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={editingProduct.isFeatured}
                    onChange={(e) => setEditingProduct({...editingProduct, isFeatured: e.target.checked})}
                    className="w-5 h-5 rounded border-glass bg-glass text-peach-400 focus:ring-peach-400"
                  />
                  <label htmlFor="isFeatured" className="text-light-200">
                    Популярный товар (показывать на главной)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isNew"
                    checked={editingProduct.isNew}
                    onChange={(e) => setEditingProduct({...editingProduct, isNew: e.target.checked})}
                    className="w-5 h-5 rounded border-glass bg-glass text-peach-400 focus:ring-peach-400"
                  />
                  <label htmlFor="isNew" className="text-light-200">
                    Новинка (показывать бейдж)
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Сохранить изменения
                </button>
                <button 
                  type="button"
                  onClick={closeProductModal}
                  className="btn btn-secondary"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
