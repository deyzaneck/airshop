# AirShop Backend Architecture

Полная документация архитектуры Flask бэкенда для интернет-магазина AirShop.

## Обзор

AirShop backend - это RESTful API сервер, построенный на Flask, обеспечивающий:
- Управление товарами (CRUD)
- Обработку заказов
- Интеграцию платежной системы ЮКасса
- Аутентификацию администраторов
- Управление настройками сайта

## Технологический стек

### Core
- **Python 3.8+** - язык программирования
- **Flask 3.0** - веб-фреймворк
- **SQLAlchemy 2.0** - ORM для работы с БД
- **Flask-Migrate** - миграции БД

### Безопасность
- **Flask-JWT-Extended** - JWT аутентификация
- **Flask-Bcrypt** - хэширование паролей
- **Flask-Limiter** - защита от DDoS и rate limiting
- **Flask-CORS** - CORS для взаимодействия с фронтендом

### Интеграции
- **requests** - HTTP клиент для API ЮКассы
- **python-dotenv** - управление переменными окружения

### Production
- **Gunicorn** - WSGI сервер для production
- **PostgreSQL** - рекомендуемая БД для production
- **SQLite** - БД по умолчанию для development

## Структура проекта

```
backend/
│
├── app/                        # Основное приложение
│   ├── __init__.py            # Инициализация Flask app, расширений
│   │                          # Фабрика приложения create_app()
│   │
│   ├── models/                # Модели базы данных (SQLAlchemy)
│   │   ├── __init__.py        # Экспорт всех моделей
│   │   ├── product.py         # Модель Product
│   │   ├── order.py           # Модели Order и OrderItem
│   │   └── user.py            # Модель User (администратор)
│   │
│   ├── routes/                # API endpoints (Flask Blueprints)
│   │   ├── __init__.py
│   │   ├── auth.py            # /api/auth/* - аутентификация
│   │   ├── products.py        # /api/products/* - управление товарами
│   │   ├── orders.py          # /api/orders/* - управление заказами
│   │   ├── payment.py         # /api/payment/* - платежи ЮКасса
│   │   └── settings.py        # /api/settings/* - настройки сайта
│   │
│   ├── services/              # Бизнес-логика и внешние сервисы
│   │   ├── __init__.py
│   │   └── yookassa_service.py  # Интеграция с ЮКасса API
│   │
│   └── utils/                 # Вспомогательные утилиты
│       └── __init__.py
│
├── config.py                  # Конфигурация приложения
│                              # (Development, Production, Testing)
│
├── run.py                     # Точка входа приложения
│                              # Запуск development сервера
│
├── init_db.py                 # Скрипт инициализации БД
│                              # Создание таблиц и дефолтного админа
│
├── requirements.txt           # Python зависимости
├── .env.example              # Пример переменных окружения
├── .gitignore                # Git ignore правила
└── README.md                 # Документация
```

## Модели данных

### Product (Товар)

```python
class Product(db.Model):
    id: int (PK)
    name: str                 # Название товара
    brand: str                # Бренд
    price: float              # Цена
    old_price: float          # Старая цена (для скидок)
    discount: int             # Процент скидки
    volume: str               # Объем (100ml, 50ml, и т.д.)
    category: str             # Категория (men, women)
    description: str          # Описание
    image: str                # URL изображения
    is_featured: bool         # Избранный товар
    is_new: bool              # Новинка
    is_visible: bool          # Видимость на сайте
    created_at: datetime
    updated_at: datetime
```

**Связи:**
- Один-ко-многим с OrderItem

**Методы:**
- `to_dict()` - сериализация для JSON API

### Order (Заказ)

```python
class Order(db.Model):
    id: int (PK)
    order_number: str (unique)    # Уникальный номер заказа

    # Информация о клиенте
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_telegram: str (optional)

    # Адрес доставки
    delivery_address: str
    delivery_city: str
    delivery_zipcode: str

    comment: str (optional)       # Комментарий к заказу

    # Сумма
    subtotal: float               # Сумма товаров
    shipping_cost: float          # Стоимость доставки
    total_amount: float           # Итого

    # Оплата
    payment_method: str           # card, sbp, cash
    payment_id: str (optional)    # ID платежа в ЮКассе

    # Статус
    status: str                   # pending, awaiting_payment, paid,
                                  # processing, shipping, delivered, canceled

    created_at: datetime
    updated_at: datetime
```

**Связи:**
- Один-ко-многим с OrderItem

**Методы:**
- `to_dict(include_items=True)` - сериализация с опциональными items

### OrderItem (Элемент заказа)

```python
class OrderItem(db.Model):
    id: int (PK)
    order_id: int (FK -> Order)
    product_id: int (FK -> Product)

    # Снэпшот товара на момент заказа
    product_name: str
    product_price: float
    quantity: int
```

**Связи:**
- Многие-к-одному с Order
- Многие-к-одному с Product

**Методы:**
- `to_dict()` - включает вычисляемое поле total

### User (Администратор)

```python
class User(db.Model):
    id: int (PK)
    username: str (unique)
    email: str (unique)
    password_hash: str            # Bcrypt хэш
    role: str                     # admin, superadmin
    is_active: bool
    created_at: datetime
    last_login: datetime
```

**Методы:**
- `set_password(password)` - хэширование и сохранение пароля
- `check_password(password)` - проверка пароля
- `to_dict(include_sensitive=False)` - сериализация

## API Endpoints

### Authentication (`/api/auth`)

```
POST   /login              # Вход (возвращает JWT токен)
GET    /verify             # Проверка токена [AUTH]
POST   /register           # Регистрация нового админа [AUTH, SUPERADMIN]
POST   /change-password    # Смена пароля [AUTH]
```

### Products (`/api/products`)

```
GET    /                   # Список всех товаров
GET    /<id>               # Товар по ID
POST   /                   # Создать товар [AUTH]
PUT    /<id>               # Обновить товар [AUTH]
DELETE /<id>               # Удалить товар [AUTH]
POST   /bulk               # Массовое создание [AUTH]
```

**Query параметры GET /**:
- `category` - фильтр по категории
- `search` - поиск по названию/бренду
- `featured` - только избранные
- `visible` - только видимые (по умолчанию true)

### Orders (`/api/orders`)

```
POST   /                   # Создать заказ
GET    /                   # Список заказов [AUTH]
GET    /<id>               # Заказ по ID [AUTH]
PUT    /<id>/status        # Обновить статус [AUTH]
DELETE /<id>               # Удалить заказ [AUTH]
GET    /by-number/<num>    # Публичный эндпоинт для проверки статуса
GET    /stats              # Статистика [AUTH]
```

### Payment (`/api/payment`)

```
POST   /create             # Создать платеж в ЮКассе
GET    /status/<id>        # Статус платежа
POST   /webhook            # Webhook от ЮКассы
POST   /refund             # Возврат платежа
```

### Settings (`/api/settings`)

```
GET    /                   # Получить настройки
PUT    /                   # Обновить настройки [AUTH]
PUT    /hero               # Обновить Hero секцию [AUTH]
PUT    /contact            # Обновить контакты [AUTH]
POST   /reset              # Сброс к дефолтным [AUTH]
```

## Безопасность

### JWT Authentication

1. **Получение токена:**
   ```bash
   POST /api/auth/login
   {
     "username": "admin",
     "password": "password"
   }

   Response:
   {
     "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "user": {...}
   }
   ```

2. **Использование токена:**
   ```bash
   GET /api/products
   Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
   ```

3. **Время жизни:** 1 час (настраивается в `JWT_ACCESS_TOKEN_EXPIRES`)

4. **Автоматический logout:** При 401 ошибке токен удаляется из localStorage

### Password Hashing

- **Библиотека:** Flask-Bcrypt
- **Алгоритм:** bcrypt
- **Соль:** Генерируется автоматически для каждого пароля
- **Минимальная длина:** 8 символов

### Rate Limiting

Глобальные лимиты (по IP адресу):
- 200 запросов в день
- 50 запросов в час

Специальные лимиты:
- **Login:** 5 попыток в минуту
- **Создание заказа:** 10 в час
- **Создание платежа:** 10 в час
- **Регистрация админа:** 3 в час

### CORS

- Разрешен только origin из `FRONTEND_URL`
- Методы: GET, POST, PUT, DELETE, OPTIONS
- Headers: Content-Type, Authorization
- Credentials: true

## YooKassa Integration

### Создание платежа

```python
# 1. Клиент оформляет заказ
POST /api/orders -> создается Order со status='awaiting_payment'

# 2. Создается платеж в ЮКассе
POST /api/payment/create
{
  "orderNumber": "ORD-...",
  "amount": 8500,
  "paymentMethod": "bank_card"
}

# 3. Backend вызывает ЮКасса API
YooKassaService.create_payment({
  amount: {value: "8500.00", currency: "RUB"},
  confirmation: {type: "redirect", return_url: "..."},
  receipt: {...}  # Чек для 54-ФЗ
})

# 4. Клиент перенаправляется на платежную форму ЮКассы
window.location.href = confirmation_url

# 5. После оплаты клиент возвращается на return_url
# 6. ЮКасса отправляет webhook на /api/payment/webhook
# 7. Backend обновляет статус заказа на 'paid'
```

### Webhook обработка

```python
POST /api/payment/webhook
{
  "event": "payment.succeeded",
  "object": {
    "id": "payment_id",
    "status": "succeeded",
    "paid": true
  }
}

# Backend автоматически:
# 1. Находит заказ по payment_id
# 2. Обновляет статус на 'paid'
# 3. Логирует событие
```

### 54-ФЗ Compliance

Для каждого платежа автоматически генерируется чек:

```python
receipt = {
  customer: {
    email: "customer@email.com",
    phone: "+79991234567"
  },
  items: [
    {
      description: "Chanel No. 5",
      quantity: "2",
      amount: {value: "8500.00", currency: "RUB"},
      vat_code: 1,  # НДС 20%
      payment_mode: "full_payment",
      payment_subject: "commodity"
    }
  ]
}
```

## Configuration Management

### Environments

**Development:**
```python
DEBUG = True
SQLALCHEMY_ECHO = True  # Логирование SQL запросов
DATABASE_URL = sqlite:///airshop.db
```

**Production:**
```python
DEBUG = False
SQLALCHEMY_ECHO = False
DATABASE_URL = postgresql://...
SECRET_KEY = обязательно из .env
JWT_SECRET_KEY = обязательно из .env
```

**Testing:**
```python
TESTING = True
DATABASE_URL = sqlite:///:memory:
WTF_CSRF_ENABLED = False
```

### Environment Variables

Критичные переменные (обязательно для production):
- `SECRET_KEY` - секретный ключ Flask
- `JWT_SECRET_KEY` - ключ для JWT токенов
- `YOOKASSA_SHOP_ID` - ID магазина в ЮКассе
- `YOOKASSA_SECRET_KEY` - секретный ключ ЮКассы

Опциональные:
- `DATABASE_URL` - URL базы данных
- `FRONTEND_URL` - URL фронтенда для CORS
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL` - дефолтный админ

## Database Design

### Relationships

```
Product 1---N OrderItem N---1 Order
User (admin, не связан с Order)
```

### Indexes

Автоматические индексы на:
- Primary keys (id)
- Foreign keys (order_id, product_id)
- Уникальные поля (order_number, username, email)

### Cascade

При удалении Order автоматически удаляются все OrderItem:
```python
items = db.relationship('OrderItem', cascade='all, delete-orphan')
```

## Error Handling

### HTTP Status Codes

- **200 OK** - успешный запрос
- **201 Created** - ресурс создан
- **400 Bad Request** - невалидные данные
- **401 Unauthorized** - требуется авторизация
- **403 Forbidden** - недостаточно прав
- **404 Not Found** - ресурс не найден
- **409 Conflict** - конфликт (например, дубликат)
- **429 Too Many Requests** - превышен rate limit
- **500 Internal Server Error** - ошибка сервера

### Error Response Format

```json
{
  "error": "Описание ошибки на русском"
}
```

### Global Error Handlers

```python
@app.errorhandler(404)
def not_found(error):
    return {'error': 'Not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return {'error': 'Internal server error'}, 500

@app.errorhandler(429)
def ratelimit_handler(e):
    return {'error': 'Rate limit exceeded'}, 429
```

## Performance Considerations

### Database Queries

1. **Eager Loading:** Используйте `lazy='dynamic'` для больших коллекций
2. **Pagination:** Используйте `limit()` и `offset()` для больших списков
3. **Indexing:** Primary keys и foreign keys автоматически индексируются

### Caching

Рекомендуется добавить:
- **Redis** для кэширования частых запросов
- **Flask-Caching** для кэширования результатов эндпоинтов

### Rate Limiting Storage

По умолчанию: `memory://` (для development)
Для production: Redis
```python
RATELIMIT_STORAGE_URL = "redis://localhost:6379"
```

## Testing

### Unit Tests

Создайте `tests/test_models.py`:
```python
from app import create_app, db
from app.models import Product, Order

app = create_app('testing')

with app.app_context():
    # Тесты моделей
    product = Product(name="Test", brand="Test", ...)
    db.session.add(product)
    db.session.commit()
    assert product.id is not None
```

### Integration Tests

```python
import pytest
from app import create_app

@pytest.fixture
def client():
    app = create_app('testing')
    with app.test_client() as client:
        yield client

def test_get_products(client):
    response = client.get('/api/products')
    assert response.status_code == 200
```

## Monitoring & Logging

### Logging

Добавьте в `app/__init__.py`:
```python
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/airshop.log',
                                      maxBytes=10240,
                                      backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
```

### Metrics

Рекомендуемые метрики для отслеживания:
- Количество запросов по эндпоинтам
- Время ответа
- Ошибки (по кодам)
- Количество успешных платежей
- Конверсия заказов

## Deployment Checklist

- [ ] Установлены все production переменные в `.env`
- [ ] `SECRET_KEY` и `JWT_SECRET_KEY` - криптостойкие случайные строки
- [ ] `DEBUG = False`
- [ ] Используется PostgreSQL вместо SQLite
- [ ] Настроен Nginx как reverse proxy
- [ ] Настроен SSL сертификат (Let's Encrypt)
- [ ] Настроен Gunicorn с несколькими workers
- [ ] Настроен systemd сервис для автозапуска
- [ ] Настроены логи (ротация, мониторинг)
- [ ] Настроен firewall (только 80, 443 порты)
- [ ] Webhook ЮКассы настроен на правильный URL
- [ ] CORS настроен на production домен
- [ ] Выполнен бэкап базы данных
- [ ] Настроен мониторинг (Sentry, NewRelic, и т.д.)

## Future Enhancements

1. **Email уведомления** - Flask-Mail для отправки подтверждений
2. **SMS уведомления** - интеграция с SMS.RU
3. **Telegram бот** - уведомления админу о новых заказах
4. **Экспорт данных** - CSV/Excel экспорт заказов
5. **Аналитика** - дашборд с продажами, топ товарами
6. **Inventory** - отслеживание остатков товаров
7. **Reviews** - система отзывов о товарах
8. **Wishlist** - избранные товары пользователей
9. **Promo codes** - система промокодов и скидок
10. **Multi-language** - поддержка нескольких языков

## Поддержка

Для вопросов и багов создавайте issues в репозитории или свяжитесь с командой разработки.
