# Elixir Grove - Full Stack Setup Guide

## Project Structure

```
elixir-grove/
├── backend/                 # Laravel API (port 8000)
│   ├── app/
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Brand.php
│   │   │   ├── CommunityPost.php
│   │   │   └── UserActivity.php
│   │   └── Http/
│   │       ├── Controllers/
│   │       │   ├── AuthController.php
│   │       │   ├── BrandController.php
│   │       │   ├── CommunityController.php
│   │       │   └── ProfileController.php
│   │       └── Middleware/
│   ├── database/
│   │   └── migrations/
│   │       ├── create_users_table.php
│   │       ├── create_brands_table.php
│   │       ├── create_community_posts_table.php
│   │       └── create_user_activities_table.php
│   ├── routes/
│   │   └── api.php
│   └── composer.json
│
└── frontend/                # React App (port 3000)
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── index.css
    └── package.json
```

## Setup Instructions

### Backend Setup (Laravel)

1. **Install Laravel**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

2. **Configure Database** (MySQL)
   - Create database: `CREATE DATABASE elixir_grove;`
   - Update .env with database credentials

3. **Run Migrations**
```bash
php artisan migrate
php artisan db:seed
```

4. **Start Backend Server**
```bash
php artisan serve
```
Backend will be available at `http://localhost:8000`

### Frontend Setup (React)

1. **Create React App**
```bash
cd frontend
npm install
```

2. **Start Development Server**
```bash
npm start
```
Frontend will be available at `http://localhost:3000`

## Database Schema

### Users Table
- id (Primary Key)
- name
- email (Unique)
- password (hashed)
- profile_picture (nullable)
- bio (nullable)
- created_at
- updated_at

### Brands Table
- id (Primary Key)
- name
- description
- logo_url (nullable)
- category (men, women, unisex)
- created_at
- updated_at

### Community Posts Table
- id (Primary Key)
- user_id (Foreign Key → Users)
- title
- content
- category (newsletter, social_media, discussion)
- likes_count
- created_at
- updated_at

### User Activities Table
- id (Primary Key)
- user_id (Foreign Key → Users)
- activity_type (login, brand_view, post_created, post_liked)
- details (JSON)
- created_at

### User Profiles Table (Extended User Data)
- id (Primary Key)
- user_id (Foreign Key → Users, Unique)
- favorite_brands (JSON Array)
- community_posts_count
- followers_count
- following_count
- updated_at

## API Endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`

### Brands
- GET `/api/brands`
- GET `/api/brands/{id}`
- POST `/api/brands` (Admin only)
- PUT `/api/brands/{id}` (Admin only)
- DELETE `/api/brands/{id}` (Admin only)

### Community
- GET `/api/community/posts`
- GET `/api/community/posts/{id}`
- POST `/api/community/posts`
- PUT `/api/community/posts/{id}`
- DELETE `/api/community/posts/{id}`
- POST `/api/community/posts/{id}/like`

### Profile
- GET `/api/profile/{userId}`
- PUT `/api/profile/{userId}`
- GET `/api/profile/{userId}/activity`
- POST `/api/profile/{userId}/follow`

### User Activity
- GET `/api/activity`
- GET `/api/activity/{userId}`
- POST `/api/activity/log`

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_API_BASE=http://localhost:8000
```

### Backend (.env)
```
APP_URL=http://localhost:8000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

## Next Steps

1. Create Laravel Models with relationships
2. Create Database Migrations
3. Create API Controllers
4. Create React Components
5. Connect Frontend to Backend API
