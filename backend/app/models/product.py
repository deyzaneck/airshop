"""
Модель товара (Product)
"""
from datetime import datetime
from app import db


class Product(db.Model):
    """Модель товара"""
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    brand = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    old_price = db.Column(db.Float, nullable=True)
    discount = db.Column(db.Integer, default=0)
    volume = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # 'men', 'women', 'unisex'
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(500), nullable=False)

    # Флаги
    is_featured = db.Column(db.Boolean, default=False)
    is_new = db.Column(db.Boolean, default=False)
    is_visible = db.Column(db.Boolean, default=True)

    # Метаданные
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связи
    order_items = db.relationship('OrderItem', backref='product', lazy='dynamic')

    def to_dict(self):
        """Конвертация в словарь для API"""
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'price': self.price,
            'oldPrice': self.old_price,
            'discount': self.discount,
            'volume': self.volume,
            'category': self.category,
            'description': self.description,
            'image': self.image,
            'isFeatured': self.is_featured,
            'isNew': self.is_new,
            'isVisible': self.is_visible,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Product {self.name}>'
