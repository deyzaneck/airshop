"""
Роуты для работы с настройками сайта
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db, limiter
import json

bp = Blueprint('settings', __name__)

# Настройки хранятся в простой таблице key-value
# Для простоты используем JSON файл или создадим отдельную модель


class SiteSettings:
    """Простой класс для работы с настройками"""

    DEFAULT_SETTINGS = {
        'hero': {
            'title': 'Добро пожаловать в AirShop',
            'subtitle': 'Откройте для себя мир изысканных ароматов'
        },
        'contact': {
            'phone': '+7 (999) 123-45-67',
            'email': 'info@airshop.ru',
            'telegram': '@airshop_support'
        },
        'shipping': {
            'freeShippingThreshold': 5000,
            'standardShippingCost': 300
        },
        'business': {
            'companyName': 'AirShop',
            'address': 'Москва, Россия',
            'workingHours': 'Пн-Пт: 10:00 - 20:00'
        }
    }

    @staticmethod
    def get_settings_file_path():
        """Путь к файлу настроек"""
        import os
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        return os.path.join(base_dir, 'site_settings.json')

    @classmethod
    def load(cls):
        """Загрузить настройки из файла"""
        try:
            with open(cls.get_settings_file_path(), 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            # Если файл не существует, возвращаем дефолтные настройки
            return cls.DEFAULT_SETTINGS.copy()

    @classmethod
    def save(cls, settings):
        """Сохранить настройки в файл"""
        with open(cls.get_settings_file_path(), 'w', encoding='utf-8') as f:
            json.dump(settings, f, ensure_ascii=False, indent=2)


@bp.route('', methods=['GET'])
@limiter.limit("100 per minute")
def get_settings():
    """
    Получить настройки сайта

    Response JSON:
        settings: object
    """
    try:
        settings = SiteSettings.load()
        return jsonify({'settings': settings}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('', methods=['PUT'])
@jwt_required()
@limiter.limit("20 per hour")
def update_settings():
    """
    Обновить настройки сайта (только для авторизованных админов)

    Request JSON:
        settings: object

    Response JSON:
        settings: object
    """
    try:
        data = request.get_json()

        if not data or 'settings' not in data:
            return jsonify({'error': 'Settings data is required'}), 400

        new_settings = data['settings']

        # Сохранение настроек
        SiteSettings.save(new_settings)

        return jsonify({'settings': new_settings}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/hero', methods=['PUT'])
@jwt_required()
@limiter.limit("30 per hour")
def update_hero_settings():
    """
    Обновить настройки главной страницы (только для авторизованных админов)

    Request JSON:
        title: string
        subtitle: string

    Response JSON:
        hero: object
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        settings = SiteSettings.load()

        if 'title' in data:
            settings['hero']['title'] = data['title']
        if 'subtitle' in data:
            settings['hero']['subtitle'] = data['subtitle']

        SiteSettings.save(settings)

        return jsonify({'hero': settings['hero']}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/contact', methods=['PUT'])
@jwt_required()
@limiter.limit("30 per hour")
def update_contact_settings():
    """
    Обновить контактную информацию (только для авторизованных админов)

    Request JSON:
        phone: string
        email: string
        telegram: string

    Response JSON:
        contact: object
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        settings = SiteSettings.load()

        if 'phone' in data:
            settings['contact']['phone'] = data['phone']
        if 'email' in data:
            settings['contact']['email'] = data['email']
        if 'telegram' in data:
            settings['contact']['telegram'] = data['telegram']

        SiteSettings.save(settings)

        return jsonify({'contact': settings['contact']}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/reset', methods=['POST'])
@jwt_required()
@limiter.limit("5 per hour")
def reset_settings():
    """
    Сбросить настройки к дефолтным (только для авторизованных админов)

    Response JSON:
        settings: object
    """
    try:
        default_settings = SiteSettings.DEFAULT_SETTINGS.copy()
        SiteSettings.save(default_settings)

        return jsonify({'settings': default_settings}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
