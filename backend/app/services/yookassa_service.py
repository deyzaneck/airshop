"""
Сервис для работы с ЮКасса API
"""
import requests
import uuid
from datetime import datetime


class YooKassaService:
    """Класс для работы с API ЮКассы"""

    API_URL = 'https://api.yookassa.ru/v3'

    def __init__(self, shop_id, secret_key):
        """
        Инициализация сервиса

        Args:
            shop_id: ID магазина в ЮКассе
            secret_key: Секретный ключ
        """
        self.shop_id = shop_id
        self.secret_key = secret_key
        self.auth = (shop_id, secret_key)

    def create_payment(self, payment_data):
        """
        Создать платеж в ЮКассе

        Args:
            payment_data: dict with keys:
                - amount: float
                - order_number: string
                - customer_email: string
                - customer_phone: string (optional)
                - return_url: string
                - payment_method: string (optional) - 'bank_card' or 'sbp'
                - items: array of items for receipt (54-FZ)

        Returns:
            dict: {
                'success': bool,
                'payment_id': string,
                'confirmation_url': string,
                'error': string (if failed)
            }
        """
        try:
            # Генерация уникального ключа идемпотентности
            idempotence_key = str(uuid.uuid4())

            # Формирование данных платежа
            payment = {
                'amount': {
                    'value': f"{payment_data['amount']:.2f}",
                    'currency': 'RUB'
                },
                'confirmation': {
                    'type': 'redirect',
                    'return_url': payment_data['return_url']
                },
                'capture': True,
                'description': f"Заказ {payment_data['order_number']}",
                'metadata': {
                    'order_number': payment_data['order_number']
                }
            }

            # Добавление метода оплаты, если указан
            if payment_data.get('payment_method'):
                payment['payment_method_data'] = {
                    'type': payment_data['payment_method']
                }

            # Добавление чека (54-ФЗ)
            if payment_data.get('items'):
                receipt = {
                    'customer': {
                        'email': payment_data['customer_email']
                    },
                    'items': []
                }

                # Добавление телефона, если есть
                if payment_data.get('customer_phone'):
                    receipt['customer']['phone'] = payment_data['customer_phone']

                # Формирование товаров для чека
                for item in payment_data['items']:
                    receipt['items'].append({
                        'description': item['description'][:128],  # Максимум 128 символов
                        'quantity': str(item['quantity']),
                        'amount': {
                            'value': f"{item['amount']:.2f}",
                            'currency': 'RUB'
                        },
                        'vat_code': item.get('vat_code', 1),  # 1 = НДС 20%
                        'payment_mode': 'full_payment',
                        'payment_subject': 'commodity'
                    })

                payment['receipt'] = receipt

            # Отправка запроса
            headers = {
                'Idempotence-Key': idempotence_key,
                'Content-Type': 'application/json'
            }

            response = requests.post(
                f'{self.API_URL}/payments',
                json=payment,
                headers=headers,
                auth=self.auth,
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'payment_id': result['id'],
                    'confirmation_url': result['confirmation']['confirmation_url'],
                    'status': result['status']
                }
            else:
                error_data = response.json()
                return {
                    'success': False,
                    'error': error_data.get('description', 'Unknown error')
                }

        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Network error: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def check_payment_status(self, payment_id):
        """
        Проверить статус платежа

        Args:
            payment_id: ID платежа в ЮКассе

        Returns:
            dict: {
                'success': bool,
                'status': string,
                'paid': bool,
                'error': string (if failed)
            }
        """
        try:
            response = requests.get(
                f'{self.API_URL}/payments/{payment_id}',
                auth=self.auth,
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'status': result['status'],
                    'paid': result['paid'],
                    'amount': float(result['amount']['value']),
                    'created_at': result['created_at']
                }
            else:
                error_data = response.json()
                return {
                    'success': False,
                    'error': error_data.get('description', 'Unknown error')
                }

        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Network error: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def create_refund(self, payment_id, amount=None):
        """
        Создать возврат платежа

        Args:
            payment_id: ID платежа в ЮКассе
            amount: Сумма возврата (если None, возвращается полная сумма)

        Returns:
            dict: {
                'success': bool,
                'refund_id': string,
                'status': string,
                'error': string (if failed)
            }
        """
        try:
            # Генерация уникального ключа идемпотентности
            idempotence_key = str(uuid.uuid4())

            # Формирование данных возврата
            refund_data = {
                'payment_id': payment_id
            }

            # Если указана сумма, добавляем её
            if amount is not None:
                refund_data['amount'] = {
                    'value': f"{amount:.2f}",
                    'currency': 'RUB'
                }

            # Отправка запроса
            headers = {
                'Idempotence-Key': idempotence_key,
                'Content-Type': 'application/json'
            }

            response = requests.post(
                f'{self.API_URL}/refunds',
                json=refund_data,
                headers=headers,
                auth=self.auth,
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'refund_id': result['id'],
                    'status': result['status'],
                    'amount': float(result['amount']['value'])
                }
            else:
                error_data = response.json()
                return {
                    'success': False,
                    'error': error_data.get('description', 'Unknown error')
                }

        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Network error: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_refund_status(self, refund_id):
        """
        Проверить статус возврата

        Args:
            refund_id: ID возврата в ЮКассе

        Returns:
            dict: {
                'success': bool,
                'status': string,
                'amount': float,
                'error': string (if failed)
            }
        """
        try:
            response = requests.get(
                f'{self.API_URL}/refunds/{refund_id}',
                auth=self.auth,
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'status': result['status'],
                    'amount': float(result['amount']['value']),
                    'created_at': result['created_at']
                }
            else:
                error_data = response.json()
                return {
                    'success': False,
                    'error': error_data.get('description', 'Unknown error')
                }

        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Network error: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
