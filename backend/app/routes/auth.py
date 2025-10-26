"""
Роуты для аутентификации
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from app import db, limiter
from app.models import User

bp = Blueprint('auth', __name__)


@bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """
    Вход администратора

    Request JSON:
        username: string
        password: string

    Response JSON:
        access_token: string
        user: object
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        # Поиск пользователя
        user = User.query.filter_by(username=username).first()

        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid username or password'}), 401

        if not user.is_active:
            return jsonify({'error': 'Account is disabled'}), 403

        # Обновление времени последнего входа
        user.last_login = datetime.utcnow()
        db.session.commit()

        # Создание JWT токена (identity должен быть строкой!)
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/verify', methods=['GET'])
@jwt_required()
def verify():
    """
    Проверка JWT токена

    Response JSON:
        user: object
    """
    try:
        user_id = get_jwt_identity()
        print(f"[AUTH VERIFY] User ID from token (string): {user_id}")

        # Конвертируем строку обратно в int
        user_id = int(user_id)
        print(f"[AUTH VERIFY] User ID converted to int: {user_id}")

        user = User.query.get(user_id)

        if not user:
            print(f"[AUTH VERIFY] User not found for ID: {user_id}")
            return jsonify({'error': 'User not found'}), 404

        if not user.is_active:
            print(f"[AUTH VERIFY] User {user_id} is not active")
            return jsonify({'error': 'Account is disabled'}), 403

        print(f"[AUTH VERIFY] Success for user: {user.username}")
        return jsonify({'user': user.to_dict()}), 200

    except Exception as e:
        print(f"[AUTH VERIFY] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@bp.route('/register', methods=['POST'])
@jwt_required()
@limiter.limit("3 per hour")
def register():
    """
    Регистрация нового администратора (только для существующих админов)

    Request JSON:
        username: string
        email: string
        password: string
        role: string (optional, default: 'admin')

    Response JSON:
        user: object
    """
    try:
        # Проверка что запрос делает существующий админ
        current_user_id = int(get_jwt_identity())
        current_user = User.query.get(current_user_id)

        if not current_user or current_user.role != 'superadmin':
            return jsonify({'error': 'Permission denied. Only superadmins can create new users.'}), 403

        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'admin')

        # Валидация
        if not username or not email or not password:
            return jsonify({'error': 'Username, email, and password are required'}), 400

        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400

        # Проверка на существующего пользователя
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 409

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 409

        # Создание пользователя
        user = User(
            username=username,
            email=email,
            role=role
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return jsonify({'user': user.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/change-password', methods=['POST'])
@jwt_required()
@limiter.limit("3 per hour")
def change_password():
    """
    Изменение пароля

    Request JSON:
        old_password: string
        new_password: string

    Response JSON:
        message: string
    """
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if not old_password or not new_password:
            return jsonify({'error': 'Old password and new password are required'}), 400

        if not user.check_password(old_password):
            return jsonify({'error': 'Invalid old password'}), 401

        if len(new_password) < 8:
            return jsonify({'error': 'New password must be at least 8 characters long'}), 400

        user.set_password(new_password)
        db.session.commit()

        return jsonify({'message': 'Password changed successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
