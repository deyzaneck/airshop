"""
Модели заказа (Order) и элемента заказа (OrderItem)
"""
from datetime import datetime
from app import db


class Order(db.Model):
    """Модель заказа"""
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(100), unique=True, nullable=False)

    # Информация о клиенте
    customer_name = db.Column(db.String(200), nullable=False)
    customer_email = db.Column(db.String(200), nullable=False)
    customer_phone = db.Column(db.String(50), nullable=False)
    customer_telegram = db.Column(db.String(100), nullable=True)

    # Адрес доставки
    delivery_address = db.Column(db.String(500), nullable=False)
    delivery_city = db.Column(db.String(100), nullable=False)
    delivery_zipcode = db.Column(db.String(20), nullable=False)

    # Комментарий
    comment = db.Column(db.Text, nullable=True)

    # Сумма и оплата
    subtotal = db.Column(db.Float, nullable=False)
    shipping_cost = db.Column(db.Float, default=0)
    total_amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # 'card', 'sbp', 'cash'
    payment_id = db.Column(db.String(200), nullable=True)  # ID платежа в ЮКассе

    # Статусы
    # 'pending' - ожидает обработки
    # 'awaiting_payment' - ожидает оплаты
    # 'paid' - оплачен
    # 'processing' - в обработке
    # 'shipping' - отправлен
    # 'delivered' - доставлен
    # 'canceled' - отменен
    status = db.Column(db.String(50), default='pending', nullable=False)

    # Метаданные
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связи
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_items=True):
        """Конвертация в словарь для API"""
        result = {
            'id': self.id,
            'orderNumber': self.order_number,
            'customer': {
                'name': self.customer_name,
                'email': self.customer_email,
                'phone': self.customer_phone,
                'telegram': self.customer_telegram
            },
            'delivery': {
                'address': self.delivery_address,
                'city': self.delivery_city,
                'zipcode': self.delivery_zipcode
            },
            'comment': self.comment,
            'subtotal': self.subtotal,
            'shippingCost': self.shipping_cost,
            'totalAmount': self.total_amount,
            'paymentMethod': self.payment_method,
            'paymentId': self.payment_id,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

        if include_items:
            result['items'] = [item.to_dict() for item in self.items]

        return result

    def __repr__(self):
        return f'<Order {self.order_number}>'


class OrderItem(db.Model):
    """Модель элемента заказа (товар в заказе)"""
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)

    # Информация о товаре на момент заказа
    product_name = db.Column(db.String(200), nullable=False)
    product_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        """Конвертация в словарь для API"""
        return {
            'id': self.id,
            'productId': self.product_id,
            'productName': self.product_name,
            'productPrice': self.product_price,
            'quantity': self.quantity,
            'total': self.product_price * self.quantity
        }

    def __repr__(self):
        return f'<OrderItem {self.product_name} x{self.quantity}>'
