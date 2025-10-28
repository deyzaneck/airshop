"""
Роуты для работы с товарами
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db, limiter
from app.models import Product

bp = Blueprint('products', __name__)


@bp.route('', methods=['GET'])
@limiter.limit("100 per minute")
def get_products():
    """
    Получить список всех товаров

    Query params:
        category: string (optional) - фильтр по категории
        search: string (optional) - поиск по названию/бренду
        featured: boolean (optional) - только избранные
        visible: boolean (optional, default: true) - только видимые

    Response JSON:
        products: array
    """
    try:
        query = Product.query

        # Фильтр по видимости (по умолчанию только видимые)
        visible = request.args.get('visible', 'true').lower() == 'true'
        if visible:
            query = query.filter_by(is_visible=True)

        # Фильтр по категории
        category = request.args.get('category')
        if category and category != 'all':
            query = query.filter_by(category=category)

        # Фильтр по избранным
        featured = request.args.get('featured')
        if featured and featured.lower() == 'true':
            query = query.filter_by(is_featured=True)

        # Поиск
        search = request.args.get('search')
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                db.or_(
                    Product.name.ilike(search_pattern),
                    Product.brand.ilike(search_pattern),
                    Product.description.ilike(search_pattern)
                )
            )

        products = query.all()
        return jsonify({
            'products': [product.to_dict() for product in products]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:product_id>', methods=['GET'])
@limiter.limit("100 per minute")
def get_product(product_id):
    """
    Получить товар по ID

    Response JSON:
        product: object
    """
    try:
        product = Product.query.get(product_id)

        if not product:
            return jsonify({'error': 'Product not found'}), 404

        return jsonify({'product': product.to_dict()}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('', methods=['POST'])
@jwt_required()
@limiter.limit("20 per hour")
def create_product():
    """
    Создать новый товар (только для авторизованных админов)

    Request JSON:
        name: string
        brand: string
        price: float
        oldPrice: float (optional)
        discount: int (optional)
        volume: string
        category: string
        description: string
        image: string
        isFeatured: boolean (optional)
        isNew: boolean (optional)

    Response JSON:
        product: object
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Валидация обязательных полей
        required_fields = ['name', 'brand', 'price', 'volume', 'category', 'description', 'image']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Создание товара
        product = Product(
            name=data['name'],
            brand=data['brand'],
            price=data['price'],
            old_price=data.get('oldPrice'),
            discount=data.get('discount', 0),
            volume=data['volume'],
            category=data['category'],
            description=data['description'],
            image=data['image'],
            is_featured=data.get('isFeatured', False),
            is_new=data.get('isNew', False),
            is_visible=data.get('isVisible', True)
        )

        db.session.add(product)
        db.session.commit()

        return jsonify({'product': product.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
@limiter.limit("30 per hour")
def update_product(product_id):
    """
    Обновить товар (только для авторизованных админов)

    Request JSON:
        name: string (optional)
        brand: string (optional)
        price: float (optional)
        oldPrice: float (optional)
        discount: int (optional)
        volume: string (optional)
        category: string (optional)
        description: string (optional)
        image: string (optional)
        isFeatured: boolean (optional)
        isNew: boolean (optional)
        isVisible: boolean (optional)

    Response JSON:
        product: object
    """
    try:
        product = Product.query.get(product_id)

        if not product:
            return jsonify({'error': 'Product not found'}), 404

        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Обновление полей
        if 'name' in data:
            product.name = data['name']
        if 'brand' in data:
            product.brand = data['brand']
        if 'price' in data:
            product.price = data['price']
        if 'oldPrice' in data:
            product.old_price = data['oldPrice']
        if 'discount' in data:
            product.discount = data['discount']
        if 'volume' in data:
            product.volume = data['volume']
        if 'category' in data:
            product.category = data['category']
        if 'description' in data:
            product.description = data['description']
        if 'image' in data:
            product.image = data['image']
        if 'isFeatured' in data:
            product.is_featured = data['isFeatured']
        if 'isNew' in data:
            product.is_new = data['isNew']
        if 'isVisible' in data:
            product.is_visible = data['isVisible']

        db.session.commit()

        return jsonify({'product': product.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
@limiter.limit("20 per hour")
def delete_product(product_id):
    """
    Удалить товар (только для авторизованных админов)

    Response JSON:
        message: string
    """
    try:
        product = Product.query.get(product_id)

        if not product:
            return jsonify({'error': 'Product not found'}), 404

        db.session.delete(product)
        db.session.commit()

        return jsonify({'message': 'Product deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/bulk', methods=['POST'])
@jwt_required()
@limiter.limit("5 per hour")
def bulk_create_products():
    """
    Массовое создание товаров (только для авторизованных админов)

    Request JSON:
        products: array of product objects

    Response JSON:
        created: int
        products: array
    """
    try:
        data = request.get_json()

        if not data or 'products' not in data:
            return jsonify({'error': 'No products data provided'}), 400

        products_data = data['products']
        created_products = []

        for product_data in products_data:
            product = Product(
                name=product_data.get('name'),
                brand=product_data.get('brand'),
                price=product_data.get('price'),
                old_price=product_data.get('oldPrice'),
                discount=product_data.get('discount', 0),
                volume=product_data.get('volume'),
                category=product_data.get('category'),
                description=product_data.get('description'),
                image=product_data.get('image'),
                is_featured=product_data.get('isFeatured', False),
                is_new=product_data.get('isNew', False),
                is_visible=product_data.get('isVisible', True)
            )
            db.session.add(product)
            created_products.append(product)

        db.session.commit()

        return jsonify({
            'created': len(created_products),
            'products': [p.to_dict() for p in created_products]
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/reimport', methods=['POST'])
@jwt_required()
@limiter.limit("1 per hour")
def reimport_products():
    """
    Удалить все продукты и переимпортировать из CSV
    (только для авторизованных админов, 1 раз в час)

    Response JSON:
        message: string
        deleted: int
        imported: int
    """
    try:
        # Удаляем все продукты
        deleted_count = Product.query.delete()
        db.session.commit()

        # Импортируем из CSV
        import os
        import csv
        import re

        def parse_price(price_str):
            price_clean = re.sub(r'[^\d]', '', str(price_str))
            return float(price_clean) if price_clean else 0.0

        def parse_category(name):
            name_lower = name.lower()
            if any(word in name_lower for word in ['men', 'homme', 'мужск']):
                return 'men'
            elif any(word in name_lower for word in ['women', 'femme', 'женск', 'miss', 'lady']):
                return 'women'
            else:
                return 'unisex'

        csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'table.csv')

        if not os.path.exists(csv_path):
            return jsonify({
                'error': f'CSV file not found: {csv_path}',
                'deleted': deleted_count
            }), 404

        imported_count = 0

        with open(csv_path, 'r', encoding='utf-8-sig') as file:
            csv_reader = csv.DictReader(file, delimiter=';')

            for row in csv_reader:
                try:
                    name = row.get('Название', '').strip()
                    if not name:
                        continue

                    description = row.get('Описание', '').strip()
                    price_str = row.get('Цена', '0').strip()
                    discount_str = row.get('Скидка (в процентах)', '0').strip()
                    image_url = row.get('Изображения (через ;)', '').strip()

                    price = parse_price(price_str)
                    discount = int(discount_str) if discount_str.isdigit() else 0

                    old_price = None
                    if discount > 0:
                        old_price = price / (1 - discount / 100)

                    brand = name.split()[0] if name else 'Unknown'
                    volume_match = re.search(r'(\d+)\s*мл', name)
                    volume = volume_match.group(1) + 'мл' if volume_match else '100мл'
                    category = parse_category(name)

                    product = Product(
                        name=name,
                        brand=brand,
                        price=price,
                        old_price=old_price,
                        discount=discount,
                        volume=volume,
                        category=category,
                        description=description or f"Оригинальный парфюм {name}",
                        image=image_url or 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
                        is_featured=imported_count < 4,
                        is_new=False,
                        is_visible=True
                    )

                    db.session.add(product)
                    imported_count += 1

                except Exception as e:
                    print(f"⚠️  Ошибка импорта товара: {str(e)}")
                    continue

        db.session.commit()

        return jsonify({
            'message': 'Products reimported successfully',
            'deleted': deleted_count,
            'imported': imported_count
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
