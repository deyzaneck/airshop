# AirShop Backend

Защищенный REST API сервер для интернет-магазина парфюмерии AirShop, построенный на Python Flask.

## Технологии

- **Flask 3.0** - веб-фреймворк
- **SQLAlchemy** - ORM для работы с базой данных
- **Flask-JWT-Extended** - JWT аутентификация
- **Flask-Bcrypt** - хэширование паролей
- **Flask-CORS** - CORS поддержка для фронтенда
- **Flask-Limiter** - защита от rate-limiting
- **ЮКасса API** - интеграция платежной системы

## Структура проекта

```
backend/
├── app/
│   ├── __init__.py          # Инициализация Flask приложения
│   ├── models/              # Модели базы данных
│   │   ├── product.py       # Модель товара
│   │   ├── order.py         # Модели заказа и элемента заказа
│   │   └── user.py          # Модель администратора
│   ├── routes/              # API эндпоинты
│   │   ├── auth.py          # Аутентификация (login, register, etc.)
│   │   ├── products.py      # Управление товарами
│   │   ├── orders.py        # Управление заказами
│   │   ├── payment.py       # Платежи через ЮКассу
│   │   └── settings.py      # Настройки сайта
│   ├── services/            # Бизнес-логика
│   │   └── yookassa_service.py  # Интеграция с ЮКассой
│   └── utils/               # Вспомогательные утилиты
├── config.py                # Конфигурация приложения
├── run.py                   # Точка входа
├── requirements.txt         # Python зависимости
└── .env.example            # Пример переменных окружения
```

## Установка

### 1. Создание виртуального окружения

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 3. Настройка переменных окружения

Скопируйте `.env.example` в `.env` и заполните необходимые значения:

```bash
cp .env.example .env
```

Обязательно измените следующие переменные:

```env
# Секретные ключи (обязательно измените!)
SECRET_KEY=ваш-супер-секретный-ключ
JWT_SECRET_KEY=ваш-jwt-секретный-ключ

# База данных
DATABASE_URL=sqlite:///airshop.db  # для dev
# DATABASE_URL=postgresql://user:password@localhost/airshop  # для production

# ЮКасса (получите в личном кабинете https://yookassa.ru)
YOOKASSA_SHOP_ID=ваш-shop-id
YOOKASSA_SECRET_KEY=ваш-secret-key

# Админ по умолчанию
ADMIN_USERNAME=admin
ADMIN_PASSWORD=безопасный-пароль
ADMIN_EMAIL=admin@airshop.ru
```

### 4. Инициализация базы данных

База данных создастся автоматически при первом запуске. Также будет создан администратор по умолчанию с учетными данными из `.env`.

## Запуск

### Development режим

```bash
python run.py
```

Сервер запустится на `http://0.0.0.0:5000`

### Production режим

Для production используйте Gunicorn:

```bash
# Установка переменной окружения
export FLASK_ENV=production  # Linux/Mac
set FLASK_ENV=production     # Windows

# Запуск через Gunicorn (только Linux/Mac)
gunicorn -w 4 -b 0.0.0.0:5000 run:app

# Windows - используйте waitress
pip install waitress
waitress-serve --host 0.0.0.0 --port 5000 run:app
```

## API Документация

### Аутентификация

Все админские эндпоинты требуют JWT токен в заголовке:
```
Authorization: Bearer <your-jwt-token>
```

#### POST `/api/auth/login`
Вход администратора

**Request:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@airshop.ru",
    "role": "admin"
  }
}
```

#### GET `/api/auth/verify`
Проверка JWT токена (требует авторизацию)

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@airshop.ru",
    "role": "admin"
  }
}
```

### Товары

#### GET `/api/products`
Получить список товаров

**Query параметры:**
- `category` - фильтр по категории (men, women, all)
- `search` - поиск по названию/бренду
- `featured` - только избранные (true/false)
- `visible` - только видимые (true/false, по умолчанию true)

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Chanel No. 5",
      "brand": "Chanel",
      "price": 8500,
      "oldPrice": 10000,
      "discount": 15,
      "volume": "100ml",
      "category": "women",
      "description": "Легендарный аромат...",
      "image": "url",
      "isFeatured": true,
      "isNew": false
    }
  ]
}
```

#### GET `/api/products/<id>`
Получить товар по ID

#### POST `/api/products` (требует авторизацию)
Создать новый товар

#### PUT `/api/products/<id>` (требует авторизацию)
Обновить товар

#### DELETE `/api/products/<id>` (требует авторизацию)
Удалить товар

### Заказы

#### POST `/api/orders`
Создать новый заказ

**Request:**
```json
{
  "orderNumber": "ORD-20250126-ABC123",
  "customer": {
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "phone": "+79991234567",
    "telegram": "@ivan"
  },
  "delivery": {
    "address": "ул. Пушкина, д. 10, кв. 5",
    "city": "Москва",
    "zipcode": "123456"
  },
  "comment": "Комментарий к заказу",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "paymentMethod": "card",
  "paymentId": "optional-payment-id"
}
```

#### GET `/api/orders` (требует авторизацию)
Получить список всех заказов

**Query параметры:**
- `status` - фильтр по статусу
- `limit` - количество заказов
- `offset` - смещение для пагинации

#### GET `/api/orders/<id>` (требует авторизацию)
Получить заказ по ID

#### PUT `/api/orders/<id>/status` (требует авторизацию)
Обновить статус заказа

**Request:**
```json
{
  "status": "paid"
}
```

**Возможные статусы:**
- `pending` - ожидает обработки
- `awaiting_payment` - ожидает оплаты
- `paid` - оплачен
- `processing` - в обработке
- `shipping` - отправлен
- `delivered` - доставлен
- `canceled` - отменен

#### GET `/api/orders/by-number/<order_number>`
Публичный эндпоинт для проверки статуса заказа по номеру

#### GET `/api/orders/stats` (требует авторизацию)
Получить статистику по заказам

### Платежи (ЮКасса)

#### POST `/api/payment/create`
Создать платеж в ЮКассе

**Request:**
```json
{
  "orderNumber": "ORD-20250126-ABC123",
  "amount": 8500,
  "returnUrl": "https://airshop.ru/payment/success",
  "paymentMethod": "bank_card"
}
```

**Response:**
```json
{
  "success": true,
  "payment_id": "yookassa-payment-id",
  "confirmation_url": "https://yoomoney.ru/checkout/payments/...",
  "status": "pending"
}
```

#### GET `/api/payment/status/<payment_id>`
Проверить статус платежа

#### POST `/api/payment/webhook`
Webhook для получения уведомлений от ЮКассы (настраивается в личном кабинете ЮКассы)

#### POST `/api/payment/refund`
Создать возврат платежа

### Настройки

#### GET `/api/settings`
Получить настройки сайта

#### PUT `/api/settings` (требует авторизацию)
Обновить настройки сайта

#### PUT `/api/settings/hero` (требует авторизацию)
Обновить настройки главной страницы

#### PUT `/api/settings/contact` (требует авторизацию)
Обновить контактную информацию

## Безопасность

### Rate Limiting

Все эндпоинты защищены rate limiting:
- Дефолт: 200 запросов в день, 50 в час
- Login: 5 попыток в минуту
- Создание заказа: 10 в час
- Создание платежа: 10 в час

### CORS

CORS настроен для работы с фронтендом. По умолчанию разрешены запросы с `http://localhost:3000`. Измените `FRONTEND_URL` в `.env` для production.

### JWT Токены

- Время жизни токена: 1 час (настраивается в `JWT_ACCESS_TOKEN_EXPIRES`)
- Токены передаются в заголовке `Authorization: Bearer <token>`

### Хэширование паролей

Пароли хэшируются с использованием bcrypt.

## База данных

### SQLite (по умолчанию для development)

База данных автоматически создается в файле `airshop.db`

### PostgreSQL (рекомендуется для production)

```bash
# Установка PostgreSQL
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# Создание базы данных
sudo -u postgres createdb airshop
sudo -u postgres createuser airshop_user
sudo -u postgres psql

# В psql:
ALTER USER airshop_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE airshop TO airshop_user;

# Обновите DATABASE_URL в .env:
DATABASE_URL=postgresql://airshop_user:your-password@localhost/airshop
```

### Миграции

Для миграций можно использовать Flask-Migrate (уже установлен):

```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

## Тестирование

### Создание тестовых данных

Вы можете использовать эндпоинт `/api/products/bulk` для массового создания товаров из фронтенда.

### Тестовые карты ЮКассы

Для тестирования платежей используйте карты из документации ЮКассы:
- Успешная оплата: `5555 5555 5555 4444`
- Отклонена банком: `5555 5555 5555 5599`
- CVC: любые 3 цифры
- Срок: любая дата в будущем

## Deployment

### Heroku

1. Создайте `Procfile`:
```
web: gunicorn run:app
```

2. Деплой:
```bash
heroku create airshop-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=your-secret-key
# ... другие переменные из .env
git push heroku main
```

### VPS (Ubuntu)

```bash
# Установка зависимостей
sudo apt update
sudo apt install python3 python3-pip python3-venv nginx

# Клонирование репозитория
git clone <your-repo>
cd airshop-fixed/backend

# Виртуальное окружение
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Настройка Gunicorn как systemd сервиса
sudo nano /etc/systemd/system/airshop.service
```

```ini
[Unit]
Description=AirShop Flask Backend
After=network.target

[Service]
User=your-user
WorkingDirectory=/path/to/airshop-fixed/backend
Environment="PATH=/path/to/airshop-fixed/backend/venv/bin"
Environment="FLASK_ENV=production"
ExecStart=/path/to/airshop-fixed/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 run:app

[Install]
WantedBy=multi-user.target
```

```bash
# Запуск сервиса
sudo systemctl start airshop
sudo systemctl enable airshop

# Настройка Nginx
sudo nano /etc/nginx/sites-available/airshop
```

```nginx
server {
    listen 80;
    server_name api.airshop.ru;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/airshop /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

## Troubleshooting

### Ошибка "No module named 'app'"

Убедитесь, что вы запускаете сервер из директории `backend/`:
```bash
cd backend
python run.py
```

### CORS ошибки

Проверьте, что `FRONTEND_URL` в `.env` соответствует адресу вашего фронтенда.

### Ошибки базы данных

Удалите файл `airshop.db` и перезапустите сервер - база данных будет создана заново.

### ЮКасса ошибки

Проверьте, что:
1. `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY` правильные
2. В личном кабинете ЮКассы настроен webhook на `https://your-domain.com/api/payment/webhook`
3. IP адрес сервера добавлен в whitelist в ЮКассе (для production)

## Лицензия

Proprietary - AirShop 2025
