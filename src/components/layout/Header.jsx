import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, TrendingUp } from 'lucide-react';
import { getCartCount } from '../../utils/helpers';
import { getProducts } from '../../data/products';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCartCount(getCartCount());

    const handleCartUpdate = () => {
      setCartCount(getCartCount());
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Закрытие подсказок при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Автодополнение
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const savedProducts = localStorage.getItem('products');
      const allProducts = savedProducts ? JSON.parse(savedProducts) : getProducts();

      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = allProducts
        .filter(p =>
          p.name.toLowerCase().includes(lowercaseQuery) ||
          p.brand.toLowerCase().includes(lowercaseQuery)
        )
        .slice(0, 5);

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSuggestions(false);

      // Сохранение в историю поиска
      const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      if (!searchHistory.includes(searchQuery.trim())) {
        searchHistory.unshift(searchQuery.trim());
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 5)));
      }
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product.id}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const popularSearches = ['Dior', 'Chanel', 'Versace', 'Tom Ford'];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-glass border-b border-glass backdrop-blur-xl shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-peach-400 to-wine-500 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
              <img
                src="/logo/logo.png"
                alt="AirShop Logo"
                className="h-12 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              />
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block animate-fade-in">AirShop</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/catalog"
              className="text-light-200 hover:text-peach-400 transition-all duration-300 font-medium relative group"
            >
              <span className="relative z-10">Каталог</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-peach-400 to-wine-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/about"
              className="text-light-200 hover:text-peach-400 transition-all duration-300 font-medium relative group"
            >
              <span className="relative z-10">О нас</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-peach-400 to-wine-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/shipping"
              className="text-light-200 hover:text-peach-400 transition-all duration-300 font-medium relative group"
            >
              <span className="relative z-10">Доставка</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-peach-400 to-wine-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/contact"
              className="text-light-200 hover:text-peach-400 transition-all duration-300 font-medium relative group"
            >
              <span className="relative z-10">Контакты</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-peach-400 to-wine-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:block flex-1 max-w-md mx-8" ref={searchRef}>
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-5 h-5 text-light-400 pointer-events-none z-10" />
                <input
                  type="text"
                  placeholder="Поиск ароматов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length > 1 && suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="w-full input"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-glass rounded-2xl shadow-glass-lg overflow-hidden z-50">
                  {suggestions.length > 0 && (
                    <div className="py-2">
                      <p className="px-4 py-2 text-xs text-light-400 uppercase font-semibold">
                        Товары
                      </p>
                      {suggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSuggestionClick(product)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-glass transition-colors text-left"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-light-400 uppercase tracking-wider font-semibold">
                              {product.brand}
                            </p>
                            <p className="text-sm text-light-100 font-medium truncate">
                              {product.name}
                            </p>
                            <p className="text-sm text-peach-400 font-semibold">
                              {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(product.price)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchQuery.trim().length <= 1 && (
                    <div className="py-2">
                      <p className="px-4 py-2 text-xs text-light-400 uppercase font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Популярные запросы
                      </p>
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            navigate(`/catalog?search=${encodeURIComponent(term)}`);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-light-200 hover:bg-glass hover:text-peach-400 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>

          {/* Icons */}
          <div className="flex items-center space-x-3">
            <Link to="/cart" className="btn-icon relative group hover:scale-110 transition-transform duration-300">
              <ShoppingCart className="w-5 h-5 transition-all duration-300 group-hover:text-peach-400" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-peach-400 to-wine-500 text-white text-xs flex items-center justify-center font-bold animate-pulse-glow shadow-lg">
                  {cartCount}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-peach-400 to-wine-500 rounded-xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300"></div>
            </Link>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn-icon md:hidden transition-transform duration-300 hover:scale-110 hover:rotate-90"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="lg:hidden pb-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-light-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск ароматов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full input"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-glass border-t border-glass">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              to="/catalog" 
              className="text-light-200 hover:text-peach-400 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Каталог
            </Link>
            <Link 
              to="/about" 
              className="text-light-200 hover:text-peach-400 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              О нас
            </Link>
            <Link 
              to="/shipping" 
              className="text-light-200 hover:text-peach-400 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Доставка
            </Link>
            <Link 
              to="/contact" 
              className="text-light-200 hover:text-peach-400 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Контакты
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
