import React from 'react';
import { Shield, Award, Users, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-light-100 mb-4">
            О нас
          </h1>
          <p className="text-lg text-light-300 max-w-2xl mx-auto">
            Ваш надежный партнер в мире премиальной парфюмерии
          </p>
        </div>

        <div className="card-dark p-8 md:p-12 mb-12 max-w-5xl mx-auto">
          <div className="space-y-6 text-light-200 leading-relaxed">
            <p className="text-xl md:text-2xl text-light-100 font-semibold mb-6">
              <span className="text-peach-400">AirShop</span> — это премиальный интернет-магазин оригинальных брендовых духов с гарантией подлинности каждого товара.
            </p>
            <p className="text-lg">
              Мы работаем напрямую с официальными дистрибьюторами и поставщиками, что позволяет нам гарантировать 100% оригинальность всей парфюмерии в нашем каталоге.
            </p>
            <p className="text-lg">
              Наша миссия — сделать премиальные ароматы доступными для каждого, обеспечивая при этом высочайшее качество обслуживания и быструю доставку по всей России.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-dark p-8 text-center group hover:scale-105 transition-transform">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-peach-400 to-wine-500 flex items-center justify-center">
              <Shield className="w-10 h-10 text-light-100" />
            </div>
            <h3 className="text-xl font-bold text-light-100 mb-3">
              100% оригинал
            </h3>
            <p className="text-light-300">
              Гарантия подлинности каждого товара
            </p>
          </div>

          <div className="card-dark p-8 text-center group hover:scale-105 transition-transform">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-peach-400 to-wine-500 flex items-center justify-center">
              <Award className="w-10 h-10 text-light-100" />
            </div>
            <h3 className="text-xl font-bold text-light-100 mb-3">
              Премиум качество
            </h3>
            <p className="text-light-300">
              Только известные мировые бренды
            </p>
          </div>

          <div className="card-dark p-8 text-center group hover:scale-105 transition-transform">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-peach-400 to-wine-500 flex items-center justify-center">
              <Users className="w-10 h-10 text-light-100" />
            </div>
            <h3 className="text-xl font-bold text-light-100 mb-3">
              10 000+ клиентов
            </h3>
            <p className="text-light-300">
              Довольных покупателей по всей России
            </p>
          </div>

          <div className="card-dark p-8 text-center group hover:scale-105 transition-transform">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-peach-400 to-wine-500 flex items-center justify-center">
              <Heart className="w-10 h-10 text-light-100" />
            </div>
            <h3 className="text-xl font-bold text-light-100 mb-3">
              5 лет опыта
            </h3>
            <p className="text-light-300">
              На рынке премиальной парфюмерии
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
