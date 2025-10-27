// Утилиты для работы с платежной системой ЮКасса (Яндекс)

import { PAYMENT_CONFIG } from '../config/payment';

// Генератор UUID v4 (упрощенная версия)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

/**
 * Создание платежа в ЮКассе
 * @param {Object} orderData - Данные заказа
 * @param {number} amount - Сумма в рублях
 * @returns {Promise<Object>} - Объект с URL для оплаты и payment_id
 */
export const createPayment = async (orderData, amount) => {
  try {
    // const idempotenceKey = generateUUID(); // Уникальный ключ для предотвращения дублирования

    const paymentData = {
      amount: {
        value: amount.toFixed(2), // ЮКасса требует строку с 2 знаками после запятой
        currency: PAYMENT_CONFIG.yookassa.currency
      },
      capture: PAYMENT_CONFIG.yookassa.capture,
      confirmation: {
        type: 'redirect',
        return_url: PAYMENT_CONFIG.yookassa.returnUrl
      },
      description: `${PAYMENT_CONFIG.yookassa.description} №${orderData.id || 'NEW'}`,
      metadata: {
        order_id: orderData.id,
        customer_name: orderData.customer,
        customer_email: orderData.contactInfo?.email,
        customer_phone: orderData.contactInfo?.phone
      },
      // Чек для 54-ФЗ (если у вас есть касса)
      receipt: {
        customer: {
          email: orderData.contactInfo?.email || 'noreply@airshop.ru',
          phone: orderData.contactInfo?.phone
        },
        items: orderData.items?.map(item => ({
          description: item.name,
          quantity: item.quantity.toString(),
          amount: {
            value: item.price.toFixed(2),
            currency: PAYMENT_CONFIG.yookassa.currency
          },
          vat_code: PAYMENT_CONFIG.yookassa.vatCode,
          payment_mode: 'full_prepayment',
          payment_subject: 'commodity'
        })) || []
      }
    };

    // ВАЖНО: В реальном приложении этот запрос должен идти через backend
    // Не храните секретные ключи в frontend коде!

    // Для тестирования возвращаем mock данные
    if (PAYMENT_CONFIG.mode === 'test') {
      console.log('🔄 Создание тестового платежа ЮКасса:', paymentData);

      return {
        success: true,
        payment_id: `test-${generateUUID()}`,
        confirmation_url: '#test-payment',
        status: 'pending',
        paymentData: paymentData,
        message: 'Тестовый режим: платеж создан локально'
      };
    }

    // В production режиме запрос должен идти через ваш backend
    // Пример серверного API endpoint:
    // const response = await fetch('/api/payment/create', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Idempotence-Key': idempotenceKey
    //   },
    //   body: JSON.stringify(paymentData)
    // });

    console.warn('⚠️ ВНИМАНИЕ: Настройте backend для работы с ЮКасса API');

    return {
      success: false,
      error: 'Backend не настроен. Создайте API endpoint для работы с ЮКассой.'
    };

  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Проверка статуса платежа
 * @param {string} paymentId - ID платежа
 * @returns {Promise<Object>} - Статус платежа
 */
export const checkPaymentStatus = async (paymentId) => {
  try {
    // В продакшене это должен быть запрос к вашему backend
    // который проверит статус в ЮКассе

    // Пример: const response = await fetch(`/api/payment/status/${paymentId}`);

    if (PAYMENT_CONFIG.mode === 'test') {
      return {
        success: true,
        status: PAYMENT_CONFIG.paymentStatus.PENDING,
        payment_id: paymentId
      };
    }

    console.warn('⚠️ Настройте backend для проверки статуса платежа');

    return {
      success: false,
      error: 'Backend не настроен'
    };

  } catch (error) {
    console.error('Ошибка проверки статуса:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Отмена платежа
 * @param {string} paymentId - ID платежа
 * @returns {Promise<Object>}
 */
export const cancelPayment = async (paymentId) => {
  try {
    if (PAYMENT_CONFIG.mode === 'test') {
      console.log('🔄 Отмена тестового платежа:', paymentId);
      return {
        success: true,
        payment_id: paymentId,
        status: 'canceled'
      };
    }

    // В production через backend
    // const response = await fetch(`/api/payment/cancel/${paymentId}`, {
    //   method: 'POST'
    // });

    console.warn('⚠️ Настройте backend для отмены платежей');

    return {
      success: false,
      error: 'Backend не настроен'
    };

  } catch (error) {
    console.error('Ошибка отмены платежа:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Сохранение информации о платеже в localStorage
 * @param {Object} paymentInfo - Информация о платеже
 */
export const savePaymentInfo = (paymentInfo) => {
  try {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    payments.push({
      ...paymentInfo,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('payments', JSON.stringify(payments));
  } catch (error) {
    console.error('Ошибка сохранения информации о платеже:', error);
  }
};

/**
 * Получение всех платежей из localStorage
 * @returns {Array} - Массив платежей
 */
export const getPayments = () => {
  try {
    return JSON.parse(localStorage.getItem('payments') || '[]');
  } catch (error) {
    console.error('Ошибка получения платежей:', error);
    return [];
  }
};

/**
 * Генерация уникального номера заказа
 * @returns {string} - Номер заказа
 */
export const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `AirShop-${timestamp}-${random}`;
};

/**
 * Форматирование суммы для ЮКассы
 * @param {number} amount - Сумма в рублях
 * @returns {string} - Форматированная сумма с 2 знаками
 */
export const formatPaymentAmount = (amount) => {
  return amount.toFixed(2);
};

const paymentUtils = {
  createPayment,
  checkPaymentStatus,
  cancelPayment,
  savePaymentInfo,
  getPayments,
  generateOrderNumber,
  formatPaymentAmount
};

export default paymentUtils;
