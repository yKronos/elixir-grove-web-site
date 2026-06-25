# Complete Implementation Guide: Elixir Grove React + Laravel

## Overview

This guide will walk you through converting your static HTML site to a full-stack React + Laravel application with a MySQL database.

---

## PART 1: BACKEND SETUP (Laravel)

### Step 1: Create Laravel Project

```bash
# Create a new Laravel project
composer create-project laravel/laravel backend

# Navigate to the project
cd backend

# Install additional dependencies
composer require laravel/sanctum laravel/cors
```

### Step 2: Configure Environment

1. **Copy `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Generate app key:**
   ```bash
   php artisan key:generate
   ```

3. **Update `.env` database configuration:**
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=elixir_grove
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Configure CORS (config/cors.php):**
   ```php
   'allowed_origins' => ['http://localhost:3000'],
   'allowed_methods' => ['*'],
   'allowed_headers' => ['*'],
   ```

### Step 3: Create Database

```sql
CREATE DATABASE elixir_grove CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 4: Create Models with Migrations

**User Model:**
```bash
php artisan make:model User -m
```

Copy the migration code from `LARAVEL_MIGRATIONS.md` file 1.

**Brand Model:**
```bash
php artisan make:model Brand -m
```

Copy the migration code from `LARAVEL_MIGRATIONS.md` file 2.

**CommunityPost Model:**
```bash
php artisan make:model CommunityPost -m
```

Copy the migration code from `LARAVEL_MIGRATIONS.md` file 3.

**UserActivity Model:**
```bash
php artisan make:model UserActivity -m
```

Copy the migration code from `LARAVEL_MIGRATIONS.md` file 4.

**UserProfile Model:**
```bash
php artisan make:model UserProfile -m
```

Copy the migration code from `LARAVEL_MIGRATIONS.md` file 5.

### Step 5: Add Model Relationships

Update the models in `app/Models/` with the code from `LARAVEL_MODELS.md`.

### Step 6: Create Controllers

```bash
php artisan make:controller AuthController
php artisan make:controller BrandController --resource
php artisan make:controller CommunityController --resource
php artisan make:controller ProfileController
php artisan make:controller ActivityController
```

Copy the controller code from `LARAVEL_API_CONTROLLERS.md`.

### Step 7: Set Up API Routes

Update `routes/api.php` with the routes from `LARAVEL_API_CONTROLLERS.md`.

### Step 8: Create Middleware for Role Checking

```bash
php artisan make:middleware CheckRole
```

Copy the middleware code from `LARAVEL_API_CONTROLLERS.md`.

Register middleware in `app/Http/Kernel.php`:
```php
protected $routeMiddleware = [
    // ... other middleware
    'role' => \App\Http\Middleware\CheckRole::class,
];
```

### Step 9: Run Migrations

```bash
php artisan migrate
```

### Step 10: Seed Test Data (Optional)

Create a seeder:
```bash
php artisan make:seeder BrandSeeder
```

Example seeder for brands:
```php
<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        Brand::create([
            'name' => 'Jean Paul Gaultier',
            'description' => 'Luxury French fragrance brand',
            'category' => 'men',
            'website_url' => 'https://example.com',
        ]);

        Brand::create([
            'name' => 'Victoria\'s Secret',
            'description' => 'Popular women\'s fragrance line',
            'category' => 'women',
            'website_url' => 'https://example.com',
        ]);

        Brand::create([
            'name' => 'Kilian',
            'description' => 'Luxury unisex fragrances',
            'category' => 'unisex',
            'website_url' => 'https://example.com',
        ]);
    }
}
```

Run seeder:
```bash
php artisan db:seed --class=BrandSeeder
```

### Step 11: Start Laravel Server

```bash
php artisan serve
```

Server runs at: `http://localhost:8000`

---

## PART 2: FRONTEND SETUP (React)

### Step 1: Create React App

```bash
# Create React app
npx create-react-app frontend

# Navigate to project
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install axios react-router-dom
```

### Step 3: Create Project Structure

```
frontend/src/
├── components/
│   ├── Navigation.jsx
│   ├── Home.jsx
│   ├── Brands.jsx
│   ├── BrandCard.jsx
│   ├── Community.jsx
│   ├── CommunityPost.jsx
│   ├── CreatePostForm.jsx
│   ├── Profile.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Footer.jsx
├── services/
│   └── api.js
├── App.jsx
├── App.css
└── index.css
```

### Step 4: Create `.env` File

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_API_BASE=http://localhost:8000
```

### Step 5: Create API Service

Create `src/services/api.js` with the code from `REACT_API_SERVICE.md`.

### Step 6: Create Components

Copy all component code from `REACT_COMPONENTS.md` to their respective files in `src/components/`.

### Step 7: Create Main App Component

Copy the code from `REACT_APP_MAIN.md` to `src/App.jsx`.

### Step 8: Add Styles

Copy CSS from `REACT_STYLES.md` to `src/App.css`.

### Step 9: Start React Development Server

```bash
npm start
```

Frontend runs at: `http://localhost:3000`

---

## PART 3: TESTING THE APPLICATION

### Test Auth Flow

1. Go to `http://localhost:3000/register`
2. Create a new account
3. Token will be stored in localStorage
4. You should be logged in

### Test Brands

1. Go to home page
2. Scroll to "Our Brands" section
3. View brands from database
4. Click follow to test brand following

### Test Community

1. Scroll to "Community" section
2. Create a new post (requires authentication)
3. Like/unlike posts
4. View user profiles

### Test User Activity

1. Visit a user profile
2. View their activity log
3. Activities are tracked: login, post_created, post_liked, etc.

---

## PART 4: DATABASE RELATIONSHIPS

### ER Diagram

```
Users
├── id (PK)
├── name
├── email (UNIQUE)
├── password (hashed)
├── profile_picture
├── bio
├── role (user, admin)
└── timestamps

    ↓
    
UserProfile (one-to-one)
├── id (PK)
├── user_id (FK)
├── favorite_brands (JSON)
├── community_posts_count
├── followers_count
├── following_count
└── timestamps

    ↓
    
CommunityPost (one-to-many)
├── id (PK)
├── user_id (FK)
├── title
├── content
├── category
├── likes_count
└── timestamps

    ↓
    
UserActivity (one-to-many)
├── id (PK)
├── user_id (FK)
├── activity_type
├── details (JSON)
└── timestamps

    ↓

Brands (independent)
├── id (PK)
├── name (UNIQUE)
├── description
├── logo_url
├── category (men, women, unisex)
└── timestamps
```

---

## PART 5: API ENDPOINTS SUMMARY

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/me` - Get current user (requires auth)

### Brands
- `GET /api/brands` - List all brands
- `GET /api/brands/{id}` - Get brand details
- `POST /api/brands` - Create brand (admin only)
- `PUT /api/brands/{id}` - Update brand (admin only)
- `DELETE /api/brands/{id}` - Delete brand (admin only)
- `POST /api/brands/{id}/follow` - Follow brand

### Community
- `GET /api/community/posts` - List community posts
- `GET /api/community/posts/{id}` - Get post details
- `POST /api/community/posts` - Create post (auth required)
- `PUT /api/community/posts/{id}` - Update post
- `DELETE /api/community/posts/{id}` - Delete post
- `POST /api/community/posts/{id}/like` - Like post
- `POST /api/community/posts/{id}/unlike` - Unlike post

### Profiles
- `GET /api/profile/{userId}` - Get user profile
- `PUT /api/profile/{userId}` - Update profile (auth required)
- `GET /api/profile/{userId}/activity` - Get user activity
- `POST /api/profile/{userId}/follow` - Follow user
- `POST /api/profile/{userId}/unfollow` - Unfollow user

### Activity
- `GET /api/activity` - Get current user activity
- `GET /api/activity/{userId}` - Get user activity
- `POST /api/activity/log` - Log activity

---

## PART 6: FUTURE ENHANCEMENTS

1. **Comments System**
   - Add comments table
   - Nested comments support

2. **Direct Messaging**
   - User messaging system
   - Real-time notifications with WebSocket

3. **Admin Dashboard**
   - Manage users and brands
   - View analytics and reports

4. **Search & Filtering**
   - Full-text search for brands and posts
   - Advanced filtering options

5. **Image Upload**
   - Profile picture upload
   - Brand logo upload
   - Post image attachments

6. **Notifications**
   - Email notifications
   - In-app notifications

7. **Reviews & Ratings**
   - Rate brands and fragrances
   - User reviews

---

## TROUBLESHOOTING

### CORS Issues
- Check `.env` file has correct CORS origins
- Ensure Laravel CORS package is installed
- Restart Laravel server

### Database Errors
- Verify MySQL is running
- Check database credentials in `.env`
- Run migrations: `php artisan migrate`

### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check token is being sent in headers
- Verify Sanctum middleware in `app/Http/Kernel.php`

### React Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check .env file is in frontend root
- Restart development server

---

## File Locations

Keep all reference files:
- `SETUP_GUIDE.md` - This overview
- `LARAVEL_MIGRATIONS.md` - Database migrations
- `LARAVEL_MODELS.md` - Eloquent models
- `LARAVEL_API_CONTROLLERS.md` - API controllers and routes
- `REACT_API_SERVICE.md` - Axios service
- `REACT_COMPONENTS.md` - React components
- `REACT_APP_MAIN.md` - Main app component
- `REACT_STYLES.md` - CSS styles

---

## Quick Start Commands

**Terminal 1 (Backend):**
```bash
cd backend
php artisan migrate
php artisan serve
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm start
```

Visit: `http://localhost:3000`

---

## Support

For issues or questions, refer to:
- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev
- Axios Documentation: https://axios-http.com

Good luck with your project! 🎉
