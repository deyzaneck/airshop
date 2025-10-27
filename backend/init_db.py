"""
Скрипт для инициализации базы данных с тестовыми данными
"""
from app import create_app, db
from app.models import Product, User
import json
import os

def init_database():
    """Инициализация базы данных"""
    app = create_app('development')

    with app.app_context():
        # Создание всех таблиц
        print("Creating database tables...")
        db.create_all()

        # Создание администратора по умолчанию
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            print("Creating default admin user...")
            admin = User(
                username=app.config['ADMIN_USERNAME'],
                email=app.config['ADMIN_EMAIL'],
                role='superadmin'
            )
            admin.set_password(app.config['ADMIN_PASSWORD'])
            db.session.add(admin)
            db.session.commit()
            print(f"✓ Admin user created: {admin.username}")
        else:
            print(f"✓ Admin user already exists: {admin.username}")

        # Проверка наличия тестовых товаров
        products_count = Product.query.count()
        print(f"\nCurrent products in database: {products_count}")

        if products_count == 0:
            print("\nNo products found. You can:")
            print("1. Import products from frontend using /api/products/bulk endpoint")
            print("2. Create products manually via admin panel")
            print("3. Add sample products (run with --sample flag)")

        print("\n✓ Database initialized successfully!")
        print(f"  Admin: {admin.username}")
        print(f"  Products: {products_count}")


def add_sample_products():
    """Добавить примеры товаров"""
    app = create_app('development')

    with app.app_context():
        # Проверка существующих товаров
        if Product.query.count() > 0:
            print("Products already exist. Skipping sample data creation.")
            return

        print("Creating sample products...")

        sample_products = [
            {
                'name': 'Chanel No. 5',
                'brand': 'Chanel',
                'price': 8500,
                'old_price': 10000,
                'discount': 15,
                'volume': '100ml',
                'category': 'women',
                'description': 'Легендарный аромат от Chanel, символ роскоши и элегантности',
                'image': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400',
                'is_featured': True,
                'is_new': False
            },
            {
                'name': 'Dior Sauvage',
                'brand': 'Dior',
                'price': 7200,
                'old_price': None,
                'discount': 0,
                'volume': '100ml',
                'category': 'men',
                'description': 'Свежий и мужественный аромат для современных мужчин',
                'image': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400',
                'is_featured': True,
                'is_new': True
            },
            {
                'name': 'Lancôme La Vie Est Belle',
                'brand': 'Lancôme',
                'price': 6800,
                'old_price': 8000,
                'discount': 15,
                'volume': '75ml',
                'category': 'women',
                'description': 'Аромат счастья и радости жизни',
                'image': 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=400',
                'is_featured': True,
                'is_new': False
            },
            {
                'name': 'Giorgio Armani Acqua di Gio',
                'brand': 'Giorgio Armani',
                'price': 5900,
                'old_price': None,
                'discount': 0,
                'volume': '100ml',
                'category': 'men',
                'description': 'Свежий морской аромат, вдохновленный Средиземноморьем',
                'image': 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400',
                'is_featured': True,
                'is_new': False
            }
        ]

        for product_data in sample_products:
            product = Product(**product_data)
            db.session.add(product)

        db.session.commit()
        print(f"✓ Created {len(sample_products)} sample products")


if __name__ == '__main__':
    import sys

    if '--sample' in sys.argv:
        add_sample_products()
    else:
        init_database()
