"""
Скрипт для импорта товаров из CSV файла
"""
import csv
import re
from app import create_app, db
from app.models import Product

def parse_price(price_str):
    """Извлекает числовое значение цены из строки"""
    # Убираем все кроме цифр
    price_clean = re.sub(r'[^\d]', '', price_str)
    return float(price_clean) if price_clean else 0.0

def parse_category(category_str):
    """Определяет категорию товара"""
    # Пока все товары "Без категории", определим по названию
    name_lower = category_str.lower()

    # Можно расширить логику определения категории
    if any(word in name_lower for word in ['men', 'homme', 'мужск']):
        return 'men'
    elif any(word in name_lower for word in ['women', 'femme', 'женск', 'miss', 'lady']):
        return 'women'
    else:
        return 'unisex'

def import_from_csv(csv_file_path):
    """Импортирует товары из CSV файла в базу данных"""
    app = create_app()

    with app.app_context():
        # Очистка существующих товаров (опционально)
        # Product.query.delete()

        imported_count = 0
        skipped_count = 0

        with open(csv_file_path, 'r', encoding='utf-8-sig') as file:
            csv_reader = csv.DictReader(file, delimiter=';')

            for row in csv_reader:
                try:
                    # Парсинг данных
                    system_id = row.get('ID в системе', '').strip()
                    name = row.get('Название', '').strip()
                    description = row.get('Описание', '').strip()
                    price_str = row.get('Цена', '0').strip()
                    discount_str = row.get('Скидка (в процентах)', '0').strip()
                    image_url = row.get('Изображения (через ;)', '').strip()

                    # Проверка обязательных полей
                    if not name:
                        print(f"Пропускаем строку без названия: {row}")
                        skipped_count += 1
                        continue

                    # Парсинг цены и скидки
                    price = parse_price(price_str)
                    discount = int(discount_str) if discount_str.isdigit() else 0

                    # Вычисление старой цены если есть скидка
                    old_price = None
                    if discount > 0:
                        old_price = price / (1 - discount / 100)

                    # Извлечение бренда из названия (первое слово обычно бренд)
                    brand = name.split()[0] if name else 'Unknown'

                    # Извлечение объема из названия (поиск паттерна типа "100мл", "50 мл")
                    volume_match = re.search(r'(\d+)\s*мл', name)
                    volume = volume_match.group(1) + 'мл' if volume_match else '100мл'

                    # Определение категории
                    category = parse_category(name)

                    # Проверка, существует ли уже товар с таким названием
                    existing_product = Product.query.filter_by(name=name).first()
                    if existing_product:
                        print(f"Товар уже существует, пропускаем: {name}")
                        skipped_count += 1
                        continue

                    # Создание товара
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
                        is_featured=False,  # Можно настроить логику выбора избранных
                        is_new=False,
                        is_visible=True
                    )

                    db.session.add(product)
                    imported_count += 1
                    print(f"Импортирован: {name} - {price}₽")

                except Exception as e:
                    print(f"Ошибка при импорте строки: {row}")
                    print(f"Ошибка: {str(e)}")
                    skipped_count += 1
                    continue

        # Сохранение изменений
        try:
            db.session.commit()
            print(f"\n✓ Успешно импортировано товаров: {imported_count}")
            print(f"✓ Пропущено товаров: {skipped_count}")
        except Exception as e:
            db.session.rollback()
            print(f"\n✗ Ошибка при сохранении в БД: {str(e)}")

if __name__ == '__main__':
    import sys

    # Путь к CSV файлу
    csv_path = '../table.csv'

    if len(sys.argv) > 1:
        csv_path = sys.argv[1]

    print(f"Импорт товаров из файла: {csv_path}")
    import_from_csv(csv_path)
