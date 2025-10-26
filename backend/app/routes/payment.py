"""
Роуты для работы с платежами (ЮКасса)
"""
from flask import Blueprint, request, jsonify, current_app
from app import db, limiter
from app.models import Order
from app.services.yookassa_service import YooKassaService
import hmac
import hashlib

bp = Blueprint('payment', __name__)


@bp.route('/create', methods=['POST'])
@limiter.limit("10 per hour")
def create_payment():
    """
    Создать платеж в ЮКассе

    Request JSON:
        orderNumber: string
        amount: float
        returnUrl: string (optional)
        paymentMethod: string (optional) - 'bank_card' or 'sbp'

    Response JSON:
        success: boolean
        payment_id: string
        confirmation_url: string
        error: string (if failed)
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        order_number = data.get('orderNumber')
        amount = data.get('amount')

        if not order_number or not amount:
            return jsonify({'error': 'Order number and amount are required'}), 400

        # Проверка существования заказа
        order = Order.query.filter_by(order_number=order_number).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404

        # Создание платежа через ЮКассу
        yookassa = YooKassaService(
            shop_id=current_app.config['YOOKASSA_SHOP_ID'],
            secret_key=current_app.config['YOOKASSA_SECRET_KEY']
        )

        payment_data = {
            'amount': amount,
            'order_number': order_number,
            'customer_email': order.customer_email,
            'customer_phone': order.customer_phone,
            'return_url': data.get('returnUrl', current_app.config['PAYMENT_RETURN_URL']),
            'payment_method': data.get('paymentMethod')
        }

        # Добавление товаров для чека (54-ФЗ)
        items = []
        for item in order.items:
            items.append({
                'description': item.product_name,
                'quantity': item.quantity,
                'amount': item.product_price,
                'vat_code': 1  # НДС 20%
            })

        payment_data['items'] = items

        result = yookassa.create_payment(payment_data)

        if result['success']:
            # Сохранение payment_id в заказе
            order.payment_id = result['payment_id']
            order.status = 'awaiting_payment'
            db.session.commit()

            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/status/<payment_id>', methods=['GET'])
@limiter.limit("50 per hour")
def get_payment_status(payment_id):
    """
    Проверить статус платежа в ЮКассе

    Response JSON:
        success: boolean
        status: string
        paid: boolean
        error: string (if failed)
    """
    try:
        yookassa = YooKassaService(
            shop_id=current_app.config['YOOKASSA_SHOP_ID'],
            secret_key=current_app.config['YOOKASSA_SECRET_KEY']
        )

        result = yookassa.check_payment_status(payment_id)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bp.route('/webhook', methods=['POST'])
def payment_webhook():
    """
    Webhook для получения уведомлений от ЮКассы о статусе платежа

    ЮКасса отправляет POST запрос на этот URL при изменении статуса платежа
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Проверка подлинности уведомления
        # ЮКасса отправляет notification_type и object
        notification_type = data.get('event')
        payment_object = data.get('object')

        if not notification_type or not payment_object:
            return jsonify({'error': 'Invalid webhook data'}), 400

        payment_id = payment_object.get('id')
        payment_status = payment_object.get('status')
        paid = payment_object.get('paid', False)

        # Находим заказ по payment_id
        order = Order.query.filter_by(payment_id=payment_id).first()

        if not order:
            # Это нормально - может быть уведомление о тестовом платеже
            current_app.logger.warning(f'Order not found for payment_id: {payment_id}')
            return jsonify({'success': True}), 200

        # Обновление статуса заказа
        if notification_type == 'payment.succeeded' and paid:
            order.status = 'paid'
            current_app.logger.info(f'Order {order.order_number} marked as paid')
        elif notification_type == 'payment.canceled':
            order.status = 'canceled'
            current_app.logger.info(f'Order {order.order_number} payment canceled')

        db.session.commit()

        return jsonify({'success': True}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Webhook error: {str(e)}')
        return jsonify({'error': str(e)}), 500


@bp.route('/refund', methods=['POST'])
@limiter.limit("5 per hour")
def create_refund():
    """
    Создать возврат платежа

    Request JSON:
        payment_id: string
        amount: float (optional) - если не указано, возвращается полная сумма

    Response JSON:
        success: boolean
        refund_id: string
        status: string
        error: string (if failed)
    """
    try:
        data = request.get_json()

        if not data or 'payment_id' not in data:
            return jsonify({'error': 'Payment ID is required'}), 400

        payment_id = data['payment_id']
        amount = data.get('amount')

        yookassa = YooKassaService(
            shop_id=current_app.config['YOOKASSA_SHOP_ID'],
            secret_key=current_app.config['YOOKASSA_SECRET_KEY']
        )

        result = yookassa.create_refund(payment_id, amount)

        if result['success']:
            # Обновление статуса заказа
            order = Order.query.filter_by(payment_id=payment_id).first()
            if order:
                order.status = 'canceled'
                db.session.commit()

            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
