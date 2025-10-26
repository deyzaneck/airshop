// Конфигурация для платежной системы ЮКасса (Яндекс)

export const PAYMENT_CONFIG = {
  // Режим работы: 'test' или 'production'
  mode: 'test',

  // Настройки для ЮКасса
  yookassa: {
    // ID магазина (получается при регистрации в ЮКассе)
    shopId: process.env.REACT_APP_YOOKASSA_SHOP_ID || '',

    // Секретный ключ (ВАЖНО: в продакшене хранить только на backend!)
    secretKey: process.env.REACT_APP_YOOKASSA_SECRET_KEY || '',

    // URL API ЮКассы
    apiUrl: 'https://api.yookassa.ru/v3',

    // URL для возврата после успешной оплаты
    returnUrl: window.location.origin + '/payment/success',

    // Валюта (RUB - российский рубль)
    currency: 'RUB',

    // Описание по умолчанию
    description: 'Оплата заказа в AirShop',

    // Автоматический захват платежа
    // true - деньги списываются сразу
    // false - деньги блокируются, нужно подтверждение
    capture: true,

    // Сохранение платежного метода для повторных платежей
    savePaymentMethod: false,

    // Подтверждение по email
    receiptEmail: true,

    // НДС (по умолчанию)
    // 1 - без НДС
    // 2 - НДС 0%
    // 3 - НДС 10%
    // 4 - НДС 20%
    // 6 - НДС 20/120
    vatCode: 1
  },

  // Статусы платежей
  paymentStatus: {
    PENDING: 'pending',           // Ожидает оплаты
    WAITING_FOR_CAPTURE: 'waiting_for_capture', // Ожидает подтверждения
    SUCCEEDED: 'succeeded',       // Успешно оплачен
    CANCELED: 'canceled'          // Отменен
  },

  // Методы оплаты ЮКассы
  paymentMethods: {
    BANK_CARD: 'bank_card',       // Банковская карта
    YOO_MONEY: 'yoo_money',       // ЮMoney
    SBP: 'sbp',                   // Система быстрых платежей
    SBERBANK: 'sberbank',         // Сбербанк Онлайн
    QIWI: 'qiwi',                 // QIWI Wallet
    WEBMONEY: 'webmoney',         // WebMoney
    ALFABANK: 'alfabank',         // Альфа-Клик
    TINKOFF_BANK: 'tinkoff_bank', // Тинькофф
    CASH: 'cash'                  // Наличные (офлайн)
  }
};

// Функция получения API URL
export const getApiUrl = () => {
  return PAYMENT_CONFIG.yookassa.apiUrl;
};

// Проверка наличия необходимых credentials
export const isPaymentConfigured = () => {
  const { shopId, secretKey } = PAYMENT_CONFIG.yookassa;
  return !!(shopId && secretKey);
};

// Получить базовую авторизацию для API запросов
export const getAuthHeader = () => {
  const { shopId, secretKey } = PAYMENT_CONFIG.yookassa;
  const credentials = btoa(`${shopId}:${secretKey}`);
  return `Basic ${credentials}`;
};

export default PAYMENT_CONFIG;
