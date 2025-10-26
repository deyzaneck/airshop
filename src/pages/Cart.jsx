import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { getCart, updateCartQuantity, removeFromCart, clearCart } from '../utils/helpers';
import { formatPrice } from '../utils/helpers';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartQuantity(productId, newQuantity);
    setCart(getCart());
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
    setCart(getCart());
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 5000 ? 0 : 300;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="card-dark text-center py-20">
            <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-light-400" />
            <h2 className="text-2xl font-bold mb-4 text-light-100">Корзина пуста</h2>
            <p className="text-light-300 mb-6">Добавьте товары из каталога</p>
            <Link to="/catalog">
              <button className="btn btn-primary">Перейти в каталог</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-light-100">Корзина</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="card-dark">
                <div className="flex gap-4">
                  <Link to={`/product/${item.id}`} className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-32 object-cover rounded-2xl"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${item.id}`}>
                      <h3 className="font-semibold text-lg text-light-100 hover:text-peach-400 transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-light-300">{item.brand} • {item.volume}</p>
                    <p className="font-bold text-lg text-peach-400 mt-2">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="btn-icon hover:bg-wine-500/20 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-wine-500" />
                    </button>
                    <div className="flex items-center bg-glass border border-glass rounded-xl overflow-hidden">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-peach-400/10 transition-colors text-light-200"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-semibold text-light-100">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-peach-400/10 transition-colors text-light-200"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => {
                if (window.confirm('Очистить корзину?')) {
                  clearCart();
                  setCart([]);
                  window.dispatchEvent(new Event('cartUpdated'));
                }
              }}
              className="btn btn-secondary"
            >
              Очистить корзину
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="card-dark sticky top-24">
              <h3 className="text-xl font-bold mb-6 text-light-100">Итого</h3>
              <div className="space-y-3 mb-6">
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
                {shipping === 0 && subtotal < 5000 && (
                  <p className="text-sm text-peach-400">
                    Бесплатная доставка от 5000 ₽
                  </p>
                )}
              </div>
              <div className="flex justify-between text-lg font-bold mb-6 pt-3 border-t border-glass/30 text-light-100">
                <span>Итого</span>
                <span className="text-peach-400">{formatPrice(total)}</span>
              </div>
              <button 
                onClick={() => navigate('/checkout')}
                className="btn btn-primary w-full"
              >
                Оформить заказ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
