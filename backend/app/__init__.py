"""
Инициализация Flask приложения
"""
import os
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import config

# Инициализация расширений
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)


def create_app(config_name='development'):
    """
    Фабрика приложения Flask

    Args:
        config_name: название конфигурации ('development', 'production', 'testing')

    Returns:
        Flask app instance
    """
    # Определяем путь к статическим файлам React
    static_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'build')

    app = Flask(__name__,
                static_folder=static_folder,
                static_url_path='')

    # Загрузка конфигурации
    app.config.from_object(config[config_name])

    # Инициализация расширений
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"[JWT] Token expired: {jwt_header}")
        return {'error': 'Token has expired'}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"[JWT] Invalid token: {str(error)}")
        return {'error': 'Invalid token', 'message': str(error)}, 422

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        print(f"[JWT] Unauthorized: {str(error)}")
        return {'error': 'Missing authorization header', 'message': str(error)}, 401

    @jwt.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        print(f"[JWT] Token not fresh")
        return {'error': 'Fresh token required'}, 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        print(f"[JWT] Token revoked")
        return {'error': 'Token has been revoked'}, 401

    # Настройка CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config['CORS_ORIGINS'],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
            "max_age": 3600
        }
    })

    # Security headers middleware
    @app.after_request
    def add_security_headers(response):
        """Добавление security headers ко всем ответам"""
        # HSTS - принудительное использование HTTPS
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'

        # XSS Protection
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'

        # Content Security Policy
        if config_name == 'production':
            response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"

        # Prevent caching sensitive data
        if '/api/auth' in str(response.headers.get('Location', '')) or '/api/orders' in str(response.headers.get('Location', '')):
            response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, private'
            response.headers['Pragma'] = 'no-cache'

        return response

    # Регистрация blueprints
    from app.routes import auth, products, orders, payment, settings

    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(products.bp, url_prefix='/api/products')
    app.register_blueprint(orders.bp, url_prefix='/api/orders')
    app.register_blueprint(payment.bp, url_prefix='/api/payment')
    app.register_blueprint(settings.bp, url_prefix='/api/settings')

    # Отдача статических файлов React (только в production)
    if config_name == 'production' and os.path.exists(static_folder):
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_react(path):
            # Если это API запрос, пропускаем
            if path.startswith('api/'):
                return {'error': 'Not found'}, 404

            # Если файл существует, отдаем его
            if path and os.path.exists(os.path.join(app.static_folder, path)):
                return send_from_directory(app.static_folder, path)

            # Иначе отдаем index.html (для React Router)
            return send_from_directory(app.static_folder, 'index.html')

    # Обработчики ошибок
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'error': 'Internal server error'}, 500

    @app.errorhandler(429)
    def ratelimit_handler(e):
        return {'error': 'Rate limit exceeded. Please try again later.'}, 429

    # Создание таблиц БД
    with app.app_context():
        # Проверяем существование таблиц перед созданием
        inspector = db.inspect(db.engine)
        if not inspector.has_table('users'):
            db.create_all()
            print("✓ Database tables created")

        # Создание дефолтного админа если его нет
        from app.models import User
        try:
            admin = User.query.filter_by(username='admin').first()
            if not admin:
                admin = User(
                    username=app.config['ADMIN_USERNAME'],
                    email=app.config['ADMIN_EMAIL']
                )
                admin.set_password(app.config['ADMIN_PASSWORD'])
                db.session.add(admin)
                db.session.commit()
                print(f"✓ Default admin user created: {admin.username}")
        except Exception as e:
            # Игнорируем ошибки если admin уже создан другим worker
            db.session.rollback()

    return app
