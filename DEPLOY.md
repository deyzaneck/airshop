# 🚀 Инструкция по деплою AirShop на Render.com

Эта инструкция поможет вам развернуть полнофункциональный магазин AirShop на бесплатном хостинге Render.com.

## 📋 Что получится в итоге

- ✅ Полностью рабочий интернет-магазин с Flask backend + React frontend
- ✅ PostgreSQL база данных
- ✅ Автоматический SSL сертификат (HTTPS)
- ✅ Бесплатный хостинг с автоматическим деплоем из GitHub
- ✅ URL вида: `https://airshop.onrender.com`

## 🎯 Шаг 1: Подготовка проекта

### 1.1 Проверьте, что все файлы созданы

Убедитесь, что в проекте есть следующие файлы:

```
airshop-fixed/
├── build.sh                 # ✅ Скрипт сборки
├── render.yaml              # ✅ Конфигурация Render
├── .env.production          # ✅ Production переменные для React
├── .gitignore               # ✅ Игнорирование ненужных файлов
├── backend/
│   ├── requirements.txt     # ✅ Python зависимости
│   ├── .env.example         # ✅ Пример переменных окружения
│   └── ...
└── ...
```

### 1.2 Сделайте build.sh исполняемым (для Linux/Mac)

Если вы на Linux или Mac, выполните:

```bash
chmod +x build.sh
```

Для Windows этот шаг не нужен.

## 🐙 Шаг 2: Загрузка на GitHub

### 2.1 Инициализируйте Git репозиторий

Откройте терминал в корневой папке проекта и выполните:

```bash
git init
git add .
git commit -m "Initial commit: AirShop e-commerce app"
```

### 2.2 Создайте репозиторий на GitHub

1. Перейдите на [github.com](https://github.com)
2. Нажмите "+" → "New repository"
3. Введите название: `airshop` (или любое другое)
4. **НЕ** выбирайте "Initialize with README" (у вас уже есть файлы)
5. Нажмите "Create repository"

### 2.3 Загрузите код на GitHub

GitHub покажет инструкции. Выполните их:

```bash
git remote add origin https://github.com/ВАШ_USERNAME/airshop.git
git branch -M main
git push -u origin main
```

Замените `ВАШ_USERNAME` на ваш логин GitHub.

## 🌐 Шаг 3: Деплой на Render.com

### 3.1 Регистрация на Render

1. Перейдите на [render.com](https://render.com)
2. Нажмите "Get Started" или "Sign Up"
3. **Важно:** Зарегистрируйтесь через GitHub (кнопка "Sign in with GitHub")
4. Разрешите Render доступ к вашим репозиториям

### 3.2 Создание проекта

#### Вариант А: Автоматический деплой (рекомендуется)

1. В Render Dashboard нажмите "New" → "Blueprint"
2. Выберите ваш репозиторий `airshop`
3. Render автоматически найдет файл `render.yaml` и настроит все сервисы
4. Нажмите "Apply"

#### Вариант Б: Ручная настройка (если автоматический не сработал)

**Шаг 1: Создайте базу данных**

1. Нажмите "New" → "PostgreSQL"
2. Настройки:
   - **Name:** `airshop-db`
   - **Database:** `airshop`
   - **Region:** Frankfurt (ближе к России)
   - **Plan:** Free
3. Нажмите "Create Database"
4. Дождитесь создания (1-2 минуты)
5. **Скопируйте "Internal Database URL"** (понадобится дальше)

**Шаг 2: Создайте Web Service**

1. Нажмите "New" → "Web Service"
2. Выберите ваш GitHub репозиторий `airshop`
3. Настройки:
   - **Name:** `airshop`
   - **Region:** Frankfurt
   - **Branch:** main
   - **Root Directory:** оставьте пустым
   - **Runtime:** Python 3
   - **Build Command:** `./build.sh`
   - **Start Command:** `cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT run:app`
   - **Plan:** Free

4. Нажмите "Advanced" и добавьте Environment Variables:

| Ключ | Значение |
|------|----------|
| `PYTHON_VERSION` | `3.11.0` |
| `NODE_VERSION` | `18.17.0` |
| `FLASK_ENV` | `production` |
| `SECRET_KEY` | Сгенерируйте случайную строку* |
| `JWT_SECRET_KEY` | Сгенерируйте случайную строку* |
| `DATABASE_URL` | Вставьте Internal Database URL из шага 1 |
| `FRONTEND_URL` | `https://airshop.onrender.com` (замените на ваш URL) |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | Ваш надежный пароль |

\* *Для генерации случайной строки используйте:* `python -c "import secrets; print(secrets.token_urlsafe(32))"`

5. Нажмите "Create Web Service"

### 3.3 Дождитесь деплоя

Render начнет сборку проекта. Это займет **5-10 минут**. Вы увидите логи в реальном времени:

```
==> Installing Python dependencies...
==> Installing Node.js dependencies...
==> Building React frontend...
==> Initializing database...
==> Build completed successfully!
==> Starting application...
```

Когда увидите "Your service is live 🎉", значит все готово!

## 🎉 Шаг 4: Открытие сайта

1. Скопируйте URL вашего сайта (например, `https://airshop.onrender.com`)
2. Откройте его в браузере
3. Вы должны увидеть главную страницу AirShop!

### Вход в админ панель

1. Перейдите на `/admin/login`
2. Введите:
   - **Username:** `admin`
   - **Password:** то, что вы указали в `ADMIN_PASSWORD`

## ⚙️ Настройка после деплоя

### Обновление настроек сайта

1. Войдите в админ панель
2. Перейдите в раздел "Настройки"
3. Обновите:
   - Текст на главной странице
   - Контактную информацию (телефон, email, Telegram)
4. Нажмите "Сохранить"

### Добавление товаров

1. В админ панели перейдите в "Товары"
2. Нажмите "Добавить товар"
3. Заполните информацию о товаре
4. Можете использовать изображения с Unsplash или свои URL

## 🔄 Автоматическое обновление

Теперь при каждом `git push` на GitHub, Render автоматически:
1. Скачает новый код
2. Пересоберет проект
3. Перезапустит сервер

Чтобы обновить сайт:

```bash
git add .
git commit -m "Описание изменений"
git push
```

Подождите 2-3 минуты, и изменения появятся на сайте!

## 🐛 Решение проблем

### Сайт не открывается (503 Service Unavailable)

- Проверьте логи в Render Dashboard → ваш сервис → "Logs"
- Убедитесь, что build завершился успешно
- Проверьте, что `DATABASE_URL` правильно указан

### База данных пуста (нет товаров)

```bash
# В Render Dashboard → ваш сервис → "Shell"
cd backend
python init_db.py --sample
```

### Ошибка CORS / API не работает

Убедитесь, что `FRONTEND_URL` в Environment Variables совпадает с реальным URL вашего сайта.

### Логин в админку не работает

1. Проверьте, что `ADMIN_PASSWORD` установлен в Environment Variables
2. Попробуйте пересоздать админа через Shell:
   ```python
   from app import create_app, db
   from app.models import User

   app = create_app('production')
   with app.app_context():
       admin = User.query.filter_by(username='admin').first()
       admin.set_password('ваш-новый-пароль')
       db.session.commit()
   ```

### Бесплатный план "засыпает"

Render Free план переводит неактивные сервисы в режим сна через 15 минут неактивности. Первый запрос после сна займет 30-50 секунд. Это нормально для бесплатного плана.

**Решение:** Используйте [UptimeRobot](https://uptimerobot.com) для пинга вашего сайта каждые 5 минут.

## 📊 Мониторинг

### Просмотр логов

Render Dashboard → ваш сервис → "Logs" - здесь можно видеть все логи в реальном времени.

### Просмотр заказов

Админ панель → "Заказы" - все заказы с сайта.

### База данных

Render Dashboard → `airshop-db` → "Connect" - здесь можно подключиться к PostgreSQL через клиент.

## 🎨 Кастомизация

### Изменение дизайна

1. Отредактируйте файлы в `src/` (например, цвета в `src/index.css`)
2. Закоммитьте и запушьте:
   ```bash
   git add .
   git commit -m "Обновил дизайн"
   git push
   ```
3. Render автоматически пересоберет сайт

### Добавление своего домена

1. Купите домен (например, на reg.ru или nic.ru)
2. В Render Dashboard → ваш сервис → "Settings" → "Custom Domain"
3. Добавьте ваш домен и настройте DNS записи согласно инструкциям Render

## 💰 Тарифы и ограничения

### Бесплатный план Render:

- ✅ 750 часов работы в месяц (достаточно для одного сайта)
- ✅ 100 GB трафика в месяц
- ✅ PostgreSQL 1 GB хранилища
- ⚠️ Сайт "засыпает" после 15 минут неактивности
- ⚠️ Медленнее платных планов

### Платный план ($7/месяц):

- ✅ Сайт никогда не спит
- ✅ Быстрее работает
- ✅ Больше хранилища

## 🆘 Поддержка

- **Документация Render:** [render.com/docs](https://render.com/docs)
- **Логи ошибок:** Render Dashboard → Logs
- **GitHub Issues:** Создайте issue в вашем репозитории

---

## 📝 Чеклист деплоя

- [ ] Создан репозиторий на GitHub
- [ ] Код загружен на GitHub
- [ ] Зарегистрирован на Render.com через GitHub
- [ ] Создана PostgreSQL база данных
- [ ] Создан Web Service
- [ ] Установлены все Environment Variables
- [ ] Деплой завершился успешно
- [ ] Сайт открывается по URL
- [ ] Вход в админ панель работает
- [ ] Товары отображаются на сайте
- [ ] Настройки сайта обновлены

Поздравляю! Ваш магазин AirShop теперь в интернете! 🎉
