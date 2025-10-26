import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Send, ChevronUp } from 'lucide-react';
import { getSiteSettings } from '../../utils/adminHelpers';

const Footer = () => {
  const [settings, setSettings] = useState(getSiteSettings());

  useEffect(() => {
    setSettings(getSiteSettings());
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative mt-20 bg-glass backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* О компании */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-light-100">AirShop</h3>
            <p className="text-light-300 mb-4 text-sm leading-relaxed">
              {settings.description}
            </p>
            <div className="flex gap-3">
              <a 
                href={`https://t.me/${settings.telegram.replace('@', '')}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-icon hover:scale-110 transition-transform"
              >
                <Send className="w-5 h-5 text-light-200" />
              </a>
            </div>
          </div>

          {/* Каталог */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-light-100">Каталог</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/catalog" 
                  className="text-light-300 hover:text-peach-400 transition-colors text-sm"
                >
                  Все ароматы
                </Link>
              </li>
              <li>
                <Link 
                  to="/catalog?category=women" 
                  className="text-light-300 hover:text-peach-400 transition-colors text-sm"
                >
                  Женские
                </Link>
              </li>
              <li>
                <Link 
                  to="/catalog?category=men" 
                  className="text-light-300 hover:text-peach-400 transition-colors text-sm"
                >
                  Мужские
                </Link>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-light-100">Информация</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/about" 
                  className="text-light-300 hover:text-peach-400 transition-colors text-sm"
                >
                  О нас
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-light-300 hover:text-peach-400 transition-colors text-sm"
                >
                  Доставка
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-light-300 hover:text-peach-400 transition-colors text-sm"
                >
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-light-100">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-peach-400" />
                <a 
                  href={`mailto:${settings.email}`} 
                  className="text-light-300 hover:text-peach-400 transition-colors"
                >
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-peach-400" />
                <a 
                  href={`tel:${settings.phone.replace(/\s/g, '')}`} 
                  className="text-light-300 hover:text-peach-400 transition-colors"
                >
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Send className="w-4 h-4 text-peach-400" />
                <a 
                  href={`https://t.me/${settings.telegram.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-light-300 hover:text-peach-400 transition-colors"
                >
                  {settings.telegram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-glass/20 pt-8 flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-sm text-light-400">
            © {new Date().getFullYear()} AirShop. Все права защищены.
          </p>
        </div>
      </div>

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 btn-icon shadow-glass-lg hover:scale-110 transition-all z-30"
        aria-label="Наверх"
      >
        <ChevronUp className="w-6 h-6 text-light-200" />
      </button>
    </footer>
  );
};

export default Footer;
