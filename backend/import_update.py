"""
Import script for table_update.csv
Imports products from CSV file into the database with proper categorization
"""
import csv
import re
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from app.models.product import Product

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
    # Remove all non-digit characters
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

def import_products():
    """Import products from table_update.csv"""
    app = create_app()

    with app.app_context():
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'table_update.csv')

        print(f"[INFO] Reading CSV from: {csv_path}")

        # Clear existing products first
        Product.query.delete()
        db.session.commit()
        print("[INFO] Cleared existing products")

        imported_count = 0

        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f, delimiter=';')

            for row in reader:
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

                    # Default volume (можно добавить парсинг из описания)
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

                    print(f"[OK] {name} - {category} - {price}RUB")

                except Exception as e:
                    print(f"[ERROR] Error importing row: {e}")
                    print(f"   Row data: {row}")
                    continue

        # Commit all changes
        db.session.commit()
        print(f"\n[SUCCESS] Successfully imported {imported_count} products!")

if __name__ == '__main__':
    import_products()
