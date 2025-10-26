# 🛍️ AirShop - Магазин премиальной парфюмерии

Полнофункциональный интернет-магазин парфюмерии с React frontend и Flask backend.

![AirShop](https://img.shields.io/badge/React-18-blue) ![Flask](https://img.shields.io/badge/Flask-3.0-green) ![Python](https://img.shields.io/badge/Python-3.11-yellow)

## ✨ Возможности

- 🎨 **Современный дизайн** - темная тема с анимациями
- 🛒 **Корзина покупок** - управление товарами
- 💳 **YooKassa интеграция** - прием онлайн платежей
- 👤 **Админ панель** - управление заказами, товарами и настройками
- 📱 **Адаптивный дизайн** - работает на всех устройствах
- 🔐 **JWT аутентификация** - безопасный доступ к админке
- 🗄️ **PostgreSQL** - надежное хранение данных

## Цветовая палитра

### Фон
- `--bg-primary: #1a1625` - Основной темный фон
- `--bg-secondary: #231d2e` - Вторичный фон
- `--bg-tertiary: #2d2538` - Третичный фон

### Текст
- `--text-primary: #f5f1e8` - Основной текст (светлый)
- `--text-secondary: #e8dfc8` - Вторичный текст
- `--text-tertiary: #d4c5a0` - Третичный текст
- `--text-muted: #b8a980` - Приглушенный текст

### Акценты
- `--accent-peach: #e8b4a0` - Персиковый (основной акцент)
- `--accent-wine: #8b4f65` - Бордовый (вторичный акцент)
- `--accent-gold: #d4a574` - Золотой

## 🚀 Быстрый старт (локально)

### Требования

- Node.js 18+
- Python 3.11+
- PostgreSQL (опционально, можно использовать SQLite)

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/ваш-username/airshop.git
cd airshop
```

### 2. Запуск Frontend

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm start
```

Frontend будет доступен на [http://localhost:3000](http://localhost:3000)

### 3. Запуск Backend

```bash
# Переход в папку backend
cd backend

# Создание виртуального окружения
python -m venv venv

# Активация (Windows)
venv\Scripts\activate
# или (Linux/Mac)
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Копирование .env файла
cp .env.example .env

# Инициализация БД с примерами данных
python init_db.py --sample

# Запуск сервера
python run.py
```

Backend будет доступен на [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 🌐 Деплой на Render.com

Хотите разместить магазин в интернете **бесплатно**?

**Читайте подробную инструкцию:** [DEPLOY.md](DEPLOY.md)

### Быстрая инструкция:

1. Загрузите код на GitHub
2. Зарегистрируйтесь на [render.com](https://render.com) через GitHub
3. Создайте Blueprint из файла `render.yaml`
4. Дождитесь деплоя (5-10 минут)
5. Готово! 🎉

## 📁 Структура проекта

```
airshop/
├── src/                    # React frontend
│   ├── components/         # Компоненты (Header, Footer)
│   ├── pages/              # Страницы
│   ├── api/                # API клиент
│   └── utils/              # Вспомогательные функции
├── backend/                # Flask backend
│   ├── app/
│   │   ├── models/         # Модели БД
│   │   ├── routes/         # API endpoints
│   │   └── services/       # Бизнес-логика
│   ├── config.py           # Конфигурация
│   └── run.py              # Точка входа
├── public/                 # Статические файлы
├── build.sh                # Скрипт сборки для Render
├── render.yaml             # Конфигурация Render
└── DEPLOY.md               # Инструкция по деплою
```

## 🔑 Доступ к админ панели

По умолчанию:
- **URL:** `/admin/login`
- **Username:** `admin`
- **Password:** `changeme123` (измените в `.env`)

## 🛠️ Технологии

### Frontend
- **React 18** - UI библиотека
- **React Router 6** - маршрутизация
- **Tailwind CSS** - стилизация
- **Axios** - HTTP клиент
- **Lucide React** - иконки

### Backend
- **Flask 3.0** - веб-фреймворк
- **SQLAlchemy** - ORM
- **Flask-JWT-Extended** - аутентификация
- **PostgreSQL** - база данных
- **YooKassa** - платежная система
- **Gunicorn** - WSGI сервер

## 📝 Environment Variables

### Backend (.env)

```env
FLASK_ENV=development
SECRET_KEY=ваш-секретный-ключ
JWT_SECRET_KEY=ваш-jwt-ключ
DATABASE_URL=sqlite:///airshop.db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ваш-пароль
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🆘 Поддержка

Есть вопросы или проблемы?

- 📖 Читайте [DEPLOY.md](DEPLOY.md) для деплоя
- 🐛 Создайте Issue на GitHub
- 💬 Свяжитесь с разработчиком

---

Сделано с ❤️ с помощью Claude Code
