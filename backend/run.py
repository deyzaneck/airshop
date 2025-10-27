"""
Точка входа Flask приложения
"""
import os
from app import create_app, db
from app.models import Product

# Определение окружения (development, production, testing)
config_name = os.getenv('FLASK_ENV', 'development')

# Создание приложения
app = create_app(config_name)

# Автоматическая инициализация примеров товаров для production
if config_name == 'production':
    with app.app_context():
        # Проверяем, есть ли товары
        if Product.query.count() == 0:
            print("🔄 Initializing sample products...")

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
            print(f"✓ Database already has {Product.query.count()} products")

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
