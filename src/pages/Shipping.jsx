import React from 'react';
import { Package, Truck, MapPin } from 'lucide-react';
import { getSettings } from '../data/settings';
import { formatPrice } from '../utils/helpers';

const Shipping = () => {
  const settings = getSettings();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-light-100 mb-4">
            Доставка
          </h1>
          <p className="text-lg text-light-300 max-w-2xl mx-auto">
            Быстрая и надежная доставка по всей России
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {settings.shipping.methods.map((method) => (
            <div key={method.id} className="card-dark">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-peach-400 to-wine-500 flex items-center justify-center flex-shrink-0">
                  {method.id === 'sdek' ? (
                    <Truck className="w-6 h-6 text-light-100" />
                  ) : (
                    <MapPin className="w-6 h-6 text-light-100" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-light-100 mb-2">{method.name}</h3>
                  <p className="text-light-300 mb-3">{method.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-light-300 text-sm">{method.days}</span>
                    <span className="text-peach-400 font-bold text-lg">
                      {method.price === 0 ? 'Бесплатно' : formatPrice(method.price)}
                    </span>
                  </div>
                  {method.freeFrom > 0 && (
                    <p className="text-sm text-light-400 mt-2">
                      Бесплатная доставка от {formatPrice(method.freeFrom)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-dark p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-light-100 mb-4">Важная информация</h2>
          <ul className="space-y-3 text-light-300">
            <li className="flex items-start gap-3">
              <Package className="w-5 h-5 text-peach-400 flex-shrink-0 mt-1" />
              <span>Все товары тщательно упаковываются перед отправкой</span>
            </li>
            <li className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-peach-400 flex-shrink-0 mt-1" />
              <span>После отправки вы получите трек-номер для отслеживания</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-peach-400 flex-shrink-0 mt-1" />
              <span>Доставка осуществляется по всей территории России</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
