# 🚀 Чек-лист для выкладки AirShop в продакшн

## ✅ ОБЯЗАТЕЛЬНЫЕ ЗАДАЧИ

### 1. 🔐 Безопасность Backend

#### A. Смена секретных ключей в `.env`
```env
# ⚠️ ОБЯЗАТЕЛЬНО ИЗМЕНИТЕ ЭТИ КЛЮЧИ!
SECRET_KEY=<сгенерируйте-длинный-случайный-ключ>
JWT_SECRET_KEY=<сгенерируйте-другой-длинный-ключ>

# Генерация ключей:
# python -c "import secrets; print(secrets.token_hex(32))"
```

#### B. Смена пароля администратора
```env
ADMIN_USERNAME=ваш_логин  # Не используйте "admin"!
ADMIN_PASSWORD=<сложный-пароль-минимум-12-символов>
ADMIN_EMAIL=ваш-email@domain.com
```

#### C. Настройка базы данных
```env
# НЕ используйте SQLite в production!
# Перейдите на PostgreSQL:
DATABASE_URL=postgresql://username:password@localhost:5432/airshop

# Установка PostgreSQL:
# sudo apt install postgresql postgresql-contrib
# sudo -u postgres createdb airshop
# sudo -u postgres createuser airshop_user
# sudo -u postgres psql -c "ALTER USER airshop_user WITH PASSWORD 'secure_password';"
# sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE airshop TO airshop_user;"
```

---

### 2. 💳 Интеграция ЮКассы

#### A. Получите реальные учетные данные
1. Зарегистрируйтесь на https://yookassa.ru
2. Пройдите модерацию (проверка компании)
3. Получите `SHOP_ID` и `SECRET_KEY`

#### B. Настройте `.env`
```env
YOOKASSA_SHOP_ID=ваш-реальный-shop-id
YOOKASSA_SECRET_KEY=ваш-реальный-secret-key
```

#### C. Настройте Webhook в ЮКассе
В личном кабинете ЮКассы укажите URL:
```
https://ваш-домен.ru/api/payment/webhook
```

#### D. Переключите режим в `src/config/payment.js`
```javascript
export const PAYMENT_CONFIG = {
  mode: 'production', // Было: 'test'
  // ...
};
```

---

### 3. 🌐 Настройка доменов

#### A. Backend `.env`
```env
FRONTEND_URL=https://ваш-домен.ru
PAYMENT_RETURN_URL=https://ваш-домен.ru/payment/success
```

#### B. Frontend `.env`
```env
REACT_APP_API_URL=https://api.ваш-домен.ru/api
# или если API на том же домене:
REACT_APP_API_URL=https://ваш-домен.ru/api
```

#### C. CORS настройка в backend
Убедитесь что `backend/config.py` правильно настроен:
```python
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
CORS_ORIGINS = [FRONTEND_URL]
```

---

### 4. 📧 Email уведомления (опционально, но рекомендуется)

```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=ваш-email@gmail.com
MAIL_PASSWORD=ваш-app-password  # Не обычный пароль!

# Для Gmail: https://myaccount.google.com/apppasswords
```

Затем добавьте функционал отправки писем при:
- Создании заказа (подтверждение клиенту)
- Изменении статуса заказа
- Успешной оплате

---

### 5. 📁 Загрузка изображений товаров

**Текущая проблема:** Товары используют Unsplash URLs (плейсхолдеры)

**Решения:**

#### A. Локальное хранение (простой вариант)
1. Создайте папку `public/images/products/`
2. Загрузите реальные фото товаров
3. Обновите `image` в базе данных:
   ```
   /images/products/chanel-no5.jpg
   ```

#### B. CDN (рекомендуется для production)
Используйте CloudFlare Images, AWS S3, или другой CDN:
```javascript
// backend/app/routes/products.py - добавьте upload endpoint
@bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_image():
    # Загрузка на CDN и возврат URL
```

#### C. Массовая замена в CSV
Обновите `table.csv` с реальными изображениями и переимпортируйте:
```bash
python import_csv.py
```

---

### 6. 📝 Изменение контактной информации

#### В админ-панели:
1. Войдите: http://localhost:3000/admin
2. Вкладка **"Настройки"**
3. Измените:
   - Телефон: `+7 (999) 123-45-67` → ваш реальный
   - Email: `info@airshop.ru` → ваш реальный
   - Telegram: `@airshop_support` → ваш реальный
   - Текст Hero секции на главной

#### Или через API/JSON:
Отредактируйте `backend/site_settings.json` напрямую.

---

### 7. 🔍 SEO оптимизация

#### A. Метатеги в `public/index.html`
```html
<title>AirShop - Премиальная парфюмерия</title>
<meta name="description" content="Оригинальная парфюмерия с доставкой по России. Гарантия качества. Быстрая доставка.">
<meta property="og:title" content="AirShop - Премиальная парфюмерия">
<meta property="og:description" content="...">
<meta property="og:image" content="https://ваш-домен.ru/logo.png">
```

#### B. robots.txt в `public/robots.txt`
```
User-agent: *
Allow: /
Sitemap: https://ваш-домен.ru/sitemap.xml
```

#### C. Google Analytics / Yandex Metrika
Добавьте счетчик в `public/index.html`:
```html
<!-- Yandex.Metrika counter -->
<script type="text/javascript" >
   (function(m,e,t,r,i,k,a){...})
</script>
```

---

### 8. 🎨 Брендинг

#### A. Логотип
Замените файл на реальный логотип:
```
public/logo.png
public/favicon.ico
```

#### B. Название в `package.json`
```json
{
  "name": "airshop-your-company",
  ...
}
```

#### C. Footer копирайт
В `src/components/layout/Footer.jsx` измените:
```javascript
© {new Date().getFullYear()} Ваша Компания. Все права защищены.
```

---

## 🛠️ DEPLOYMENT

### Вариант 1: VPS (Ubuntu/Debian) - РЕКОМЕНДУЕТСЯ

#### 1. Подготовка сервера
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка зависимостей
sudo apt install -y python3 python3-pip python3-venv nginx postgresql git

# Установка Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 2. Настройка PostgreSQL
```bash
sudo -u postgres createdb airshop
sudo -u postgres createuser airshop_user
sudo -u postgres psql

# В psql:
ALTER USER airshop_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE airshop TO airshop_user;
\q
```

#### 3. Клонирование проекта
```bash
cd /var/www
sudo git clone <ваш-репозиторий> airshop
sudo chown -R $USER:$USER /var/www/airshop
cd /var/www/airshop
```

#### 4. Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Настройте .env (см. раздел Безопасность)
nano .env

# Инициализируйте БД
python init_db.py --sample
```

#### 5. Backend как systemd сервис
```bash
sudo nano /etc/systemd/system/airshop-backend.service
```

```ini
[Unit]
Description=AirShop Flask Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/airshop/backend
Environment="PATH=/var/www/airshop/backend/venv/bin"
Environment="FLASK_ENV=production"
ExecStart=/var/www/airshop/backend/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 run:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start airshop-backend
sudo systemctl enable airshop-backend
sudo systemctl status airshop-backend
```

#### 6. Frontend build
```bash
cd /var/www/airshop

# Настройте .env
echo "REACT_APP_API_URL=https://api.ваш-домен.ru/api" > .env

npm install
npm run build
```

#### 7. Nginx конфигурация
```bash
sudo nano /etc/nginx/sites-available/airshop
```

```nginx
# Backend API
server {
    listen 80;
    server_name api.ваш-домен.ru;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    root /var/www/airshop/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статики
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/airshop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. SSL сертификат (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru -d api.ваш-домен.ru

# Автообновление
sudo certbot renew --dry-run
```

---

### Вариант 2: Heroku

#### Backend
```bash
# Создайте Procfile
echo "web: gunicorn run:app" > backend/Procfile

# Деплой
cd backend
heroku login
heroku create airshop-backend
heroku addons:create heroku-postgresql:hobby-dev

# Настройте переменные
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=<ваш-ключ>
heroku config:set JWT_SECRET_KEY=<ваш-ключ>
heroku config:set YOOKASSA_SHOP_ID=<ваш-id>
heroku config:set YOOKASSA_SECRET_KEY=<ваш-ключ>
heroku config:set FRONTEND_URL=https://ваш-домен.vercel.app

git init
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Frontend (Vercel)
```bash
# Установите Vercel CLI
npm i -g vercel

cd /path/to/airshop
vercel

# Настройте Environment Variables в веб-интерфейсе:
# REACT_APP_API_URL=https://airshop-backend.herokuapp.com/api
```

---

### Вариант 3: Docker

#### Создайте `docker-compose.yml`:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: airshop
      POSTGRES_USER: airshop_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://airshop_user:secure_password@db:5432/airshop
      FLASK_ENV: production
      SECRET_KEY: ${SECRET_KEY}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
    depends_on:
      - db

  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      REACT_APP_API_URL: http://backend:5000/api

volumes:
  postgres_data:
```

```bash
docker-compose up -d
```

---

## ✅ ФИНАЛЬНАЯ ПРОВЕРКА ПЕРЕД ЗАПУСКОМ

### Безопасность
- [ ] Все секретные ключи изменены
- [ ] PostgreSQL используется вместо SQLite
- [ ] CORS настроен правильно (только ваш домен)
- [ ] Пароль админа сложный и уникальный
- [ ] Rate limiting работает (проверьте логи)

### Функциональность
- [ ] Регистрация/вход в админку работает
- [ ] Создание заказа сохраняется в БД
- [ ] Заказы отображаются в админке
- [ ] Товары загружаются из БД
- [ ] Импорт CSV работает
- [ ] Поиск и фильтры в каталоге работают

### Оплата
- [ ] ЮКасса настроена с реальными ключами
- [ ] Webhook URL настроен в ЮКассе
- [ ] Тестовый платеж проходит успешно
- [ ] `mode: 'production'` в `payment.js`

### Контент
- [ ] Реальные изображения товаров загружены
- [ ] Контактная информация обновлена
- [ ] Hero текст на главной изменен
- [ ] Логотип и favicon заменены
- [ ] Footer copyright обновлен

### SEO
- [ ] Метатеги заполнены
- [ ] robots.txt создан
- [ ] Google Analytics / Yandex Metrika добавлены
- [ ] SSL сертификат установлен (HTTPS)

### Производительность
- [ ] Frontend собран с `npm run build`
- [ ] Nginx кэширует статику
- [ ] Gunicorn использует 4+ workers
- [ ] База данных индексирована

---

## 🚨 ВАЖНЫЕ МОМЕНТЫ

### Резервное копирование
Настройте автоматический backup базы данных:
```bash
# Создайте скрипт backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump airshop > /backups/airshop_$DATE.sql
find /backups -mtime +7 -delete  # Удалять старше 7 дней

# Добавьте в crontab (каждый день в 3 утра)
0 3 * * * /path/to/backup.sh
```

### Мониторинг
Настройте мониторинг сервера:
- **UptimeRobot** - проверка доступности сайта
- **Sentry** - отслеживание ошибок в коде
- **Prometheus + Grafana** - метрики сервера

### Логирование
Настройте ротацию логов:
```bash
sudo nano /etc/logrotate.d/airshop
```

```
/var/log/airshop/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

---

## 📞 ЧТО ДЕЛАТЬ ПОСЛЕ ЗАПУСКА

1. **Тестовый заказ** - создайте полный заказ и оплатите его
2. **Проверьте email** - приходят ли уведомления
3. **Мониторинг** - следите за ошибками первые дни
4. **Backup** - убедитесь что backup работает
5. **SSL** - проверьте https://www.ssllabs.com/ssltest/
6. **Скорость** - протестируйте на https://pagespeed.web.dev/
7. **Мобильная версия** - проверьте на разных устройствах

---

## 🆘 ПОДДЕРЖКА

Если возникли проблемы:

1. **Проверьте логи:**
   - Backend: `journalctl -u airshop-backend -f`
   - Nginx: `sudo tail -f /var/log/nginx/error.log`

2. **Проверьте процессы:**
   ```bash
   sudo systemctl status airshop-backend
   sudo systemctl status nginx
   sudo systemctl status postgresql
   ```

3. **Проверьте соединение с БД:**
   ```bash
   psql -U airshop_user -d airshop -h localhost
   ```

4. **Перезапустите сервисы:**
   ```bash
   sudo systemctl restart airshop-backend
   sudo systemctl restart nginx
   ```

---

**Удачи с запуском! 🚀**
