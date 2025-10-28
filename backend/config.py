"""
Конфигурация Flask приложения
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

class Config:
    """Базовая конфигурация"""

    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = False
    TESTING = False

    # Database
    database_url = os.getenv('DATABASE_URL', 'sqlite:///airshop.db')

    # Fix для Railway: postgres:// -> postgresql://
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)

    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

    # SSL настройки для PostgreSQL (Railway)
    if database_url.startswith('postgresql://'):
        SQLALCHEMY_ENGINE_OPTIONS = {
            'connect_args': {
                'sslmode': 'require',
                'connect_timeout': 10
            },
            'pool_pre_ping': True,  # Проверка соединения перед использованием
            'pool_recycle': 300,    # Пересоздание соединений каждые 5 минут
        }
    else:
        SQLALCHEMY_ENGINE_OPTIONS = {}

    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))
    )
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    JWT_ERROR_MESSAGE_KEY = 'error'
    # Disable CSRF protection for API (using headers, not cookies)
    JWT_CSRF_CHECK_FORM = False
    JWT_CSRF_IN_COOKIES = False

    # CORS
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    CORS_ORIGINS = [FRONTEND_URL]
    CORS_SUPPORTS_CREDENTIALS = True

    # ЮКасса
    YOOKASSA_SHOP_ID = os.getenv('YOOKASSA_SHOP_ID', '')
    YOOKASSA_SECRET_KEY = os.getenv('YOOKASSA_SECRET_KEY', '')
    YOOKASSA_API_URL = 'https://api.yookassa.ru/v3'
    PAYMENT_RETURN_URL = os.getenv('PAYMENT_RETURN_URL', f"{FRONTEND_URL}/payment/success")

    # Email (опционально)
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')

    # Admin
    ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'changeme123')
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@airshop.ru')

    # Rate Limiting
    RATELIMIT_STORAGE_URL = os.getenv('RATELIMIT_STORAGE_URL', 'memory://')
    RATELIMIT_DEFAULT = "200 per day;50 per hour"
    RATELIMIT_HEADERS_ENABLED = True

    # Pagination
    PRODUCTS_PER_PAGE = 20
    ORDERS_PER_PAGE = 50


class DevelopmentConfig(Config):
    """Конфигурация для разработки"""
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """Конфигурация для production"""
    DEBUG = False
    TESTING = False

    # В production обязательно установите эти переменные!
    SECRET_KEY = os.getenv('SECRET_KEY')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

    # Проверка наличия критичных переменных
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY must be set in production!")
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY must be set in production!")


class TestingConfig(Config):
    """Конфигурация для тестирования"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


# Словарь конфигураций
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Получить конфигурацию по переменной окружения"""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
