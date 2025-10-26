import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, CreditCard, Smartphone } from 'lucide-react';
import { getCart, clearCart, formatPrice } from '../utils/helpers';
import { ordersAPI } from '../api/services';
import { createPayment, generateOrderNumber } from '../utils/payment';
import { PAYMENT_CONFIG } from '../config/payment';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    telegram: '',
    address: '',
    city: '',
    zipCode: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'sbp', 'cash'

  useEffect(() => {
    const cartItems = getCart();
    if (cartItems.length === 0) {
      navigate('/cart');
    }
    setCart(cartItems);
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Генерируем уникальный номер заказа
      const orderNumber = generateOrderNumber();

      // Подготавливаем данные для API
      const orderData = {
        orderNumber: orderNumber,
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          telegram: formData.telegram || ''
        },
        delivery: {
          address: formData.address,
          city: formData.city,
          zipcode: formData.zipCode
        },
        comment: formData.comment || '',
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod: paymentMethod,
        paymentId: null // Будет заполнено после создания платежа
      };

      // Сохраняем заказ через API
      const createdOrder = await ordersAPI.create(orderData);
      console.log('Заказ создан через API:', createdOrder);

      // Если выбрана оплата наличными - просто завершаем заказ
      if (paymentMethod === 'cash') {
        setTimeout(() => {
          setOrderComplete(true);
          clearCart();
          window.dispatchEvent(new Event('cartUpdated'));
          setIsSubmitting(false);

          // Через 3 секунды перенаправляем на главную
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }, 1500);
        return;
      }

      // Для онлайн оплаты создаем платеж через ЮКассу
      const paymentResult = await createPayment(
        { id: orderNumber, amount: total },
        total
      );

      if (paymentResult.success) {
        // В тестовом режиме просто показываем success
        if (PAYMENT_CONFIG.mode === 'test') {
          alert(`🔄 ТЕСТОВЫЙ РЕЖИМ\n\nПлатеж создан в ЮКассе:\nЗаказ: ${orderNumber}\nСумма: ${formatPrice(total)}\nPayment ID: ${paymentResult.payment_id}\n\nВ продакшене здесь будет переход на платежную форму ЮКассы`);

          // Имитируем успешную оплату
          setTimeout(() => {
            navigate(`/payment/success?orderId=${orderNumber}&paymentId=${paymentResult.payment_id}`);
            clearCart();
            window.dispatchEvent(new Event('cartUpdated'));
          }, 1500);
        } else {
          // В production режиме перенаправляем на платежную форму ЮКассы
          // URL приходит в поле confirmation_url
          window.location.href = paymentResult.confirmation_url;
        }
      } else {
        // Ошибка создания платежа
        alert(`Ошибка создания платежа: ${paymentResult.error}`);
        setIsSubmitting(false);
      }

    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
      setIsSubmitting(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 5000 ? 0 : 300;
  const total = subtotal + shipping;

  if (orderComplete) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="card-dark text-center max-w-2xl mx-auto">
            <CheckCircle className="w-24 h-24 mx-auto mb-6 text-green-500" />
            <h2 className="text-3xl font-bold text-light-100 mb-4">
              Заказ оформлен!
            </h2>
            <p className="text-light-300 mb-6">
              Спасибо за покупку! Мы отправили подтверждение на вашу почту.
            </p>
            <p className="text-light-400 text-sm">
              Перенаправление на главную страницу...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-light-100">Оформление заказа</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card-dark">
              <h2 className="text-2xl font-bold mb-6 text-light-100">Контактная информация</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-light-200 text-sm font-medium mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-light-200 text-sm font-medium mb-2">
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-light-200 text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-light-200 text-sm font-medium mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-light-200 text-sm font-medium mb-2">
                  Telegram
                </label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="@username"
                />
                <p className="text-sm text-light-400 mt-1">
                  Укажите ваш Telegram для связи (необязательно)
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-6 text-light-100 mt-8">Адрес доставки</h2>

              <div className="mb-6">
                <label className="block text-light-200 text-sm font-medium mb-2">
                  Адрес *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="input"
                  placeholder="Улица, дом, квартира"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-light-200 text-sm font-medium mb-2">
                    Город *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-light-200 text-sm font-medium mb-2">
                    Индекс *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="000000"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-light-200 text-sm font-medium mb-2">
                  Комментарий к заказу
                </label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleInputChange}
                  className="input"
                  rows="4"
                  placeholder="Особые пожелания или комментарии..."
                ></textarea>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-light-100">Способ оплаты</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Банковская карта */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-peach-400 bg-peach-400/10'
                        : 'border-glass bg-glass hover:border-peach-400/50'
                    }`}
                  >
                    <CreditCard className={`w-8 h-8 mx-auto mb-3 ${
                      paymentMethod === 'card' ? 'text-peach-400' : 'text-light-400'
                    }`} />
                    <p className="font-semibold text-light-100 mb-1">Банковская карта</p>
                    <p className="text-xs text-light-400">Онлайн оплата</p>
                  </button>

                  {/* СБП */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('sbp')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'sbp'
                        ? 'border-peach-400 bg-peach-400/10'
                        : 'border-glass bg-glass hover:border-peach-400/50'
                    }`}
                  >
                    <Smartphone className={`w-8 h-8 mx-auto mb-3 ${
                      paymentMethod === 'sbp' ? 'text-peach-400' : 'text-light-400'
                    }`} />
                    <p className="font-semibold text-light-100 mb-1">СБП</p>
                    <p className="text-xs text-light-400">Быстрый платеж</p>
                  </button>

                  {/* Наличными */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-peach-400 bg-peach-400/10'
                        : 'border-glass bg-glass hover:border-peach-400/50'
                    }`}
                  >
                    <div className={`text-3xl mx-auto mb-3 ${
                      paymentMethod === 'cash' ? 'text-peach-400' : 'text-light-400'
                    }`}>💵</div>
                    <p className="font-semibold text-light-100 mb-1">При получении</p>
                    <p className="text-xs text-light-400">Наличными/картой</p>
                  </button>
                </div>

                {/* Payment Info */}
                {paymentMethod !== 'cash' && (
                  <div className="mt-4 p-4 bg-peach-400/10 border border-peach-400/30 rounded-xl">
                    <p className="text-sm text-light-200">
                      💳 Оплата через защищенную форму ЮКассы (Яндекс)
                    </p>
                    <p className="text-xs text-light-400 mt-1">
                      Ваши платежные данные надежно защищены стандартом PCI DSS
                    </p>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="mt-4 p-4 bg-glass border border-glass rounded-xl">
                    <p className="text-sm text-light-200">
                      💵 Оплата наличными или картой курьеру при получении
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? (
                  <>
                    <span className="loading"></span>
                    <span>Оформление...</span>
                  </>
                ) : paymentMethod === 'cash' ? (
                  'Подтвердить заказ'
                ) : (
                  'Перейти к оплате'
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-dark sticky top-24">
              <h3 className="text-xl font-bold mb-6 text-light-100">Ваш заказ</h3>
              
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-light-100 text-sm">
                        {item.name}
                      </h4>
                      <p className="text-xs text-light-400">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pt-4">
                <div className="flex justify-between text-light-300">
                  <span>Товары ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                  <span className="font-semibold text-light-100">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-light-300">
                  <span>Доставка</span>
                  <span className="font-semibold text-light-100">
                    {shipping === 0 ? 'Бесплатно' : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold mb-4 pt-4 border-t border-glass/30 text-light-100">
                <span>Итого</span>
                <span className="text-peach-400">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
