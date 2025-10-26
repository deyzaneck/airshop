import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Очищаем корзину после успешной оплаты
    window.dispatchEvent(new Event('cartUpdated'));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="card-dark text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-light-100 mb-4">
              Оплата прошла успешно!
            </h1>

            <p className="text-lg text-light-300 mb-2">
              Спасибо за ваш заказ!
            </p>

            {orderId && (
              <p className="text-light-400 mb-8">
                Номер заказа: <span className="font-mono text-peach-400">{orderId}</span>
              </p>
            )}

            <div className="bg-glass rounded-xl p-6 mb-8 text-left">
              <div className="flex items-start gap-4">
                <Package className="w-6 h-6 text-peach-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-light-100 mb-2">
                    Что дальше?
                  </h3>
                  <ul className="space-y-2 text-light-300 text-sm">
                    <li>✓ Мы отправили подтверждение на вашу электронную почту</li>
                    <li>✓ Ваш заказ принят в обработку</li>
                    <li>✓ Мы свяжемся с вами для уточнения деталей доставки</li>
                    <li>✓ Доставка занимает 2-5 рабочих дней</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <button className="btn btn-primary">
                  На главную
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/catalog">
                <button className="btn btn-secondary">
                  Продолжить покупки
                </button>
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-light-400 text-sm">
              Возникли вопросы? <Link to="/contact" className="text-peach-400 hover:underline">Свяжитесь с нами</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
