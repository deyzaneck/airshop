import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid, List, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { productsAPI } from '../api/services';
import { formatPrice, addToCart } from '../utils/helpers';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [category, setCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(true);

  // Фильтры
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [selectedVolumes, setSelectedVolumes] = useState([]);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const categoryParam = searchParams.get('category') || 'all';
    setCategory(categoryParam);

    // Загружаем товары из API
    const loadProducts = async () => {
      try {
        const params = {};
        if (categoryParam && categoryParam !== 'all') {
          params.category = categoryParam;
        }
        const products = await productsAPI.getAll(params);
        setAllProducts(products);
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        setAllProducts([]);
      }
    };

    loadProducts();
    window.scrollTo(0, 0);
  }, [searchParams]);

  // Получаем уникальные бренды и объемы
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(allProducts.map(p => p.brand))];

    // Топ-5 популярных брендов (можно настроить)
    const popularBrands = ['VERSACE', 'DIOR', 'CHANEL', 'TOM FORD', 'BYREDO'];

    // Разделяем на популярные и остальные
    const popular = popularBrands.filter(brand => uniqueBrands.includes(brand));
    const others = uniqueBrands
      .filter(brand => !popularBrands.includes(brand))
      .sort();

    return { popular, others };
  }, [allProducts]);

  const volumes = useMemo(() => {
    const uniqueVolumes = [...new Set(allProducts.map(p => p.volume))].sort();
    return uniqueVolumes;
  }, [allProducts]);

  // Фильтрация и сортировка
  const products = useMemo(() => {
    const searchQuery = searchParams.get('search') || '';

    let filtered = [...allProducts];

    // Фильтр по видимости (только видимые товары)
    filtered = filtered.filter(p => p.isVisible !== false);

    // Фильтр по категории
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    // Фильтр по поиску
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.brand.toLowerCase().includes(lowercaseQuery) ||
        (p.description && p.description.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Фильтр по брендам
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    // Фильтр по ценовому диапазону
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Фильтр по объему
    if (selectedVolumes.length > 0) {
      filtered = filtered.filter(p => selectedVolumes.includes(p.volume));
    }

    // Сортировка
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'new':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // По умолчанию - как в массиве
        break;
    }

    return filtered;
  }, [allProducts, category, searchParams, selectedBrands, priceRange, selectedVolumes, sortBy]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    window.dispatchEvent(new Event('cartUpdated'));
    alert(`${product.name} добавлен в корзину!`);
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const toggleVolume = (volume) => {
    setSelectedVolumes(prev =>
      prev.includes(volume)
        ? prev.filter(v => v !== volume)
        : [...prev, volume]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, 20000]);
    setSelectedVolumes([]);
    setSortBy('default');
  };

  const activeFiltersCount = selectedBrands.length + selectedVolumes.length + (sortBy !== 'default' ? 1 : 0);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-light-100 mb-2">
            Каталог ароматов
          </h1>
          <p className="text-lg text-light-300">
            {products.length} {products.length === 1 ? 'аромат' : products.length < 5 ? 'аромата' : 'ароматов'}
          </p>
        </div>

        {/* Filter Toggle & Sorting */}
        <div className="card-dark p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-secondary flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Фильтры</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-peach-400 text-dark-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-light-400 hover:text-peach-400 text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Сбросить фильтры
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg border transition-all ${
                    viewMode === 'grid'
                      ? 'bg-peach-400/20 border-peach-400 text-peach-400'
                      : 'bg-glass border-glass text-light-300 hover:text-peach-400'
                  }`}
                  title="Сетка"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg border transition-all ${
                    viewMode === 'list'
                      ? 'bg-peach-400/20 border-peach-400 text-peach-400'
                      : 'bg-glass border-glass text-light-300 hover:text-peach-400'
                  }`}
                  title="Список"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input py-2 text-sm"
              >
                <option value="default">По умолчанию</option>
                <option value="price-asc">Цена: по возрастанию</option>
                <option value="price-desc">Цена: по убыванию</option>
                <option value="name-asc">По названию (А-Я)</option>
                <option value="new">Сначала новинки</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card-dark p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-light-200 font-semibold mb-3">
                  Категория
                </label>
                <div className="space-y-2">
                  {['all', 'women', 'men', 'unisex'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={category === cat}
                        onChange={() => setCategory(cat)}
                        className="w-4 h-4 text-peach-400 bg-glass border-glass focus:ring-peach-400"
                      />
                      <span className="text-light-300 group-hover:text-light-100 transition-colors">
                        {cat === 'all' ? 'Все' : cat === 'women' ? 'Женские' : cat === 'men' ? 'Мужские' : 'Унисекс'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-light-200 font-semibold mb-3">
                  Бренд
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {/* Popular Brands */}
                  {brands.popular.length > 0 && (
                    <>
                      <p className="text-xs text-peach-400 uppercase font-bold mb-2">Популярные</p>
                      {brands.popular.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 rounded text-peach-400 bg-glass border-glass focus:ring-peach-400"
                          />
                          <span className="text-light-300 group-hover:text-light-100 transition-colors text-sm font-semibold">
                            {brand}
                          </span>
                        </label>
                      ))}
                      {brands.others.length > 0 && <div className="border-t border-glass my-2"></div>}
                    </>
                  )}

                  {/* Other Brands (Alphabetical) */}
                  {brands.others.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="w-4 h-4 rounded text-peach-400 bg-glass border-glass focus:ring-peach-400"
                      />
                      <span className="text-light-300 group-hover:text-light-100 transition-colors text-sm">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-light-200 font-semibold mb-3">
                  Цена
                </label>
                <div className="space-y-3">
                  <div className="relative pt-1">
                    <div className="flex justify-between text-sm text-light-300 mb-2">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                    <div className="relative h-2 bg-glass rounded-full">
                      {/* Range Track */}
                      <div
                        className="absolute h-2 bg-gradient-to-r from-peach-400 to-wine-500 rounded-full"
                        style={{
                          left: `${(priceRange[0] / 20000) * 100}%`,
                          right: `${100 - (priceRange[1] / 20000) * 100}%`,
                        }}
                      />
                      {/* Min Handle */}
                      <input
                        type="range"
                        min="0"
                        max="20000"
                        step="500"
                        value={priceRange[0]}
                        onChange={(e) => {
                          const newMin = parseInt(e.target.value);
                          if (newMin < priceRange[1]) {
                            setPriceRange([newMin, priceRange[1]]);
                          }
                        }}
                        className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-peach-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-dark-900 [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-peach-400 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-dark-900 [&::-moz-range-thumb]:shadow-lg"
                        style={{ zIndex: priceRange[0] > 10000 ? 5 : 3 }}
                      />
                      {/* Max Handle */}
                      <input
                        type="range"
                        min="0"
                        max="20000"
                        step="500"
                        value={priceRange[1]}
                        onChange={(e) => {
                          const newMax = parseInt(e.target.value);
                          if (newMax > priceRange[0]) {
                            setPriceRange([priceRange[0], newMax]);
                          }
                        }}
                        className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-wine-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-dark-900 [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-wine-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-dark-900 [&::-moz-range-thumb]:shadow-lg"
                        style={{ zIndex: 4 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Volume Filter */}
              <div>
                <label className="block text-light-200 font-semibold mb-3">
                  Объем
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {volumes.map((volume) => (
                    <label key={volume} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedVolumes.includes(volume)}
                        onChange={() => toggleVolume(volume)}
                        className="w-4 h-4 rounded text-peach-400 bg-glass border-glass focus:ring-peach-400"
                      />
                      <span className="text-light-300 group-hover:text-light-100 transition-colors text-sm">
                        {volume}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid/List */}
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {products.map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className={`group relative overflow-hidden rounded-2xl border border-glass hover:border-peach-400 transition-all duration-500 hover-lift hover-glow animate-scale-in ${
                viewMode === 'grid' ? 'aspect-[3/4]' : 'aspect-[5/2] md:aspect-[6/1]'
              }`}
              style={{animationDelay: `${index * 0.05}s`}}
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

              {/* Content - адаптивный для grid/list */}
              <div className={`absolute z-10 transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bottom-0 left-0 right-0 p-3 transform translate-y-0 group-hover:-translate-y-2'
                  : 'inset-0 flex items-center'
              }`}>
                {viewMode === 'grid' ? (
                  // Grid layout
                  <>
                    <div className="w-full">
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
                  </>
                ) : (
                  // List layout - горизонтальный
                  <div className="flex items-center gap-4 md:gap-6 px-4 w-full">
                    {/* Левая часть - текст */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-peach-400 uppercase tracking-wider mb-1 font-bold">
                        {product.brand}
                      </p>
                      <h3 className="text-base md:text-lg font-bold text-light-100 mb-1 line-clamp-1 group-hover:text-peach-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-light-300 mb-2">
                        {product.volume}
                      </p>

                      {/* Цены */}
                      <div className="flex items-baseline gap-3">
                        {product.oldPrice && (
                          <span className="text-sm text-light-400 line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                        <span className="text-xl md:text-2xl font-bold text-light-100">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>

                    {/* Правая часть - кнопка */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        className="btn btn-primary text-sm py-2 px-4 md:py-3 md:px-6"
                      >
                        В корзину
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="card-dark p-16 text-center">
            <p className="text-2xl text-light-200">
              Товары не найдены
            </p>
            <p className="text-light-400 mt-2">
              Попробуйте изменить параметры фильтрации
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
