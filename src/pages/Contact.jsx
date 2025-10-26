import React, { useState } from 'react';
import { Mail, Phone, Send } from 'lucide-react';
import { getSettings } from '../data/settings';

const Contact = () => {
  const settings = getSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-light-100 mb-4">
            Контакты
          </h1>
          <p className="text-lg text-light-300 max-w-2xl mx-auto">
            Свяжитесь с нами любым удобным способом
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="card-dark">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-peach-400 to-wine-500 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-light-100" />
                </div>
                <div>
                  <h3 className="font-bold text-light-100 mb-1">Email</h3>
                  <a 
                    href={`mailto:${settings.contacts.email}`}
                    className="text-peach-400 hover:text-peach-500 transition-colors"
                  >
                    {settings.contacts.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="card-dark">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-peach-400 to-wine-500 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-light-100" />
                </div>
                <div>
                  <h3 className="font-bold text-light-100 mb-1">Телефон</h3>
                  <a 
                    href={`tel:${settings.contacts.phone}`}
                    className="text-peach-400 hover:text-peach-500 transition-colors"
                  >
                    {settings.contacts.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="card-dark">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-peach-400 to-wine-500 flex items-center justify-center flex-shrink-0">
                  <Send className="w-6 h-6 text-light-100" />
                </div>
                <div>
                  <h3 className="font-bold text-light-100 mb-1">Telegram</h3>
                  <a 
                    href={settings.contacts.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-peach-400 hover:text-peach-500 transition-colors"
                  >
                    Написать в Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card-dark">
            <h2 className="text-2xl font-bold text-light-100 mb-6">Отправить сообщение</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-light-200 text-sm font-medium mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-light-200 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-light-200 text-sm font-medium mb-2">
                  Сообщение
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="4"
                  className="input resize-none"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Отправить
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
