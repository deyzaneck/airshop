# 🚀 Как запустить сайт AirShop

Пошаговая инструкция по запуску полнофункционального сайта с бэкендом и фронтендом.

---

## 📋 Предварительные требования

Убедитесь что у вас установлено:
- ✅ Python 3.8+ ([скачать](https://www.python.org/downloads/))
- ✅ Node.js 14+ ([скачать](https://nodejs.org/))
- ✅ npm (устанавливается вместе с Node.js)

---

## 🔧 Шаг 1: Запуск бэкенда

### 1.1. Откройте первое окно терминала

**Windows (PowerShell):**
```powershell
cd "c:\Users\admin\Desktop\airshop-fixed (5)\airshop-fixed\backend"
```

**Linux/Mac:**
```bash
cd ~/Desktop/airshop-fixed/backend
```

### 1.2. Активируйте виртуальное окружение

Если вы еще не создали виртуальное окружение:

**Windows:**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

После активации вы увидите `(venv)` в начале строки терминала.

### 1.3. Установите зависимости (если еще не установлены)

```bash
pip install -r requirements.txt
```

### 1.4. Добавьте тестовые товары (первый запуск)

```bash
python init_db.py --sample
```

Это создаст 4 примера товаров в базе данных.

### 1.5. Запустите бэкенд сервер

```bash
python run.py
```

Вы должны увидеть:
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                   🛍️  AIRSHOP BACKEND                    ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║  Environment: development                                 ║
║  Server:      http://0.0.0.0:5000                         ║
║  Debug mode:  True                                        ║
╚═══════════════════════════════════════════════════════════╝

 * Running on http://127.0.0.1:5000
```

✅ **Бэкенд работает!** Не закрывайте это окно терминала.

---

## 🎨 Шаг 2: Запуск фронтенда

### 2.1. Откройте ВТОРОЕ окно терминала

**Windows (PowerShell):**
```powershell
cd "c:\Users\admin\Desktop\airshop-fixed (5)\airshop-fixed"
```

**Linux/Mac:**
```bash
cd ~/Desktop/airshop-fixed
```

### 2.2. Установите зависимости (если еще не установлены)

```bash
npm install
```

### 2.3. Запустите фронтенд

```bash
npm start
```

Через несколько секунд браузер автоматически откроется на `http://localhost:3000`

✅ **Фронтенд работает!**

---

## 🎉 Готово! Сайт запущен

Теперь у вас работают оба сервера:
- **Бэкенд:** http://127.0.0.1:5000 (первое окно терминала)
- **Фронтенд:** http://localhost:3000 (второе окно терминала, + браузер)

---

## 🔐 Вход в админку

1. Откройте в браузере: http://localhost:3000/admin/login
2. Введите учетные данные:
   - **Login:** `admin`
   - **Password:** `changeme123`
3. Нажмите "Войти"

Теперь вы можете:
- ✅ Добавлять/редактировать/удалять товары
- ✅ Просматривать заказы
- ✅ Изменять настройки сайта
- ✅ Управлять статусами заказов

---

## 🛑 Как остановить серверы

### Остановить бэкенд
В первом окне терминала нажмите:
```
Ctrl + C
```

### Остановить фронтенд
Во втором окне терминала нажмите:
```
Ctrl + C
```

---

## 🔄 Повторный запуск (после первого раза)

После того как вы один раз всё установили, для запуска нужно только:

### Окно 1 - Бэкенд:
```powershell
cd "c:\Users\admin\Desktop\airshop-fixed (5)\airshop-fixed\backend"
.\venv\Scripts\activate
python run.py
```

### Окно 2 - Фронтенд:
```powershell
cd "c:\Users\admin\Desktop\airshop-fixed (5)\airshop-fixed"
npm start
```

---

## 📁 Структура проекта

```
airshop-fixed/
├── backend/              # Python Flask бэкенд
│   ├── app/             # Код приложения
│   │   ├── models/      # Модели БД (Product, Order, User)
│   │   ├── routes/      # API эндпоинты
│   │   └── services/    # Сервисы (ЮКасса)
│   ├── venv/            # Виртуальное окружение Python
│   ├── run.py           # Запуск сервера
│   └── airshop.db       # База данных SQLite
│
├── src/                 # React фронтенд
│   ├── api/            # API клиент и сервисы
│   ├── components/     # React компоненты
│   ├── pages/          # Страницы сайта
│   └── utils/          # Утилиты
│
└── public/             # Статические файлы
```

---

## ❓ Частые проблемы

### "Товаров нет на сайте"

**Решение:**
```bash
cd backend
python init_db.py --sample
```

### "Ошибка CORS"

**Проблема:** Бэкенд не запущен или запущен на другом порту.

**Решение:** Убедитесь что бэкенд работает на `http://127.0.0.1:5000`

### "Не могу войти в админку"

**Решение:** Используйте:
- Login: `admin`
- Password: `changeme123`

Если не работает, пересоздайте базу данных:
```bash
cd backend
del airshop.db  # Windows
rm airshop.db   # Linux/Mac
python init_db.py --sample
```

### "Port 3000 is already in use"

**Решение:**
- Закройте предыдущий процесс фронтенда (Ctrl+C)
- Или используйте другой порт:
```bash
set PORT=3001  # Windows
export PORT=3001  # Linux/Mac
npm start
```

### "Port 5000 is already in use"

**Решение:**
Измените порт в `backend/.env`:
```
PORT=5001
```

---

## 📚 Дополнительная информация

- [BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md) - Архитектура бэкенда
- [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) - Интеграция фронтенда
- [YOOKASSA_SETUP.md](YOOKASSA_SETUP.md) - Настройка платежей

---

## 💡 Полезные команды

### Создать нового администратора
```bash
cd backend
python
>>> from app import create_app, db
>>> from app.models import User
>>> app = create_app()
>>> with app.app_context():
...     user = User(username='admin2', email='admin2@airshop.ru')
...     user.set_password('password123')
...     db.session.add(user)
...     db.session.commit()
```

### Очистить базу данных
```bash
cd backend
del airshop.db           # Windows
rm airshop.db            # Linux/Mac
python init_db.py
```

### Посмотреть логи бэкенда
Все SQL запросы отображаются в терминале в development режиме.

---

**Готово! Приятной работы с AirShop! 🎉**
