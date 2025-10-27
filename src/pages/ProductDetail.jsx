import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, ZoomIn, ZoomOut } from 'lucide-react';
import { productsAPI } from '../api/services';
import { formatPrice, addToCart } from '../utils/helpers';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Загружаем товар из API
    const loadProduct = async () => {
      try {
        const foundProduct = await productsAPI.getById(parseInt(id));

        if (!foundProduct) {
          navigate('/catalog');
          return;
        }

        // Добавляем дополнительные изображения (используем то же изображение для демо)
        if (!foundProduct.images) {
          foundProduct.images = [
        foundProduct.image,
        foundProduct.image,
        foundProduct.image,
      ];
        }

        setProduct(foundProduct);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('Ошибка загрузки товара:', error);
        navigate('/catalog');
      }
    };

    loadProduct();
  }, [id, navigate]);

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="loading"></div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    window.dispatchEvent(new Event('cartUpdated'));
    alert(`${product.name} добавлен в корзину!`);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/catalog"
          className="inline-flex items-center text-light-200 hover:text-peach-400 transition-all duration-300 mb-8 group animate-fade-in"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-2 transition-transform duration-300" />
          Вернуться в каталог
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image Gallery */}
          <div className="space-y-4 animate-slide-in-left">
            {/* Main Image */}
            <div className="card-dark relative group hover-glow">
              <div
                className="aspect-[3/4] bg-light-100 rounded-2xl overflow-hidden relative cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={
                    isZoomed
                      ? {
                          transform: `scale(2)`,
                          transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                        }
                      : {}
                  }
                />
                {product.discount > 0 && (
                  <span className="badge badge-accent absolute top-4 right-4 z-10">
                    -{product.discount}%
                  </span>
                )}
                {product.isNew && (
                  <span className="badge badge-outline absolute top-4 left-4 bg-dark-900 z-10">
                    Новинка
                  </span>
                )}

                {/* Zoom Indicator */}
                <div className="absolute bottom-4 right-4 z-10 bg-dark-900/80 backdrop-blur-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {isZoomed ? (
                    <ZoomOut className="w-4 h-4 text-light-100" />
                  ) : (
                    <ZoomIn className="w-4 h-4 text-light-100" />
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-peach-400 shadow-peach'
                      : 'border-glass hover:border-peach-400/50'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} - изображение ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="card-dark animate-slide-in-right space-y-6">
            <div className="animate-fade-in-up">
              <p className="text-sm text-peach-400 uppercase tracking-wider mb-2 font-bold">
                {product.brand}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <span className="text-light-300 text-lg bg-glass px-4 py-2 rounded-xl border border-glass">{product.volume}</span>
            </div>

            <div className="flex items-baseline gap-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              {product.oldPrice && (
                <span className="text-xl text-light-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
              <span className="text-4xl font-bold text-gradient-gold animate-pulse-glow">
                {formatPrice(product.price)}
              </span>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-light-100 mb-3">Описание</h3>
              <p className="text-light-300 leading-relaxed">
                {product.description || 'Роскошный аромат, созданный для особых моментов. Сочетание изысканных нот создает неповторимую композицию, которая подчеркнет вашу индивидуальность.'}
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-light-100 mb-3">Ноты аромата</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-peach-400 font-semibold">Верхние ноты:</span>
                  <span className="text-light-300 ml-2">
                    {product.notes?.top || 'Бергамот, Цитрус, Зеленые ноты'}
                  </span>
                </div>
                <div>
                  <span className="text-peach-400 font-semibold">Ноты сердца:</span>
                  <span className="text-light-300 ml-2">
                    {product.notes?.heart || 'Роза, Жасмин, Пион'}
                  </span>
                </div>
                <div>
                  <span className="text-peach-400 font-semibold">Базовые ноты:</span>
                  <span className="text-light-300 ml-2">
                    {product.notes?.base || 'Мускус, Амбра, Ваниль'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center border border-glass rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-peach-400/10 text-light-200 transition-colors"
                >
                  -
                </button>
                <span className="px-6 py-3 font-semibold text-light-100 bg-glass">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-peach-400/10 text-light-200 transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="btn btn-primary flex-1"
              >
                <ShoppingCart className="w-5 h-5" />
                Добавить в корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
