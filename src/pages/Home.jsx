import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, RefreshCw, Sparkles } from 'lucide-react';
import { productsAPI, settingsAPI } from '../api/services';
import { formatPrice, addToCart } from '../utils/helpers';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({});
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Загружаем товары из API
    const loadData = async () => {
      try {
        const [productsData, settingsData] = await Promise.all([
          productsAPI.getAll({ featured: true }),
          settingsAPI.get().catch(() => ({})) // Если настройки не загрузились, используем пустой объект
        ]);
        setProducts(productsData.slice(0, 4)); // Только первые 4 товара
        setSettings(settingsData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };

    loadData();
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    window.dispatchEvent(new Event('cartUpdated'));
    alert(`${product.name} добавлен в корзину!`);
  };

  const handleSparkleClick = () => {
    // Создаем 12 частиц, вылетающих в разных направлениях
    const newParticles = Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 360) / 12; // Равномерное распределение по кругу
      const distance = 80 + Math.random() * 40; // Случайное расстояние
      const angleRad = (angle * Math.PI) / 180; // Конвертируем в радианы

      return {
        id: Date.now() + i,
        x: Math.cos(angleRad) * distance,
        y: Math.sin(angleRad) * distance,
        delay: Math.random() * 0.1,
        color: ['peach', 'gold', 'purple', 'pink'][Math.floor(Math.random() * 4)]
      };
    });

    setParticles(newParticles);

    // Удаляем частицы после анимации
    setTimeout(() => {
      setParticles([]);
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Background with Perfume Bottles - Collage Style */}
        <div className="absolute inset-0 z-0">
          {/* Main background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-wine-900/20 to-dark-800"></div>

          {/* Perfume bottle images - decorative collage (множество флаконов) */}
          {/* Левая сторона */}
          <div className="absolute left-0 top-10 w-48 h-72 opacity-15 animate-float-slow">
            <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=600&fit=crop" alt="" className="w-full h-full object-cover blur-sm" />
          </div>
          <div className="absolute left-20 top-1/3 w-40 h-60 opacity-20 animate-float-delayed" style={{animationDelay: '1s'}}>
            <img src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=600&fit=crop" alt="" className="w-full h-full object-cover blur-sm" />
          </div>
          <div className="absolute left-5 bottom-20 w-52 h-72 opacity-18 animate-float-slow" style={{animationDelay: '3s'}}>
            <img src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=600&fit=crop" alt="" className="w-full h-full object-cover blur-sm" />
          </div>

          {/* Правая сторона */}
          <div className="absolute right-0 top-20 w-44 h-64 opacity-17 animate-float-delayed">
            <img src="https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=600&fit=crop" alt="" className="w-full h-full object-cover blur-sm" />
          </div>
          <div className="absolute right-24 top-1/4 w-48 h-70 opacity-16 animate-float-slow" style={{animationDelay: '2s'}}>
            <img src="https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400&h=600&fit=crop" alt="" className="w-full h-full object-cover blur-sm" />
          </div>
          <div className="absolute right-10 bottom-32 w-40 h-60 opacity-19 animate-float-delayed" style={{animationDelay: '4s'}}>
            <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=600&fit=crop" alt="" className="w-full h-full object-cover blur-sm" />
          </div>

          {/* Центральная часть - заполняем пробелы */}
          <div className="absolute left-1/4 top-40 w-36 h-52 opacity-12 animate-float-slow" style={{animationDelay: '5s'}}>
            <img src="https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&h=600&fit=crop" alt="" className="w-full h-full object-cover blur-md" />
          </div>
          <div className="absolute right-1/4 bottom-24 w-44 h-64 opacity-14 animate-float-delayed" style={{animationDelay: '6s'}}>
            <img src="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&h=600&fit=crop" alt="" className="w-full h-full object-cover blur-md" />
          </div>

          {/* Floating particles */}
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-peach-400/30 rounded-full animate-particle-1"></div>
          <div className="absolute top-40 right-1/3 w-3 h-3 bg-gold-400/20 rounded-full animate-particle-2"></div>
          <div className="absolute bottom-40 left-1/2 w-2 h-2 bg-wine-500/30 rounded-full animate-particle-3"></div>

          {/* Gradient overlays - сильнее затемняем для читаемости */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/70 to-dark-900/40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900/60 via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="animate-fade-in-up">
              <div
                className="relative inline-block mb-8 cursor-pointer group"
                onClick={handleSparkleClick}
              >
                <Sparkles className="w-16 h-16 mx-auto text-peach-400 animate-float transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 group-active:scale-95" />
                <div className="absolute inset-0 bg-peach-400 blur-3xl opacity-50 animate-pulse-glow group-hover:opacity-90 transition-opacity duration-300"></div>

                {/* Particles that fly out on click */}
                {particles.map((particle) => {
                  const colorMap = {
                    peach: '#ffb8a0',
                    gold: '#f4c574',
                    purple: '#b57dff',
                    pink: '#ff7eb3'
                  };

                  return (
                    <div
                      key={particle.id}
                      className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full pointer-events-none"
                      style={{
                        backgroundColor: colorMap[particle.color],
                        boxShadow: `0 0 10px ${colorMap[particle.color]}`,
                        animation: `sparkle-burst 0.8s ease-out forwards`,
                        animationDelay: `${particle.delay}s`,
                        '--particle-x': `${particle.x}px`,
                        '--particle-y': `${particle.y}px`
                      }}
                    />
                  );
                })}
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold mb-6 leading-tight text-gradient animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                {settings.hero?.title || 'Добро пожаловать в AirShop'}
              </h1>
              <p className="text-xl md:text-2xl text-light-200 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                {settings.hero?.subtitle || 'Откройте для себя мир изысканных ароматов'}
              </p>
              <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <Link to="/catalog">
                  <button className="btn btn-primary text-lg px-8 py-4 relative group overflow-hidden">
                    <span className="relative z-10 flex items-center gap-3">
                      Перейти в каталог
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-peach-400/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-peach-400 rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-peach-400 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-wine-500 rounded-full blur-3xl animate-pulse-glow" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-dark text-center group hover-lift hover-glow transition-all duration-500 animate-scale-in" style={{animationDelay: '0.1s'}}>
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-peach-400 to-wine-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-peach-400 to-wine-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity"></div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gradient-gold group-hover:scale-105 transition-transform">100% оригинал</h3>
              <p className="text-sm text-light-300">Гарантия подлинности всех товаров</p>
            </div>

            <div className="card-dark text-center group hover-lift hover-glow transition-all duration-500 animate-scale-in" style={{animationDelay: '0.2s'}}>
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-peach-400 to-wine-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-peach-400 to-wine-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity"></div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gradient-gold group-hover:scale-105 transition-transform">Быстрая доставка</h3>
              <p className="text-sm text-light-300">По всей России за 2-5 дней</p>
            </div>

            <div className="card-dark text-center group hover-lift hover-glow transition-all duration-500 animate-scale-in" style={{animationDelay: '0.3s'}}>
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-peach-400 to-wine-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
                  <RefreshCw className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-peach-400 to-wine-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity"></div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gradient-gold group-hover:scale-105 transition-transform">Возврат 14 дней</h3>
              <p className="text-sm text-light-300">Вернём деньги, если что-то не так</p>
            </div>

            <div className="card-dark text-center group hover-lift hover-glow transition-all duration-500 animate-scale-in" style={{animationDelay: '0.4s'}}>
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-peach-400 to-wine-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-peach-400 to-wine-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity"></div>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gradient-gold group-hover:scale-105 transition-transform">Подарочная упаковка</h3>
              <p className="text-sm text-light-300">Бесплатно упакуем ваш заказ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="inline-block mb-4">
              <span className="badge badge-accent text-sm px-6 py-2 shadow-lg animate-pulse-glow">Хиты продаж</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-gradient animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Популярные ароматы
            </h2>
            <p className="text-xl text-light-300 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              Выбор наших покупателей - только лучшие парфюмы
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product, index) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] border border-glass hover:border-peach-400/50 transition-all duration-500 hover:shadow-2xl hover:scale-105 animate-fade-in"
                style={{animationDelay: `${0.1 * (index + 1)}s`}}
              >
                {/* Background Image */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />

                {/* Gradient Overlay - light by default, stronger on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-dark-900/20 to-transparent opacity-40 group-hover:opacity-90 transition-opacity duration-300"></div>

                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                  {product.isNew && (
                    <span className="badge badge-outline bg-dark-900/80 backdrop-blur-sm">
                      Новинка
                    </span>
                  )}
                  <div className="flex gap-2 ml-auto">
                    {product.discount > 0 && (
                      <span className="badge badge-accent">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Content - small at bottom by default, grows and moves up on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10 transform translate-y-0 group-hover:-translate-y-2 transition-all duration-300">
                  <p className="text-[10px] group-hover:text-xs text-peach-400 uppercase tracking-wider mb-0.5 group-hover:mb-1 font-bold transition-all duration-300">
                    {product.brand}
                  </p>
                  <h3 className="text-xs group-hover:text-base font-bold text-light-100 mb-0.5 group-hover:mb-1 line-clamp-2 group-hover:text-peach-400 transition-all duration-300">
                    {product.name}
                  </h3>
                  <p className="text-[10px] group-hover:text-xs text-light-300 mb-1 group-hover:mb-3 transition-all duration-300">
                    {product.volume}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {product.oldPrice && (
                        <span className="text-[10px] group-hover:text-xs text-light-400 line-through transition-all duration-300">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                      <span className="text-sm group-hover:text-xl font-bold text-light-100 transition-all duration-300">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      className="btn btn-primary text-sm py-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      В корзину
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-16 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Link to="/catalog">
              <button className="btn btn-primary text-lg px-10 py-5 hover:scale-105 transition-transform shadow-2xl">
                Смотреть все ароматы
                <ArrowRight className="w-6 h-6" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
