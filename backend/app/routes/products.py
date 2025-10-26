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
