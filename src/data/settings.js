export const settings = {
  siteName: 'AirShop',
  description: 'Интернет-магазин оригинальных брендовых духов с гарантией подлинности',
  contacts: {
    email: 'info@airshop.ru',
    phone: '+7 (XXX) XXX-XX-XX',
    telegram: 'https://t.me/airshop'
  },
  social: {
    telegram: 'https://t.me/airshop'
  },
  shipping: {
    methods: [
      {
        id: 'sdek',
        name: 'СДЭК',
        price: 300,
        days: '2-5 рабочих дней',
        description: 'Доставка курьером до двери',
        freeFrom: 5000
      },
      {
        id: 'pickup',
        name: 'Самовывоз',
        price: 0,
        days: 'На следующий день',
        description: 'Получение в пункте выдачи',
        freeFrom: 0
      }
    ]
  }
};

export const getSettings = () => settings;
