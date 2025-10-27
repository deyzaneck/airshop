# 🚀 Деплой AirShop на Vercel + Railway

Этот гайд поможет вам развернуть магазин AirShop с использованием **Vercel** (для React frontend) и **Railway** (для Flask backend + PostgreSQL).

## 🎯 Что получится

- **Frontend**: `https://airshop.vercel.app` (очень быстрый)
- **Backend API**: `https://airshop-backend.up.railway.app/api`
- **База данных**: PostgreSQL на Railway
- **SSL сертификаты**: Автоматически
- **Автодеплой**: При каждом git push

---

## 📋 Предварительные требования

1. Аккаунт на [GitHub](https://github.com) (уже есть ✅)
2. Аккаунт на [Vercel](https://vercel.com) - регистрация через GitHub
3. Аккаунт на [Railway](https://railway.app) - регистрация через GitHub

---

## 🔧 Часть 1: Деплой Backend на Railway

### Шаг 1: Загрузите код на GitHub

Если вы еще не загрузили код, выполните:

```bash
git add .
git commit -m "Prepare for Vercel + Railway deployment"
git push
```

### Шаг 2: Регистрация на Railway

1. Перейдите на [railway.app](https://railway.app)
2. Нажмите **Login** → **Login with GitHub**
3. Разрешите Railway доступ к вашим репозиториям

### Шаг 3: Создание проекта на Railway

1. В Railway Dashboard нажмите **New Project**
2. Выберите **Deploy from GitHub repo**
3. Найдите и выберите ваш репозиторий `airshop`
4. Railway автоматически обнаружит Flask приложение

### Шаг 4: Добавление PostgreSQL базы данных

1. В вашем проекте нажмите **New** → **Database** → **Add PostgreSQL**
2. Railway автоматически создаст базу данных
3. Переменная `DATABASE_URL` будет создана автоматически

### Шаг 5: Настройка Environment Variables

1. Нажмите на ваш сервис (airshop)
2. Перейдите в **Variables**
3. Добавьте следующие переменные:

| Переменная | Значение | Описание |
|------------|----------|----------|
| `FLASK_ENV` | `production` | Режим работы |
| `SECRET_KEY` | `[случайная строка]`* | Секретный ключ Flask |
| `JWT_SECRET_KEY` | `[случайная строка]`* | Ключ для JWT токенов |
| `ADMIN_USERNAME` | `admin` | Логин админа |
| `ADMIN_PASSWORD` | `[ваш пароль]` | Пароль админа |
| `FRONTEND_URL` | `https://airshop.vercel.app` | URL frontend (обновите после деплоя) |
| `PORT` | `${{PORT}}` | Порт (автоматически) |

*Для генерации случайных строк используйте:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

4. **Важно:** `DATABASE_URL` уже должна быть добавлена автоматически при создании PostgreSQL

### Шаг 6: Деплой

1. Railway автоматически запустит деплой
2. Дождитесь завершения (обычно 2-3 минуты)
3. В логах вы увидите:
   ```
   🔄 Initializing products...
   ✓ Imported 48 products from CSV
   ```

### Шаг 7: Получите URL вашего Backend

1. В Railway перейдите в **Settings**
2. Найдите раздел **Domains**
3. Нажмите **Generate Domain**
4. Скопируйте URL (например: `https://airshop-backend-production.up.railway.app`)
5. **Сохраните этот URL** - он понадобится для Vercel!

---

## 🎨 Часть 2: Деплой Frontend на Vercel

### Шаг 1: Регистрация на Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите **Sign Up** → **Continue with GitHub**
3. Разрешите Vercel доступ к вашим репозиториям

### Шаг 2: Импорт проекта

1. В Vercel Dashboard нажмите **Add New...** → **Project**
2. Найдите и выберите репозиторий `airshop`
3. Нажмите **Import**

### Шаг 3: Настройка проекта

1. **Framework Preset**: Vercel автоматически определит "Create React App"
2. **Root Directory**: оставьте пустым (корень репозитория)
3. **Build Command**: `npm run build` (по умолчанию)
4. **Output Directory**: `build` (по умолчанию)

### Шаг 4: Настройка Environment Variables

В разделе **Environment Variables** добавьте:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://airshop-backend-production.up.railway.app/api` |

**Важно:** Замените URL на тот, который вы получили из Railway (Шаг 7 выше)!

### Шаг 5: Деплой

1. Нажмите **Deploy**
2. Vercel соберет и задеплоит ваш сайт (обычно 1-2 минуты)
3. После завершения вы получите URL: `https://airshop.vercel.app`

### Шаг 6: Обновите FRONTEND_URL в Railway

1. Вернитесь в Railway
2. Перейдите в **Variables**
3. Обновите `FRONTEND_URL` на ваш реальный Vercel URL
4. Railway автоматически перезапустится

---

## ✅ Проверка работы

### 1. Откройте ваш сайт

Перейдите на ваш Vercel URL (например, `https://airshop.vercel.app`)

### 2. Проверьте товары

- Главная страница должна показывать избранные товары
- Каталог должен показывать все 48 товаров из CSV
- Изображения должны загружаться

### 3. Проверьте админ панель

1. Перейдите на `/admin/login`
2. Войдите с логином `admin` и вашим паролем
3. Проверьте раздел "Товары" - должно быть 48 товаров
4. Создайте тестовый заказ на сайте
5. Проверьте, что заказ появился в админке

---

## 🔄 Автоматическое обновление

Теперь при каждом `git push`:
1. Vercel автоматически обновит frontend
2. Railway автоматически обновит backend

Просто вносите изменения и пушьте:

```bash
git add .
git commit -m "Update feature"
git push
```

---

## 🎛️ Настройка собственного домена

### Для Frontend (Vercel):

1. В Vercel Dashboard → ваш проект → **Settings** → **Domains**
2. Нажмите **Add**
3. Введите ваш домен (например, `airshop.ru`)
4. Следуйте инструкциям для настройки DNS записей

### Для Backend (Railway):

1. В Railway → ваш сервис → **Settings** → **Domains**
2. Нажмите **Custom Domain**
3. Введите поддомен (например, `api.airshop.ru`)
4. Настройте DNS записи согласно инструкциям

**После добавления домена обновите:**
- `FRONTEND_URL` в Railway
- `REACT_APP_API_URL` в Vercel

---

## 📊 Мониторинг и логи

### Vercel:

- Dashboard → ваш проект → **Deployments** - история деплоев
- Dashboard → ваш проект → **Analytics** - статистика посещений

### Railway:

- Dashboard → ваш сервис → **Deployments** - история деплоев
- Dashboard → ваш сервис → **Observability** - логи и метрики
- Dashboard → ваша БД → **Metrics** - использование базы данных

---

## 🐛 Решение проблем

### Проблема: Товары не загружаются на сайте

**Решение:**
1. Проверьте логи Railway: нажмите на сервис → **View Logs**
2. Убедитесь, что видите `✓ Imported 48 products from CSV`
3. Если товары не импортировались, проверьте, что файл `table.csv` есть в репозитории

### Проблема: CORS ошибки в браузере

**Решение:**
1. Откройте Railway → Variables
2. Проверьте, что `FRONTEND_URL` совпадает с вашим Vercel URL
3. Убедитесь, что URL без слеша в конце: `https://airshop.vercel.app` (не `...app/`)

### Проблема: 500 Internal Server Error

**Решение:**
1. Проверьте логи Railway
2. Убедитесь, что все environment variables установлены
3. Проверьте, что `DATABASE_URL` подключена к PostgreSQL

### Проблема: Админ панель не работает (401 Unauthorized)

**Решение:**
1. Проверьте, что `JWT_SECRET_KEY` установлен в Railway
2. Очистите localStorage браузера: F12 → Application → Local Storage → Clear All
3. Попробуйте войти снова

### Проблема: Frontend показывает старые данные

**Решение:**
1. Очистите кэш браузера: Ctrl+Shift+R (или Cmd+Shift+R на Mac)
2. В Vercel Dashboard → ваш проект → **Deployments** → убедитесь, что последний деплой успешен

---

## 💰 Ограничения бесплатных планов

### Vercel (Free):
- ✅ 100 GB bandwidth в месяц (обычно достаточно)
- ✅ Неограниченное количество деплоев
- ✅ Автоматический SSL

### Railway (Free Trial):
- ✅ $5 кредитов в месяц (обычно хватает на малый/средний трафик)
- ✅ 500 MB RAM
- ✅ 1 GB Disk
- ⚠️ Сервис может "уснуть" после 24ч неактивности (платный план убирает это)

---

## 📈 Переход на платный план (опционально)

Когда ваш сайт вырастет:

### Railway ($5/месяц):
- Сервис никогда не спит
- Больше ресурсов
- Приоритетная поддержка

### Vercel ($20/месяц - Pro план):
- Больше bandwidth
- Аналитика
- Защита от DDoS

---

## 🎓 Дополнительные ресурсы

- [Документация Vercel](https://vercel.com/docs)
- [Документация Railway](https://docs.railway.app)
- [Flask на Railway](https://docs.railway.app/examples/flask)
- [React на Vercel](https://vercel.com/docs/frameworks/react)

---

## 📝 Чеклист деплоя

- [ ] Код загружен на GitHub
- [ ] Создан проект на Railway
- [ ] Добавлена PostgreSQL база на Railway
- [ ] Установлены все environment variables в Railway
- [ ] Backend успешно задеплоен на Railway
- [ ] Получен URL backend API
- [ ] Создан проект на Vercel
- [ ] Установлена переменная `REACT_APP_API_URL` в Vercel
- [ ] Frontend успешно задеплоен на Vercel
- [ ] Обновлен `FRONTEND_URL` в Railway
- [ ] Сайт открывается и показывает товары
- [ ] Админ панель работает
- [ ] Заказы создаются и сохраняются

---

## 🎉 Готово!

Ваш магазин AirShop теперь онлайн!

- **Frontend**: очень быстрый благодаря Vercel CDN
- **Backend**: надежный Flask на Railway
- **База данных**: профессиональный PostgreSQL

Теперь вы можете делиться ссылкой с клиентами! 🚀
