"""
Admin CSV import endpoint
Allows admin to import products from CSV data via API
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import csv
import re
import io

from app import db
from app.models.product import Product
from app.models.user import User

bp = Blueprint('admin_import', __name__, url_prefix='/api/admin')

# Category mapping based on perfume knowledge
CATEGORY_MAP = {
    # Men's fragrances
    'versace eros': 'men',
    'versace eros energy': 'men',
    'versace eros flame': 'men',
    'versace pour homme': 'men',
    'dior sauvage': 'men',
    'dior fahrenheit': 'men',
    'bleu de chanel': 'men',
    'terre d\'hermes': 'men',
    'tom ford noir': 'men',
    'tom ford noir extreme': 'men',
    'creed aventus': 'men',

    # Women's fragrances
    'dior j\'adore': 'women',
    'dior hypnotic poison': 'women',
    'miss dior blooming bouquet': 'women',
    'chanel chance eau tendre': 'women',
    'yves saint laurent black opium': 'women',
    'ysl libre': 'women',
    'libre': 'women',
    'gucci bloom': 'women',
    'gucci flora': 'women',
    'gucci guilty elixir': 'women',
    'chloe cedrus': 'women',
    'narciso rodriguez narciso poudre': 'women',
    'guerlain mon guerlain': 'women',
    'giorgio armani my way': 'women',
    'givenchy irresistible': 'women',
    'tiffany & co': 'women',
    'trussardi donna': 'women',
    'burberry blush': 'women',
    'kilian princess': 'women',
    'guerlain aqua allegoria': 'women',

    # Unisex fragrances
    'baccarat rouge 540': 'unisex',
    'byredo blanche': 'unisex',
    'byredo gypsy water': 'unisex',
    'byredo la tulipe': 'unisex',
    'byredo reine de nuit': 'unisex',
    'xerjoff erba pura': 'unisex',
    'mancera cedrat boise': 'unisex',
    'ajmal amber wood': 'unisex',
    'amouage guidance': 'unisex',
    'amouage outlands': 'unisex',
    'kajal dahab': 'unisex',
    'tom ford ombre leather': 'unisex',
}

def parse_price(price_str):
    """Extract numeric price from string like '7 500 ₽'"""
    price_digits = re.sub(r'[^\d]', '', price_str)
    return int(price_digits) if price_digits else 0

def get_category(brand, model):
    """Determine category based on brand and model"""
    full_name = f"{brand} {model}".lower()

    # Check exact matches first
    for key, category in CATEGORY_MAP.items():
        if key in full_name:
            return category

    # Default to unisex if unknown
    return 'unisex'

@bp.route('/import-csv', methods=['POST'])
@jwt_required()
def import_csv():
    """
    Import products from CSV data

    Expects JSON body with 'csv_data' field containing CSV text
    Admin only endpoint
    """
    try:
        # Check if user is admin
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        # Get CSV data from request
        data = request.get_json()
        csv_text = data.get('csv_data')

        if not csv_text:
            return jsonify({'error': 'No CSV data provided'}), 400

        # Clear existing products
        Product.query.delete()
        db.session.commit()

        # Parse CSV
        csv_file = io.StringIO(csv_text)
        reader = csv.DictReader(csv_file, delimiter=';')

        imported_count = 0
        errors = []

        for row_num, row in enumerate(reader, start=2):
            try:
                brand = row['Бренд'].strip()
                model = row['Модель'].strip()
                description = row['Описание'].strip()
                price_str = row['Цена'].strip()
                discount_str = row['Скидка (в процентах)'].strip()
                image_url = row['Изображения (через ;)'].strip()

                # Parse price and discount
                price = parse_price(price_str)
                discount = int(discount_str) if discount_str.isdigit() else 0

                # Calculate old price if discount exists
                old_price = None
                if discount > 0:
                    old_price = int(price / (1 - discount / 100))

                # Determine category
                category = get_category(brand, model)

                # Create full name
                name = f"{brand} {model}"

                # Default volume
                volume = "100мл"

                # Create product
                product = Product(
                    name=name,
                    brand=brand,
                    price=price,
                    old_price=old_price,
                    discount=discount,
                    volume=volume,
                    category=category,
                    description=description,
                    image=image_url,
                    is_featured=False,
                    is_new=False,
                    is_visible=True
                )

                db.session.add(product)
                imported_count += 1

            except Exception as e:
                errors.append({
                    'row': row_num,
                    'error': str(e),
                    'data': dict(row)
                })
                continue

        # Commit all changes
        db.session.commit()

        return jsonify({
            'success': True,
            'imported': imported_count,
            'errors': errors if errors else None,
            'message': f'Successfully imported {imported_count} products'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
