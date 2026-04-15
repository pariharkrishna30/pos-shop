# POS Web App

This workspace contains a Laravel backend (`backend/`) and a React frontend (`frontend/`).

## Backend

- Laravel 12 API routes are defined in `backend/routes/web.php`
- User authentication uses bearer API tokens stored in `users.api_token`
- Core models: `Category`, `Product`, `Sale`, `SaleItem`
- Seeded admin user: `admin@pos.local` / `password`

## Frontend

- React + Vite app in `frontend/`
- Bootstrap UI and simple POS workflow
- Authentication, dashboard, product/category/user management, reports

## Setup

### Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Configure your database in `backend/.env`
3. Run migrations and seeders:

```bash
cd backend
composer install
php artisan migrate --seed
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Notes

- API endpoints are under `/api/*`
- The React app uses `http://127.0.0.1:8000` by default; update `VITE_API_URL` if needed
