"""
Точка входа Flask приложения
"""
import os
from app import create_app

# Определение окружения (development, production, testing)
config_name = os.getenv('FLASK_ENV', 'development')

# Создание приложения
app = create_app(config_name)

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
