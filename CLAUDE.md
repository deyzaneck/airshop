# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AirShop is a full-stack premium perfume e-commerce application with a React frontend and Flask REST API backend. The application features a dark luxury design theme, complete shopping experience with cart and checkout, admin panel for order/product management, and YooKassa payment integration. **All user-facing text is in Russian.**

## Technology Stack

**Frontend:**
- React 18 with functional components and hooks
- React Router 6 for client-side routing
- Tailwind CSS with custom dark theme configuration
- Lucide React for icons
- Axios for API requests
- Create React App (react-scripts 5.0.1)

**Backend:**
- Flask 3.0 REST API
- SQLAlchemy ORM with SQLite (dev) / PostgreSQL (production)
- Flask-JWT-Extended for authentication (JWT tokens)
- Flask-Bcrypt for password hashing
- Flask-CORS for frontend communication
- Flask-Limiter for rate limiting
- YooKassa payment gateway integration

## Development Commands

### Frontend (React)

```bash
# Development server (http://localhost:3000)
npm install
npm start

# Production build
npm run build

# Run tests
npm test
```

### Backend (Flask)

```bash
# Setup virtual environment (first time only)
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1  # PowerShell
# or
venv\Scripts\activate.bat     # CMD

# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server (http://127.0.0.1:5000)
python run.py

# Initialize database with sample data
python init_db.py --sample

# Import products from CSV
python import_csv.py
```

**Important:** Backend must run from `backend/` directory. Always activate venv before running Python commands.

## Architecture Overview

### Full-Stack Data Flow

The application uses a **client-server architecture** where the React frontend communicates with the Flask backend via REST API:

1. **Frontend → Backend:** React components use `src/api/services.js` which wraps Axios client (`src/api/client.js`)
2. **Authentication:** JWT tokens stored in localStorage, automatically attached to requests via Axios interceptor
3. **Data Persistence:** All data (products, orders, users, settings) stored in backend database
4. **Cart:** Managed client-side in localStorage for UX, orders synced to backend on checkout

### Backend Structure (`backend/`)

```
app/
├── __init__.py          # Flask app factory, JWT/CORS/limiter setup, error handlers
├── models/              # SQLAlchemy models
│   ├── product.py       # Product(id, name, brand, price, category, image, is_featured, etc.)
│   ├── order.py         # Order + OrderItem (with relationships)
│   └── user.py          # User (admin authentication, bcrypt hashing)
├── routes/              # API endpoints (blueprints)
│   ├── auth.py          # /api/auth/* - login, verify, register, change-password
│   ├── products.py      # /api/products/* - CRUD operations
│   ├── orders.py        # /api/orders/* - create, list, update status
│   ├── payment.py       # /api/payment/* - YooKassa integration
│   └── settings.py      # /api/settings/* - site settings (hero text, contacts)
└── services/
    └── yookassa_service.py  # YooKassa API client
config.py                # Configuration classes (dev/prod/test)
run.py                   # Entry point
```

**Key Backend Patterns:**
- All routes use blueprints registered in `app/__init__.py`
- Protected routes use `@jwt_required()` decorator
- Rate limiting applied per-endpoint (e.g., login: 5/min, orders: 10/hour)
- JWT identity must be **string** (convert with `str(user.id)` on create, `int()` on verify)
- Database sessions auto-rollback on error in error handlers

### Frontend Structure (`src/`)

```
components/
├── layout/
│   ├── Header.jsx       # Navigation, search bar, cart badge (listens to 'cartUpdated' event)
│   └── Footer.jsx       # Footer with contact info from API
└── ProtectedRoute.jsx   # JWT verification wrapper for admin routes
pages/
├── Home.jsx             # Landing page (featured products, hero section from API)
├── Catalog.jsx          # Product grid (loads from API, filters by category/search)
├── ProductDetail.jsx    # Single product view (loads from API by ID)
├── Cart.jsx             # Shopping cart (localStorage + quantity management)
├── Checkout.jsx         # Order form (saves to backend via ordersAPI.create)
├── Admin.jsx            # Admin panel (products/orders/settings management)
└── AdminLogin.jsx       # JWT authentication form
api/
├── client.js            # Axios instance with JWT interceptor
└── services.js          # API service wrappers (authAPI, productsAPI, ordersAPI, settingsAPI)
utils/
├── helpers.js           # Cart operations (localStorage), price formatting
└── payment.js           # Order number generation, YooKassa payment creation
```

**Key Frontend Patterns:**
- All API calls go through `api/services.js` (never use localStorage helpers like `adminHelpers.js` for server data)
- Cart updates dispatch `cartUpdated` event to sync Header badge
- Settings structure is nested: `settings.hero.title`, `settings.contact.phone` (not flat)
- JWT token stored as `jwt_token` in localStorage, checked by ProtectedRoute
- Admin routes wrapped in `<ProtectedRoute>` component

### Data Models

**Product:**
```javascript
{
  id, name, brand, price, oldPrice, discount,
  volume, category, description, image,
  isFeatured, isNew, isVisible
}
```

**Order:**
```javascript
{
  id, orderNumber,
  customer: { name, email, phone, telegram },
  delivery: { address, city, zipcode },
  items: [{ productId, quantity, price }],
  totalAmount, paymentMethod, paymentId,
  status, comment, createdAt
}
```

**Settings (nested structure):**
```javascript
{
  hero: { title, subtitle },
  contact: { phone, email, telegram },
  shipping: { freeShippingThreshold, standardShippingCost },
  business: { companyName, address, workingHours, description }
}
```

## Critical Implementation Details

### JWT Authentication Flow

1. **Login:** `authAPI.login(username, password)` → receives `access_token` → stores in `localStorage.jwt_token`
2. **Verification:** Axios interceptor adds `Authorization: Bearer <token>` to all requests
3. **Protected Routes:** `ProtectedRoute` component calls `authAPI.verify()` → redirects to login if fails
4. **Token Creation:** Backend must use `create_access_token(identity=str(user.id))` (string, not int!)
5. **Token Parsing:** Backend must convert back `int(get_jwt_identity())` when querying database

**Common JWT Errors:**
- `422 "Subject must be a string"` → forgot `str()` when creating token
- `401 Unauthorized` → token expired or invalid
- Clear localStorage (`jwt_token`, `admin_user`) if auth issues persist

### Cart vs Orders

- **Cart:** Managed client-side in `localStorage` via `utils/helpers.js` (fast UX, no server load)
- **Orders:** Created on checkout via `ordersAPI.create()` in `Checkout.jsx` (persistent, visible in admin)
- **Pattern:** Cart → Checkout form → `ordersAPI.create(orderData)` → clear cart → navigate to success page

### Settings Architecture

Settings are stored in `backend/site_settings.json` (not database) via `settings.py` route. Frontend loads via `settingsAPI.get()` which returns nested structure. **Always use nested access:**

```javascript
// Correct:
settings.hero?.title || 'Default Title'
settings.contact?.email || 'default@example.com'

// Wrong (legacy):
settings.heroTitle  // This won't work
settings.email      // This won't work
```

### Product Import from CSV

Use `backend/import_csv.py` to bulk-import products from `table.csv`:
- Parses Russian text, prices (removes ₽), brand/volume from name
- Auto-categorizes (men/women/unisex) based on keywords
- Skips duplicates by name
- Run: `python import_csv.py` (from backend directory with venv activated)

## Common Development Tasks

### Adding New API Endpoint

1. Create route function in appropriate `backend/app/routes/*.py` file
2. Add to blueprint (usually already imported in route file)
3. Add corresponding function to `src/api/services.js` (e.g., `productsAPI.newMethod`)
4. Use in React component via async/await

### Modifying Admin Panel

`src/pages/Admin.jsx` has three tabs: Orders, Products, Settings. All data loaded via:
```javascript
loadAllData = async () => {
  const [productsData, ordersData, settingsData] = await Promise.all([
    productsAPI.getAll({ visible: false }),
    ordersAPI.getAll(),
    settingsAPI.get()
  ]);
}
```

Save operations use respective API methods (`productsAPI.update()`, `ordersAPI.updateStatus()`, etc.).

### Changing Design Theme

**Colors defined in `tailwind.config.js` and `src/index.css`:**
- Dark backgrounds: `dark-900`, `dark-800`, `dark-700`
- Light text: `light-100`, `light-200`, `light-300`
- Accents: `peach-400`, `wine-500`, `gold-400`

**Utility classes in `src/index.css`:**
- `.card-dark` - glassmorphism cards
- `.btn-primary` - gradient buttons (peach → wine)
- `.input` - dark input fields with proper contrast

### Running Backend + Frontend Together

**Terminal 1 (Backend):**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python run.py
# Runs on http://127.0.0.1:5000
```

**Terminal 2 (Frontend):**
```powershell
npm start
# Runs on http://localhost:3000
```

Frontend `.env` must have: `REACT_APP_API_URL=http://localhost:5000/api`

## Important Configuration Files

- **`backend/.env`** - Backend secrets (JWT_SECRET_KEY, YOOKASSA keys, admin credentials)
- **`backend/config.py`** - Flask configuration classes (JWT settings, CORS, database URLs)
- **`src/api/client.js`** - Axios base URL from `REACT_APP_API_URL` env var
- **`tailwind.config.js`** - Custom color palette for dark theme
- **`src/index.css`** - CSS custom properties and utility classes

## Testing & Debugging

### Backend Logs
Flask runs in debug mode by default. JWT error handlers in `app/__init__.py` print detailed logs:
```
[JWT] Invalid token: <error message>
[AUTH VERIFY] User ID from token: 1
```

### Frontend Debug
- Check browser DevTools → Console for API errors
- Check DevTools → Application → Local Storage for JWT token
- Check DevTools → Network tab for API request/response details

### Admin Credentials (Default)
- **Username:** `admin`
- **Password:** `changeme123` (from `.env` ADMIN_PASSWORD)
- Created automatically on first run in `app/__init__.py`

### Common Issues

**"ModuleNotFoundError"** → Forgot to activate venv or install requirements
**CORS errors** → Check `FRONTEND_URL` in backend `.env` matches frontend URL
**422 on /auth/verify** → JWT token created with int instead of str (see JWT section)
**Orders not appearing** → Check Checkout.jsx uses `ordersAPI.create()` not localStorage
**Settings not loading** → Use nested structure (`settings.hero.title`) not flat

## Database Migrations

For schema changes, use Flask-Migrate:
```bash
cd backend
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1

flask db migrate -m "Description of changes"
flask db upgrade
```

Or delete `backend/airshop.db` to recreate from scratch (dev only).

## Deployment Notes

**Backend (Production):**
- Use PostgreSQL instead of SQLite (update `DATABASE_URL` in `.env`)
- Set `FLASK_ENV=production`
- Run via Gunicorn: `gunicorn -w 4 -b 0.0.0.0:5000 run:app`
- Configure nginx reverse proxy
- Set strong `SECRET_KEY` and `JWT_SECRET_KEY`

**Frontend (Production):**
- Update `.env`: `REACT_APP_API_URL=https://api.yourdomain.com/api`
- Build: `npm run build`
- Serve `build/` directory via nginx or static hosting
- Configure CORS on backend to allow production domain

**YooKassa Setup:**
- Get credentials from https://yookassa.ru
- Set `YOOKASSA_SHOP_ID` and `YOOKASSA_SECRET_KEY` in backend `.env`
- Configure webhook in YooKassa dashboard: `https://yourdomain.com/api/payment/webhook`
