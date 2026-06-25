# Elixir Grove Architecture Diagrams

## System Architecture Diagram

```
                          USERS (Browser)
                                |
                                | HTTP/HTTPS
                                |
                    ┌──────────────────────┐
                    │   REACT FRONTEND     │
                    │   (Port 3000)        │
                    │                      │
                    │ ├─ Navigation        │
                    │ ├─ Home Page         │
                    │ ├─ Brands Section    │
                    │ ├─ Community Section │
                    │ ├─ Profile Page      │
                    │ ├─ Auth Pages        │
                    │ └─ Activity Feed     │
                    └──────────────────────┘
                             |
                             | REST API Calls
                             | (Axios with JWT)
                             |
                    ┌──────────────────────┐
                    │  LARAVEL API         │
                    │  (Port 8000)         │
                    │                      │
                    │ ├─ Auth Controller   │
                    │ ├─ Brand Controller  │
                    │ ├─ Community Ctrl    │
                    │ ├─ Profile Ctrl      │
                    │ ├─ Activity Ctrl     │
                    │                      │
                    │ Routes & Middleware  │
                    │ - Sanctum Auth       │
                    │ - Role Middleware    │
                    │ - CORS Middleware    │
                    └──────────────────────┘
                             |
                             | SQL Queries
                             | (Eloquent ORM)
                             |
                    ┌──────────────────────┐
                    │   MYSQL DATABASE     │
                    │   (Local/Remote)     │
                    │                      │
                    │ ├─ users             │
                    │ ├─ brands            │
                    │ ├─ community_posts   │
                    │ ├─ user_activities   │
                    │ ├─ user_profiles     │
                    │ └─ pivot tables      │
                    └──────────────────────┘
```

---

## User Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                        │
└─────────────────────────────────────────────────────────────┘

User Input         React Component        Laravel API          Database
   |                    |                     |                   |
   └─→ Register Form   │                     |                   |
       (email, pwd)    │                     |                   |
                       │                     |                   |
                       └─→ POST /register   │                   |
                           (Axios)         │                   |
                                           │                   |
                                           ├─ Validate input   │
                                           │                   |
                                           ├─ Hash password    │
                                           │                   |
                                           ├─ Create User     │
                                           ├──────────────────→ INSERT users
                                           │                   │
                                           ├─ Generate Token   │
                                           │                   |
                                           ├─ Create Profile  |
                                           ├──────────────────→ INSERT user_profiles
                                           │                   │
                                           └─ Return token    │
                                               + user data    │
                       ←──────────────────────────────────────
                       Store token in
                       localStorage
                       │
                       └─→ Redirect to Home
                           (Logged In)


┌─────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────┘

User Input         React Component        Laravel API          Database
   |                    |                     |                   |
   └─→ Login Form      │                     |                   |
       (email, pwd)    │                     |                   |
                       │                     |                   |
                       └─→ POST /login      │                   |
                           (Axios)         │                   |
                                           │                   |
                                           ├─ Find user       │
                                           ├──────────────────→ SELECT * FROM users
                                           │                   │
                                           ├─ Verify password  │
                                           │                   |
                                           ├─ Generate Token   │
                                           │   (Sanctum)        |
                                           │                   |
                                           ├─ Log Activity    │
                                           ├──────────────────→ INSERT user_activities
                                           │                   │
                                           └─ Return token    │
                                               + user data    │
                       ←──────────────────────────────────────
                       Store token in
                       localStorage
                       │
                       └─→ Redirect to Home
                           (Logged In)


┌─────────────────────────────────────────────────────────────┐
│                 PROTECTED REQUESTS FLOW                     │
└─────────────────────────────────────────────────────────────┘

React Component                Laravel API              Database
       |                            |                      |
       └─→ GET /api/community/posts │                      |
           + Authorization: Bearer {token}
                                    │
                                    ├─ Verify token
                                    │  (Sanctum Middleware)
                                    │
                                    ├─ Token valid? Yes ✓
                                    │
                                    ├─ Get user from token
                                    │
                                    ├─ Fetch posts       
                                    ├─────────────────→ SELECT * FROM
                                    │                   community_posts
                                    │                      │
                                    ├─ Load user data  ←──┤
                                    ├─────────────────→ JOIN users
                                    │                      │
                                    └─ Return posts    ←──┤
                                        with user data
       ←───────────────────────────────────────────────────
       Display posts in
       Community component
```

---

## Database Relationship Diagram

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)            │
│ name               │
│ email (UNIQUE)     │
│ password (hashed)  │
│ profile_picture    │
│ bio                │
│ role (user/admin)  │
│ created_at         │
│ updated_at         │
└─────────────────────┘
        │
        │ 1:1
        │
┌─────────────────────┐
│  user_profiles      │
├─────────────────────┤
│ id (PK)            │
│ user_id (FK)       │ ◄────── References users.id
│ favorite_brands    │
│ followers_count    │
│ following_count    │
│ posts_count        │
│ created_at         │
│ updated_at         │
└─────────────────────┘


┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)            │
│ ... (fields above) │
└─────────────────────┘
        │
        │ 1:N
        │
┌─────────────────────┐
│ community_posts     │
├─────────────────────┤
│ id (PK)            │
│ user_id (FK)       │ ◄────── References users.id
│ title              │
│ content            │
│ category           │
│ likes_count        │
│ comments_count     │
│ created_at         │
│ updated_at         │
└─────────────────────┘


┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)            │
│ ... (fields above) │
└─────────────────────┘
        │
        │ 1:N
        │
┌─────────────────────┐
│  user_activities    │
├─────────────────────┤
│ id (PK)            │
│ user_id (FK)       │ ◄────── References users.id
│ activity_type      │
│ details (JSON)     │
│ ip_address         │
│ created_at         │
└─────────────────────┘


┌─────────────────────┐
│      brands         │
├─────────────────────┤
│ id (PK)            │
│ name (UNIQUE)      │
│ description        │
│ logo_url           │
│ category           │
│ website_url        │
│ followers_count    │
│ created_at         │
│ updated_at         │
└─────────────────────┘


┌─────────────────────┐     ┌──────────────┐     ┌──────────────┐
│      users          │────→│ user_follows │◄────│    users     │
├─────────────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)            │     │ follower_id  │     │ id (PK)      │
│ ... (fields)       │     │ following_id │     │ ... (fields) │
└─────────────────────┘     └──────────────┘     └──────────────┘
                              (Many-to-Many)
```

---

## Component Tree Diagram

```
App
│
├── Navigation
│   ├── Logo
│   ├── Menu Items (Home, Brands, Community, About)
│   ├── Search Box
│   └── Auth (Login/Register/Logout)
│
├── Home Section
│   ├── Carousel Component
│   │   ├── Slide 1: Jean Paul Gaultier
│   │   ├── Slide 2: Maison Margiela
│   │   └── Slide 3: Kilian
│   │
│   └── Welcome Section
│
├── Brands Section
│   ├── Section Header
│   ├── Brand Grid
│   │   └── BrandCard (Multiple instances)
│   │       ├── Image
│   │       ├── Name & Description
│   │       ├── Category Badge
│   │       ├── Stats (followers)
│   │       └── Follow Button
│   │
│   └── Filter Options
│
├── Community Section
│   ├── Section Header
│   ├── CreatePostForm (if authenticated)
│   │   ├── Title Input
│   │   ├── Content Textarea
│   │   ├── Category Select
│   │   └── Submit Button
│   │
│   ├── Posts List
│   │   └── CommunityPost (Multiple instances)
│   │       ├── Author Info
│   │       ├── Post Content
│   │       ├── Like Button
│   │       ├── Comment Button
│   │       └── Timestamp
│   │
│   └── Pagination Controls
│
├── Profile Section (Route: /profile/:userId)
│   ├── Profile Header
│   │   ├── Avatar
│   │   ├── Name & Bio
│   │   └── Stats (posts, followers, following)
│   │
│   └── Activity Feed
│       └── ActivityItem (Multiple instances)
│           ├── Activity Type
│           ├── Timestamp
│           └── Action Details
│
├── Auth Pages
│   ├── Login Page
│   │   ├── Email Input
│   │   ├── Password Input
│   │   ├── Submit Button
│   │   └── Register Link
│   │
│   └── Register Page
│       ├── Name Input
│       ├── Email Input
│       ├── Password Input
│       ├── Confirm Password
│       ├── Submit Button
│       └── Login Link
│
└── Footer
    ├── Contact Info
    ├── Social Links
    │   ├── Facebook
    │   ├── Twitter
    │   ├── Instagram
    │   └── YouTube
    │
    └── Copyright
```

---

## Data Flow Diagram: Creating a Post

```
Step 1: User fills form
┌────────────────────┐
│ CreatePostForm     │
│ ├─ title           │
│ ├─ content         │
│ └─ category        │
└────────────────────┘

         ↓

Step 2: Submit to API
┌────────────────────────────────┐
│ POST /api/community/posts      │
│ Authorization: Bearer {token}  │
│ {                              │
│   title, content, category     │
│ }                              │
└────────────────────────────────┘

         ↓

Step 3: Laravel Validates
┌────────────────────────────────┐
│ CommunityController::store()   │
│ ├─ Validate input              │
│ ├─ Check authentication        │
│ └─ Get user from token         │
└────────────────────────────────┘

         ↓

Step 4: Create Post & Track Activity
┌────────────────────────────────┐
│ Create Models:                 │
│ ├─ CommunityPost::create()     │
│ └─ UserActivity::create()      │
└────────────────────────────────┘

         ↓

Step 5: Database Inserts
┌────────────────────────────────┐
│ INSERT community_posts         │
│ (user_id, title, content...)   │
│                                │
│ INSERT user_activities         │
│ (user_id, post_created...)     │
└────────────────────────────────┘

         ↓

Step 6: Return Response
┌────────────────────────────────┐
│ {                              │
│   id, user_id, title,          │
│   content, likes_count: 0,     │
│   created_at, user: {...}      │
│ }                              │
└────────────────────────────────┘

         ↓

Step 7: Update UI
┌────────────────────────────────┐
│ setPosts([newPost, ...posts])  │
│ - Clear form                   │
│ - Show new post at top         │
│ - Show success message         │
└────────────────────────────────┘
```

---

## Request/Response Cycle

```
Browser Side                  Network                 Server Side
─────────────────────────────────────────────────────────────────

1. User Action
   │
   ├─→ React Component
   │   (.jsx file)
   │
   ├─→ Event Handler
   │   (onClick, onSubmit)
   │
   └─→ API Service Call
       (axios request)
                              ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
                        HTTP/HTTPS Request
                        ├─ Method (GET, POST, PUT, DELETE)
                        ├─ URL (/api/endpoint)
                        ├─ Headers (Authorization, Content-Type)
                        └─ Body (data, if applicable)
                              ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
                                                      ↓
                                            2. Laravel Router
                                               (routes/api.php)
                                            
                                            3. Middleware Stack
                                               ├─ CORS Middleware
                                               ├─ Auth Middleware
                                               └─ Role Middleware
                                            
                                            4. Controller Action
                                               (e.g., BrandController@index)
                                            
                                            5. Business Logic
                                               ├─ Query Database
                                               ├─ Process Data
                                               └─ Build Response
                                            
                                            6. Model Queries
                                               (Eloquent ORM)
                                               │
                                               ↓ SQL
                                               └─→ MySQL Database
                                                   │
                                                   ↓ Results
                                                   └─→ Back to Controller

                              ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                        HTTP/HTTPS Response
                        ├─ Status Code (200, 201, 400, 401, etc.)
                        ├─ Headers (Content-Type: application/json)
                        └─ Body (JSON data)
                              ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

   ←─── Response received
        
   ├─→ axios.interceptor
   │   (check status, token)
   │
   ├─→ Handle Success/Error
   │   (setState, redirect)
   │
   └─→ Re-render Component
       with new data
```

---

## Deployment Architecture (Future)

```
                    ┌──────────────────┐
                    │ User's Browser   │
                    └──────────────────┘
                            │
                    HTTPS (Encrypted)
                            │
                    ┌──────────────────────────┐
                    │   Web Server             │
                    │ (Nginx / Apache)         │
                    │                          │
                    │ Serves frontend build/   │
                    │ Handles API requests     │
                    └──────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────────────────┐  ┌────────────────────┐
        │  React Frontend   │  │  Laravel API       │
        │  (Cloudflare)     │  │  (AWS/DigitalOcean)│
        │  - Static files   │  │  - PHP-FPM         │
        │  - CDN cached     │  │  - Application code│
        │  - SSL/TLS        │  │  - Queues          │
        └───────────────────┘  └────────────────────┘
                                        │
                            ┌───────────┴──────────┐
                            │                      │
                    ┌──────────────────┐  ┌───────────────┐
                    │ MySQL Database   │  │ Cache/Redis   │
                    │ - Primary        │  │ - Session     │
                    │ - Replicas       │  │ - Queue       │
                    │ - Backups        │  │ - Cache       │
                    └──────────────────┘  └───────────────┘
```

---

## Testing Flow Diagram

```
Manual Testing Flow
─────────────────────────────────────────

Test 1: Registration
  Browser → Register Form → Submit → API Call
  → Validate Email → Hash Password → Save to DB
  → Generate Token → Return Response
  → Verify in localStorage → Check logged in ✓

Test 2: Login
  Browser → Login Form → Submit → API Call
  → Check Credentials → Generate Token → Return Response
  → Store Token → Navigate to Home → Check Page Load ✓

Test 3: View Brands
  Browser → Home Page → Scroll to Brands Section
  → API Call /api/brands → Database Query
  → Return 5+ brands → Display in grid
  → Check responsive layout ✓

Test 4: Create Community Post
  Browser → Community Section → Create Form
  → Fill Title + Content → Select Category
  → Submit → API Call + Token validation
  → Create Post → Log Activity → Show Success
  → Display new post at top → Check UI ✓

Test 5: Like Post
  Browser → Like Button → API Call + Token
  → Increment likes_count → Log Activity
  → Update UI instantly → Show count updated ✓

Test 6: View Profile
  Browser → Click on username → Get profile data
  → Query user + activities + stats
  → Display info + activity feed → Check all fields ✓

Test 7: Follow User
  Browser → Profile page → Follow Button
  → API Call + Token → Insert into follows table
  → Update count → Show "Following" state ✓
```

---

End of Architecture Diagrams
