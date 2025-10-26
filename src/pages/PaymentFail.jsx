import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const errorMessage = searchParams.get('error');

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Error Card */}
          <div className="card-dark text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-light-100 mb-4">
              Оплата не прошла
            </h1>

            <p className="text-lg text-light-300 mb-2">
              К сожалению, произошла ошибка при обработке платежа
            </p>

            {errorMessage && (
              <p className="text-red-400 mb-6">
                {errorMessage}
              </p>
            )}

            {orderId && (
              <p className="text-light-400 mb-8">
                Номер заказа: <span className="font-mono text-peach-400">{orderId}</span>
              </p>
            )}

            <div className="bg-glass rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-light-100 mb-3">
                Возможные причины:
              </h3>
              <ul className="space-y-2 text-light-300 text-sm">
                <li>• Недостаточно средств на карте</li>
                <li>• Неверно введены данные карты</li>
                <li>• Банк отклонил операцию</li>
                <li>• Истек срок действия карты</li>
                <li>• Технические неполадки</li>
              </ul>
            </div>

            <div className="bg-peach-400/10 border border-peach-400/30 rounded-xl p-4 mb-8">
              <p className="text-light-200 text-sm">
                💡 <strong>Совет:</strong> Проверьте данные вашей карты и попробуйте снова.
                Если проблема сохраняется, свяжитесь с вашим банком.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/checkout">
                <button className="btn btn-primary">
                  <RefreshCw className="w-5 h-5" />
                  Попробовать снова
                </button>
              </Link>
              <Link to="/cart">
                <button className="btn btn-secondary">
                  <ArrowLeft className="w-5 h-5" />
                  Вернуться в корзину
                </button>
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 text-center">
            <p className="text-light-400 text-sm mb-2">
              Нужна помощь?
            </p>
            <Link to="/contact" className="text-peach-400 hover:underline font-semibold">
              Свяжитесь с нашей службой поддержки
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
