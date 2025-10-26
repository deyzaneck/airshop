"""
Роуты для работы с заказами
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app import db, limiter
from app.models import Order, OrderItem, Product

bp = Blueprint('orders', __name__)


@bp.route('', methods=['POST'])
@limiter.limit("10 per hour")
def create_order():
    """
    Создать новый заказ

    Request JSON:
        orderNumber: string
        customer: object {name, email, phone, telegram}
        delivery: object {address, city, zipcode}
        comment: string (optional)
        items: array of {productId, quantity}
        paymentMethod: string
        paymentId: string (optional)

    Response JSON:
        order: object
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Валидация обязательных полей
        required_fields = ['orderNumber', 'customer', 'delivery', 'items', 'paymentMethod']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        customer = data['customer']
        delivery = data['delivery']
        items_data = data['items']

        # Валидация данных клиента
        if not all(k in customer for k in ['name', 'email', 'phone']):
            return jsonify({'error': 'Missing customer information'}), 400

        # Валидация адреса доставки
        if not all(k in delivery for k in ['address', 'city', 'zipcode']):
            return jsonify({'error': 'Missing delivery information'}), 400

        # Проверка наличия товаров
        if not items_data or len(items_data) == 0:
            return jsonify({'error': 'Order must contain at least one item'}), 400

        # Расчет суммы заказа
        subtotal = 0
        order_items = []

        for item_data in items_data:
            product = Product.query.get(item_data['productId'])
            if not product:
                return jsonify({'error': f'Product {item_data["productId"]} not found'}), 404

            quantity = item_data['quantity']
            subtotal += product.price * quantity

            order_items.append({
                'product': product,
                'quantity': quantity
            })

        # Расчет доставки
        shipping_cost = 0 if subtotal >= 5000 else 300
        total_amount = subtotal + shipping_cost

        # Определение статуса заказа
        payment_method = data['paymentMethod']
        if payment_method == 'cash':
            status = 'pending'
        else:
            status = 'awaiting_payment'

        # Создание заказа
        order = Order(
            order_number=data['orderNumber'],
            customer_name=customer['name'],
            customer_email=customer['email'],
            customer_phone=customer['phone'],
            customer_telegram=customer.get('telegram'),
            delivery_address=delivery['address'],
            delivery_city=delivery['city'],
            delivery_zipcode=delivery['zipcode'],
            comment=data.get('comment'),
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            total_amount=total_amount,
            payment_method=payment_method,
            payment_id=data.get('paymentId'),
            status=status
        )

        db.session.add(order)
        db.session.flush()  # Получить ID заказа

        # Добавление товаров в заказ
        for item_info in order_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_info['product'].id,
                product_name=item_info['product'].name,
                product_price=item_info['product'].price,
                quantity=item_info['quantity']
            )
            db.session.add(order_item)

        db.session.commit()

        return jsonify({'order': order.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('', methods=['GET'])
@jwt_required()
@limiter.limit("100 per minute")
def get_orders():
    """
    Получить список всех заказов (только для авторизованных админов)

    Query params:
        status: string (optional) - фильтр по статусу
        limit: int (optional) - количество заказов
        offset: int (optional) - смещение

    Response JSON:
        orders: array
        total: int
    """
    try:
        query = Order.query

        # Фильтр по статусу
        status = request.args.get('status')
        if status:
            query = query.filter_by(status=status)

        # Подсчет общего количества
        total = query.count()

        # Пагинация
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)

        if limit:
            query = query.limit(limit).offset(offset)

        # Сортировка по дате создания (новые первые)
        query = query.order_by(Order.created_at.desc())

        orders = query.all()

        return jsonify({
            'orders': [order.to_dict() for order in orders],
            'total': total
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
@limiter.limit("100 per minute")
def get_order(order_id):
    """
    Получить заказ по ID (только для авторизованных админов)

    Response JSON:
        order: object
    """
    try:
        order = Order.query.get(order_id)

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        return jsonify({'order': order.to_dict()}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:order_id>/status', methods=['PUT'])
@jwt_required()
@limiter.limit("50 per hour")
def update_order_status(order_id):
    """
    Обновить статус заказа (только для авторизованных админов)

    Request JSON:
        status: string

    Response JSON:
        order: object
    """
    try:
        order = Order.query.get(order_id)

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        data = request.get_json()

        if not data or 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400

        # Валидация статуса
        valid_statuses = ['pending', 'awaiting_payment', 'paid', 'processing', 'shipping', 'delivered', 'canceled']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400

        order.status = data['status']
        order.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({'order': order.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:order_id>', methods=['DELETE'])
@jwt_required()
@limiter.limit("20 per hour")
def delete_order(order_id):
    """
    Удалить заказ (только для авторизованных админов)

    Response JSON:
        message: string
    """
    try:
        order = Order.query.get(order_id)

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        db.session.delete(order)
        db.session.commit()

        return jsonify({'message': 'Order deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/by-number/<order_number>', methods=['GET'])
@limiter.limit("20 per hour")
def get_order_by_number(order_number):
    """
    Получить заказ по номеру заказа (публичный эндпоинт для проверки статуса)

    Response JSON:
        order: object
    """
    try:
        order = Order.query.filter_by(order_number=order_number).first()

        if not order:
            return jsonify({'error': 'Order not found'}), 404

        # Возвращаем только публичную информацию
        return jsonify({
            'order': {
                'orderNumber': order.order_number,
                'status': order.status,
                'totalAmount': order.total_amount,
                'createdAt': order.created_at.isoformat() if order.created_at else None,
                'items': [item.to_dict() for item in order.items]
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/stats', methods=['GET'])
@jwt_required()
@limiter.limit("50 per hour")
def get_order_stats():
    """
    Получить статистику по заказам (только для авторизованных админов)

    Response JSON:
        total: int
        pending: int
        awaiting_payment: int
        paid: int
        processing: int
        shipping: int
        delivered: int
        canceled: int
        total_revenue: float
    """
    try:
        total = Order.query.count()
        pending = Order.query.filter_by(status='pending').count()
        awaiting_payment = Order.query.filter_by(status='awaiting_payment').count()
        paid = Order.query.filter_by(status='paid').count()
        processing = Order.query.filter_by(status='processing').count()
        shipping = Order.query.filter_by(status='shipping').count()
        delivered = Order.query.filter_by(status='delivered').count()
        canceled = Order.query.filter_by(status='canceled').count()

        # Расчет общей выручки (только оплаченные и доставленные заказы)
        completed_orders = Order.query.filter(
            Order.status.in_(['paid', 'processing', 'shipping', 'delivered'])
        ).all()
        total_revenue = sum(order.total_amount for order in completed_orders)

        return jsonify({
            'total': total,
            'pending': pending,
            'awaiting_payment': awaiting_payment,
            'paid': paid,
            'processing': processing,
            'shipping': shipping,
            'delivered': delivered,
            'canceled': canceled,
            'total_revenue': total_revenue
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
