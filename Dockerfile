# Dockerfile для Railway - только backend
FROM python:3.9-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только backend файлы
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь backend код
COPY backend/ .

# Копируем table.csv для импорта продуктов
COPY table.csv /app/table.csv

# Открываем порт
EXPOSE $PORT

# Запускаем Gunicorn с --preload для инициализации БД до fork workers
CMD gunicorn --preload -w 4 -b 0.0.0.0:$PORT run:app
