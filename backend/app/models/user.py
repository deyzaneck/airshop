"""
Модель пользователя (User) для администраторов
"""
from datetime import datetime
from app import db, bcrypt


class User(db.Model):
    """Модель пользователя-администратора"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # Роль пользователя
    role = db.Column(db.String(20), default='admin', nullable=False)  # 'admin', 'superadmin'

    # Метаданные
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    def set_password(self, password):
        """Хэширует и сохраняет пароль"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Проверяет пароль"""
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self, include_sensitive=False):
        """Конвертация в словарь для API"""
        result = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastLogin': self.last_login.isoformat() if self.last_login else None
        }

        if include_sensitive:
            result['passwordHash'] = self.password_hash

        return result

    def __repr__(self):
        return f'<User {self.username}>'
