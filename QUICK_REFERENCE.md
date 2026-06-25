# Elixir Grove - React + Laravel - Quick Reference

## 📁 Project Files Created

All reference files are in: `c:\Users\Charles Edward\Desktop\codingprojects\elixir grove web site\`

### Documentation Files
1. **SETUP_GUIDE.md** - Project overview and structure
2. **IMPLEMENTATION_GUIDE.md** ⭐ START HERE - Step-by-step implementation
3. **LARAVEL_MIGRATIONS.md** - Database migration files
4. **LARAVEL_MODELS.md** - Eloquent model definitions
5. **LARAVEL_API_CONTROLLERS.md** - API routes and controllers
6. **REACT_API_SERVICE.md** - Axios service for API calls
7. **REACT_COMPONENTS.md** - All React component code
8. **REACT_APP_MAIN.md** - Main App.jsx file
9. **REACT_STYLES.md** - Complete CSS styling

### Configuration Files
- **frontend_package.json** - Copy content to your React package.json

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 16+ (for React)
- PHP 8.1+ (for Laravel)
- Composer (for Laravel packages)
- MySQL 5.7+ (or higher)
- MySQL GUI like HeidiSQL or Workbench

### Step 1: Backend Setup
```bash
# Terminal 1
composer create-project laravel/laravel backend
cd backend
cp .env.example .env
php artisan key:generate

# Update .env database settings
# DB_DATABASE=elixir_grove
# DB_USERNAME=root
# DB_PASSWORD=

php artisan migrate
php artisan serve
# Runs on http://localhost:8000
```

### Step 2: Frontend Setup
```bash
# Terminal 2
npx create-react-app frontend
cd frontend
npm install axios react-router-dom

# Copy .env content from this guide
# Create file: frontend/.env
# Add: REACT_APP_API_URL=http://localhost:8000/api

npm start
# Runs on http://localhost:3000
```

### Step 3: Copy Files
Copy code from reference files:
1. Controllers → `backend/app/Http/Controllers/`
2. Models → `backend/app/Models/`
3. Migrations → `backend/database/migrations/`
4. Routes → `backend/routes/api.php`
5. Components → `frontend/src/components/`
6. Services → `frontend/src/services/`
7. Styles → `frontend/src/App.css`

---

## 📊 Database Schema

### Tables Created
```
✓ users               - User accounts with auth
✓ brands              - Fragrance brands (men, women, unisex)
✓ community_posts     - User posts and discussions
✓ user_activities     - Activity tracking (login, posts, likes)
✓ user_profiles       - Extended user data
✓ user_follows        - Follow relationships (auto-created)
✓ community_post_like - Post likes (auto-created)
```

### Key Features
- User authentication with hashed passwords
- JWT tokens via Sanctum
- User roles (user, admin)
- Activity tracking
- Community engagement
- Brand following

---

## 🔐 Authentication Flow

### Register
```
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
Response: { token, user }
```

### Login
```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
Response: { token, user }
```

### Token Usage
```javascript
// In React components
const token = localStorage.getItem('token');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

---

## 🌐 API Endpoints

### Public (No Auth Required)
- `GET /api/brands` - List brands
- `GET /api/brands/{id}` - Brand details
- `GET /api/community/posts` - Community posts
- `GET /api/profile/{userId}` - User profiles
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Protected (Auth Required)
- `POST /api/community/posts` - Create post
- `POST /api/community/posts/{id}/like` - Like post
- `PUT /api/profile/{userId}` - Update profile
- `POST /api/brands/{id}/follow` - Follow brand
- `GET /api/activity` - User activity
- `POST /api/auth/logout` - Logout

### Admin Only
- `POST /api/brands` - Create brand
- `PUT /api/brands/{id}` - Update brand
- `DELETE /api/brands/{id}` - Delete brand

---

## 📝 Component Hierarchy

```
App
├── Navigation
├── Home
│   └── Carousel
├── Brands
│   └── BrandCard (multiple)
├── Community
│   ├── CreatePostForm
│   └── CommunityPost (multiple)
├── Profile
│   └── ActivityList
├── Login / Register
└── Footer
```

---

## 🔧 Configuration Files

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_API_BASE=http://localhost:8000
```

### Backend `.env`
```
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=elixir_grove
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:3000
CORS_ALLOWED_ORIGINS="http://localhost:3000"
```

---

## 🧪 Test User Data

After migration, you can create test data:

### Using Seeder
```bash
php artisan make:seeder UserSeeder
# Add users
php artisan db:seed --class=UserSeeder
```

### Using Tinker REPL
```bash
php artisan tinker
>>> App\Models\Brand::create(['name' => 'Jean Paul Gaultier', 'category' => 'men'])
>>> App\Models\User::create(['name' => 'John', 'email' => 'john@test.com', 'password' => bcrypt('password')])
```

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error
**Solution:**
1. Check backend `.env` CORS_ALLOWED_ORIGINS
2. Install CORS package: `composer require laravel/cors`
3. Register in `config/cors.php`

### Issue: 401 Unauthorized
**Solution:**
1. Check token in localStorage
2. Verify Sanctum middleware installed
3. Ensure `auth:sanctum` middleware on protected routes

### Issue: Database Connection Failed
**Solution:**
1. Check MySQL is running
2. Verify credentials in `.env`
3. Create database: `mysql> CREATE DATABASE elixir_grove;`

### Issue: React Cannot Find Module
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 📚 Key Files Reference

### Laravel Important Files
```
backend/
├── app/Http/Controllers/      ← API endpoints
├── app/Models/                ← Database models
├── database/migrations/       ← Schema definitions
├── routes/api.php            ← Route definitions
├── config/cors.php           ← CORS settings
└── .env                       ← Configuration
```

### React Important Files
```
frontend/
├── src/components/            ← React components
├── src/services/api.js       ← API calls
├── src/App.jsx               ← Main app
├── src/App.css               ← Styles
├── .env                       ← Configuration
└── package.json              ← Dependencies
```

---

## 🎯 Feature Checklist

- [x] User Authentication (Register/Login)
- [x] JWT Tokens with Sanctum
- [x] Brand Management
- [x] Community Posts
- [x] User Profiles
- [x] Activity Tracking
- [x] Like/Unlike Posts
- [x] Follow/Unfollow Brands
- [x] User Following System
- [ ] Comments on Posts (Future)
- [ ] Direct Messaging (Future)
- [ ] Image Upload (Future)
- [ ] Search & Filters (Future)

---

## 🚢 Deployment Checklist

### Before Production
- [ ] Update CORS origins to production domain
- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Generate strong `APP_KEY`
- [ ] Configure database backups
- [ ] Set up email configuration
- [ ] Install SSL certificate
- [ ] Configure file storage
- [ ] Set up error logging

### Production Commands
```bash
# Backend
php artisan migrate --force
php artisan cache:clear
php artisan config:cache

# Frontend
npm run build
# Deploy build/ folder to hosting
```

---

## 📞 Support Resources

- **Laravel Docs:** https://laravel.com/docs/10
- **React Docs:** https://react.dev
- **Sanctum Auth:** https://laravel.com/docs/10/sanctum
- **Axios HTTP:** https://axios-http.com/docs

---

## 📋 Checklist for Implementation

- [ ] Read `IMPLEMENTATION_GUIDE.md` completely
- [ ] Create Laravel project
- [ ] Configure database connection
- [ ] Create and run migrations
- [ ] Copy all controllers to Laravel
- [ ] Copy all models to Laravel
- [ ] Set up API routes
- [ ] Create React app
- [ ] Install React dependencies
- [ ] Copy all components to React
- [ ] Copy API service to React
- [ ] Create `.env` files
- [ ] Test authentication flow
- [ ] Test API endpoints with Postman
- [ ] Test React frontend
- [ ] Test community features
- [ ] Test user profiles
- [ ] Verify activity tracking

---

## 🎉 You're Ready!

Follow `IMPLEMENTATION_GUIDE.md` for detailed step-by-step instructions.

Good luck with your Elixir Grove full-stack application! 🌸
