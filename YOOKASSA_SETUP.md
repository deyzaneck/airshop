# Настройка оплаты через ЮКассу (Яндекс.Касса)

Этот документ описывает процесс подключения платежной системы ЮКасса к вашему сайту AirShop.

## 📋 Что уже готово

Интеграция с ЮКассой подготовлена и включает:

- ✅ Конфигурационные файлы для настройки API
- ✅ Утилиты для создания платежей
- ✅ Страницы успешной и неудачной оплаты
- ✅ UI для выбора способа оплаты (карта, СБП, наличные)
- ✅ Поддержка чеков для 54-ФЗ
- ✅ Тестовый режим для проверки работоспособности

## 🚀 Быстрый старт

### 1. Регистрация в ЮКассе

1. Зарегистрируйтесь на [yookassa.ru](https://yookassa.ru/)
2. Подключите юридическое лицо или ИП
3. Получите доступ к личному кабинету
4. Перейдите в раздел **Настройки → Интеграция**
5. Получите ваши реквизиты:
   - **shopId** (ID магазина)
   - **Секретный ключ** (Secret Key)

### 2. Настройка .env файла

1. Скопируйте файл `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Заполните свои данные в `.env`:
   ```env
   # Данные от ЮКассы
   REACT_APP_YOOKASSA_SHOP_ID=ваш_shop_id
   REACT_APP_YOOKASSA_SECRET_KEY=ваш_секретный_ключ

   # Режим работы (test или production)
   REACT_APP_PAYMENT_MODE=test
   ```

### 3. Настройка уведомлений в ЮКассе

В личном кабинете ЮКассы укажите URL для уведомлений:
- **URL для уведомлений**: `https://ваш-сайт.ru/api/payment/webhook`

## 🧪 Тестирование

Сейчас сайт работает в **тестовом режиме**. При оформлении заказа:
- Вы увидите информацию о созданном платеже в консоли
- Данные сохраняются локально
- Переход на реальную платежную форму не происходит

### Тестовые данные для проверки (когда настроите production):

**Успешная оплата:**
- Номер карты: `5555 5555 5555 4444`
- Срок: любой будущий месяц/год
- CVC: любые 3 цифры

**Отклоненная оплата:**
- Номер карты: `5555 5555 5555 5599`

Полный список тестовых карт: [документация ЮКассы](https://yookassa.ru/developers/payment-acceptance/testing-and-going-live/testing)

## ⚙️ Структура файлов

```
src/
├── config/
│   └── payment.js              # Конфигурация ЮКасса API
├── utils/
│   └── payment.js              # Утилиты для работы с платежами
├── pages/
│   ├── Checkout.jsx            # Страница оформления заказа
│   ├── PaymentSuccess.jsx      # Страница успешной оплаты
│   └── PaymentFail.jsx         # Страница ошибки оплаты
└── App.jsx                     # Роуты для платежных страниц
```

## 🔧 Настройка для Production

### ВАЖНО: Backend Required!

⚠️ **Для продакшена ОБЯЗАТЕЛЬНО нужен backend-сервер!**

Не храните секретные ключи в frontend коде!

### Создание Backend API

Необходимо создать следующие endpoints:

#### 1. Создание платежа
```
POST /api/payment/create
```

**Тело запроса:**
```json
{
  "amount": {
    "value": "100.00",
    "currency": "RUB"
  },
  "description": "Заказ №12345",
  "capture": true,
  "confirmation": {
    "type": "redirect",
    "return_url": "https://yoursite.com/payment/success"
  },
  "receipt": {
    "customer": {
      "email": "user@example.com",
      "phone": "+79991234567"
    },
    "items": [
      {
        "description": "Товар",
        "quantity": "1",
        "amount": {
          "value": "100.00",
          "currency": "RUB"
        },
        "vat_code": 1
      }
    ]
  }
}
```

**Ответ:**
```json
{
  "success": true,
  "payment_id": "abc123-def456",
  "confirmation_url": "https://yoomoney.ru/checkout/payments/v2/contract?...",
  "status": "pending"
}
```

#### 2. Проверка статуса
```
GET /api/payment/status/:paymentId
```

**Ответ:**
```json
{
  "success": true,
  "status": "succeeded",
  "payment_id": "abc123-def456",
  "amount": {
    "value": "100.00",
    "currency": "RUB"
  }
}
```

#### 3. Webhook для уведомлений
```
POST /api/payment/webhook
```

Этот endpoint будет получать уведомления от ЮКассы о статусе платежей.

### Пример Backend (Node.js + Express)

```javascript
// server.js
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const YOOKASSA_CONFIG = {
  shopId: process.env.YOOKASSA_SHOP_ID,
  secretKey: process.env.YOOKASSA_SECRET_KEY,
  apiUrl: 'https://api.yookassa.ru/v3'
};

// Базовая авторизация для API ЮКассы
const getAuthHeader = () => {
  const credentials = Buffer.from(
    `${YOOKASSA_CONFIG.shopId}:${YOOKASSA_CONFIG.secretKey}`
  ).toString('base64');
  return `Basic ${credentials}`;
};

// Создание платежа
app.post('/api/payment/create', async (req, res) => {
  try {
    const idempotenceKey = crypto.randomUUID();

    const response = await axios.post(
      `${YOOKASSA_CONFIG.apiUrl}/payments`,
      req.body,
      {
        headers: {
          'Authorization': getAuthHeader(),
          'Idempotence-Key': idempotenceKey,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      payment_id: response.data.id,
      confirmation_url: response.data.confirmation.confirmation_url,
      status: response.data.status
    });
  } catch (error) {
    console.error('Ошибка создания платежа:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.description || error.message
    });
  }
});

// Проверка статуса платежа
app.get('/api/payment/status/:paymentId', async (req, res) => {
  try {
    const response = await axios.get(
      `${YOOKASSA_CONFIG.apiUrl}/payments/${req.params.paymentId}`,
      {
        headers: {
          'Authorization': getAuthHeader()
        }
      }
    );

    res.json({
      success: true,
      status: response.data.status,
      payment_id: response.data.id,
      amount: response.data.amount
    });
  } catch (error) {
    console.error('Ошибка проверки статуса:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook для уведомлений от ЮКассы
app.post('/api/payment/webhook', async (req, res) => {
  try {
    const notification = req.body;

    console.log('Получено уведомление от ЮКассы:', notification);

    // Обработка уведомления
    if (notification.event === 'payment.succeeded') {
      const payment = notification.object;

      // Здесь обновите статус заказа в вашей БД
      console.log(`Платеж ${payment.id} успешно оплачен`);

      // Пример: updateOrderStatus(payment.metadata.order_id, 'paid');
    }

    if (notification.event === 'payment.canceled') {
      const payment = notification.object;
      console.log(`Платеж ${payment.id} отменен`);

      // Пример: updateOrderStatus(payment.metadata.order_id, 'canceled');
    }

    // Обязательно отвечаем 200 OK
    res.status(200).send('OK');
  } catch (error) {
    console.error('Ошибка обработки webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Payment API запущен на порту ${PORT}`);
});
```

### Обновление Frontend для Production

В файле `src/utils/payment.js` раскомментируйте и используйте реальные API запросы:

```javascript
// Вместо тестового режима используйте:
const response = await fetch('/api/payment/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotence-Key': idempotenceKey
  },
  body: JSON.stringify(paymentData)
});

const result = await response.json();

if (result.success) {
  return {
    success: true,
    payment_id: result.payment_id,
    confirmation_url: result.confirmation_url,
    status: result.status
  };
}
```

## 📖 Документация ЮКассы

Официальная документация:
- [Главная страница](https://yookassa.ru/)
- [Документация API](https://yookassa.ru/developers/api)
- [Быстрый старт](https://yookassa.ru/developers/payment-acceptance/getting-started/quick-start)
- [Тестирование](https://yookassa.ru/developers/payment-acceptance/testing-and-going-live/testing)

## 🎨 Способы оплаты

ЮКасса поддерживает множество способов оплаты:

1. **Банковские карты** - Visa, Mastercard, МИР
2. **ЮMoney** - электронный кошелек
3. **СБП** - Система быстрых платежей
4. **Сбербанк Онлайн**
5. **Альфа-Клик**
6. **Тинькофф**
7. **QIWI Wallet**
8. **WebMoney**
9. **Наличные** - через терминалы

На сайте доступны 3 основных варианта:
- **Банковская карта** - онлайн оплата (поддерживает все методы ЮКассы)
- **СБП** - оплата через Систему быстрых платежей
- **При получении** - наличными или картой курьеру

## 💰 Комиссии

Комиссии ЮКассы зависят от вашего тарифа:
- Обычно 2.8% - 3.5% от суммы платежа
- Минимальная комиссия при больших оборотах
- Для ИП возможны специальные условия

Актуальные тарифы: [yookassa.ru/fees](https://yookassa.ru/fees)

## 🔒 Безопасность

- Все платежи проходят через защищенную форму ЮКассы
- Сертификация PCI DSS Level 1
- 3-D Secure для дополнительной защиты
- Данные карт не хранятся на вашем сервере
- SSL сертификат обязателен для production

## 📞 Поддержка

Если возникли вопросы:
- **Email**: cms@yoomoney.ru
- **Телефон**: 8 800 250-66-99
- **Документация**: https://yookassa.ru/developers
- **Telegram**: @yookassa_support

## ✅ Чеклист перед запуском

- [ ] Зарегистрировались в ЮКассе
- [ ] Получили shopId и secretKey
- [ ] Настроили `.env` файл
- [ ] Создали backend для обработки платежей
- [ ] Настроили webhook URL в ЮКассе
- [ ] Протестировали оплату тестовыми картами
- [ ] Настроили URLs для success/fail страниц
- [ ] Установили SSL сертификат
- [ ] Проверили соответствие 54-ФЗ (если нужна касса)
- [ ] Переключили на production режим
- [ ] Проверили все способы оплаты

## 🐛 Troubleshooting

### Платеж не создается
- Проверьте правильность shopId и secretKey
- Убедитесь что backend запущен и доступен
- Проверьте консоль браузера на наличие ошибок
- Проверьте логи backend сервера

### Не работает переход на форму оплаты
- Проверьте что `REACT_APP_PAYMENT_MODE=production`
- Убедитесь что backend возвращает правильный `confirmation_url`
- Проверьте что SSL сертификат установлен

### Webhook не получает уведомления
- Убедитесь что URL указан правильно в настройках ЮКассы
- Проверьте что endpoint доступен извне (не localhost)
- Убедитесь что webhook отвечает статусом 200

### Ошибка "Backend не настроен"
- Это нормально в тестовом режиме
- Создайте backend API endpoints как описано выше
- Обновите frontend код для работы с реальным API

## 🔄 Обновление с тестового на production

1. Смените режим в `.env`:
   ```env
   REACT_APP_PAYMENT_MODE=production
   ```

2. Убедитесь что backend использует production credentials

3. Обновите return_url на реальный домен вашего сайта

4. Протестируйте с реальной картой на небольшой сумме

5. Настройте мониторинг платежей

## 📊 Отчетность

В личном кабинете ЮКассы вы можете:
- Просматривать все платежи
- Экспортировать отчеты
- Делать возвраты
- Смотреть статистику
- Настраивать уведомления

---

**Готово!** Ваш сайт подготовлен для приема платежей через ЮКассу 🎉
