"""
Точка входа Flask приложения
"""
import os
import csv
import re
from app import create_app, db
from app.models import Product

# Определение окружения (development, production, testing)
config_name = os.getenv('FLASK_ENV', 'development')

# Создание приложения
app = create_app(config_name)

def parse_price(price_str):
    """Извлекает числовое значение цены из строки"""
    price_clean = re.sub(r'[^\d]', '', str(price_str))
    return float(price_clean) if price_clean else 0.0

def parse_category(name):
    """Определяет категорию товара по названию"""
    name_lower = name.lower()
    if any(word in name_lower for word in ['men', 'homme', 'мужск']):
        return 'men'
    elif any(word in name_lower for word in ['women', 'femme', 'женск', 'miss', 'lady']):
        return 'women'
    else:
        return 'unisex'

def import_products_from_csv():
    """Импорт товаров из CSV файла"""
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'table.csv')

    if not os.path.exists(csv_path):
        print(f"⚠️  CSV файл не найден: {csv_path}")
        return 0

    imported_count = 0

    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as file:
            csv_reader = csv.DictReader(file, delimiter=';')

            for row in csv_reader:
                try:
                    name = row.get('Название', '').strip()
                    if not name:
                        continue

                    # Проверка, существует ли товар
                    if Product.query.filter_by(name=name).first():
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
                        is_featured=imported_count < 4,  # Первые 4 товара делаем избранными
                        is_new=False,
                        is_visible=True
                    )

                    db.session.add(product)
                    imported_count += 1

                except Exception as e:
                    print(f"⚠️  Ошибка импорта товара: {str(e)}")
                    continue

        db.session.commit()
        return imported_count

    except Exception as e:
        print(f"⚠️  Ошибка чтения CSV: {str(e)}")
        db.session.rollback()
        return 0

# Автоматическая инициализация товаров для production
if config_name == 'production':
    with app.app_context():
        current_count = Product.query.count()

        if current_count == 0:
            print("🔄 Initializing products...")

            # Попытка импорта из CSV
            imported = import_products_from_csv()

            if imported > 0:
                print(f"✓ Imported {imported} products from CSV")
            else:
                # Если CSV не найден или импорт не удался, создаем примеры
                print("📦 Creating sample products...")

                sample_products = [
                    {
                        'name': 'Chanel No. 5',
                        'brand': 'Chanel',
                        'price': 8500,
                        'old_price': 10000,
                        'discount': 15,
                        'volume': '100ml',
                        'category': 'women',
                        'description': 'Легендарный аромат от Chanel. Утонченный цветочный букет с нотами иланг-иланга и жасмина.',
                        'image': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
                        'is_featured': True,
                        'is_new': False,
                        'is_visible': True
                    },
                    {
                        'name': 'Dior Sauvage',
                        'brand': 'Dior',
                        'price': 7200,
                        'volume': '100ml',
                        'category': 'men',
                        'description': 'Мужской аромат с пряными и древесными нотами. Свежий и энергичный.',
                        'image': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400',
                        'is_featured': True,
                        'is_new': False,
                        'is_visible': True
                    },
                    {
                        'name': 'Gucci Bloom',
                        'brand': 'Gucci',
                        'price': 6800,
                        'old_price': 7500,
                        'discount': 9,
                        'volume': '50ml',
                        'category': 'women',
                        'description': 'Цветочный аромат с нотами жасмина и туберозы. Романтичный и женственный.',
                        'image': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400',
                        'is_featured': True,
                        'is_new': True,
                        'is_visible': True
                    },
                    {
                        'name': 'Tom Ford Black Orchid',
                        'brand': 'Tom Ford',
                        'price': 12000,
                        'volume': '100ml',
                        'category': 'unisex',
                        'description': 'Роскошный восточный аромат с нотами черной орхидеи и пачули.',
                        'image': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400',
                        'is_featured': True,
                        'is_new': False,
                        'is_visible': True
                    },
                ]

                for product_data in sample_products:
                    product = Product(**product_data)
                    db.session.add(product)

                db.session.commit()
                print(f"✓ Created {len(sample_products)} sample products")
        else:
            print(f"✓ Database already has {current_count} products")

if __name__ == '__main__':
    # Настройки для development сервера
    debug = config_name == 'development'
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')

    print(f"""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                   🛍️  AIRSHOP BACKEND                    ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║  Environment: {config_name:<43} ║
║  Server:      http://{host}:{port:<35} ║
║  Debug mode:  {str(debug):<43} ║
╚═══════════════════════════════════════════════════════════╝
    """)

    app.run(
        host=host,
        port=port,
        debug=debug
    )
