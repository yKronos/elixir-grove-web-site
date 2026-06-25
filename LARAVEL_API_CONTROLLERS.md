# Laravel API Controllers and Routes

## API Routes (routes/api.php)

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ActivityController;

Route::middleware('api')->group(function () {
    // Public routes
    Route::get('/brands', [BrandController::class, 'index']);
    Route::get('/brands/{id}', [BrandController::class, 'show']);
    Route::get('/community/posts', [CommunityController::class, 'index']);
    Route::get('/community/posts/{id}', [CommunityController::class, 'show']);
    Route::get('/profile/{userId}', [ProfileController::class, 'show']);
    
    // Auth routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    
    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        
        // Brands
        Route::post('/brands', [BrandController::class, 'store'])->middleware('role:admin');
        Route::put('/brands/{id}', [BrandController::class, 'update'])->middleware('role:admin');
        Route::delete('/brands/{id}', [BrandController::class, 'destroy'])->middleware('role:admin');
        Route::post('/brands/{id}/follow', [BrandController::class, 'follow']);
        
        // Community
        Route::post('/community/posts', [CommunityController::class, 'store']);
        Route::put('/community/posts/{id}', [CommunityController::class, 'update']);
        Route::delete('/community/posts/{id}', [CommunityController::class, 'destroy']);
        Route::post('/community/posts/{id}/like', [CommunityController::class, 'like']);
        Route::post('/community/posts/{id}/unlike', [CommunityController::class, 'unlike']);
        
        // Profile
        Route::put('/profile/{userId}', [ProfileController::class, 'update']);
        Route::get('/profile/{userId}/activity', [ProfileController::class, 'activity']);
        Route::post('/profile/{userId}/follow', [ProfileController::class, 'follow']);
        Route::post('/profile/{userId}/unfollow', [ProfileController::class, 'unfollow']);
        
        // Activity
        Route::get('/activity', [ActivityController::class, 'index']);
        Route::get('/activity/{userId}', [ActivityController::class, 'userActivity']);
        Route::post('/activity/log', [ActivityController::class, 'log']);
    });
});
```

## Authentication Controller (app/Http/Controllers/AuthController.php)

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Create user profile
        UserProfile::create(['user_id' => $user->id]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $user->createToken('api-token')->plainTextToken
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Log activity
        UserActivity::create([
            'user_id' => $user->id,
            'activity_type' => 'login',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $user->createToken('api-token')->plainTextToken
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
```

## Brand Controller (app/Http/Controllers/BrandController.php)

```php
<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index()
    {
        $brands = Brand::all();
        return response()->json($brands);
    }

    public function show($id)
    {
        $brand = Brand::findOrFail($id);
        return response()->json($brand);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:brands',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'category' => 'required|in:men,women,unisex',
            'website_url' => 'nullable|string',
        ]);

        $brand = Brand::create($validated);
        return response()->json($brand, 201);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'string|unique:brands,name,' . $id,
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'category' => 'in:men,women,unisex',
            'website_url' => 'nullable|string',
        ]);

        $brand->update($validated);
        return response()->json($brand);
    }

    public function destroy($id)
    {
        Brand::findOrFail($id)->delete();
        return response()->json(['message' => 'Brand deleted']);
    }

    public function follow(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);
        $brand->increment('followers_count');
        return response()->json(['message' => 'Brand followed']);
    }
}
```

## Community Controller (app/Http/Controllers/CommunityController.php)

```php
<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use App\Models\UserActivity;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function index(Request $request)
    {
        $posts = CommunityPost::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        
        return response()->json($posts);
    }

    public function show($id)
    {
        $post = CommunityPost::with('user')->findOrFail($id);
        return response()->json($post);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|in:newsletter,social_media,discussion',
        ]);

        $post = $request->user()->communityPosts()->create($validated);

        UserActivity::create([
            'user_id' => $request->user()->id,
            'activity_type' => 'post_created',
            'details' => ['post_id' => $post->id],
        ]);

        return response()->json($post, 201);
    }

    public function update(Request $request, $id)
    {
        $post = CommunityPost::findOrFail($id);
        
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'content' => 'string',
            'category' => 'in:newsletter,social_media,discussion',
        ]);

        $post->update($validated);
        return response()->json($post);
    }

    public function destroy(Request $request, $id)
    {
        $post = CommunityPost::findOrFail($id);
        
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post->delete();
        return response()->json(['message' => 'Post deleted']);
    }

    public function like(Request $request, $id)
    {
        $post = CommunityPost::findOrFail($id);
        $post->increment('likes_count');

        UserActivity::create([
            'user_id' => $request->user()->id,
            'activity_type' => 'post_liked',
            'details' => ['post_id' => $post->id],
        ]);

        return response()->json(['message' => 'Post liked']);
    }

    public function unlike(Request $request, $id)
    {
        $post = CommunityPost::findOrFail($id);
        $post->decrement('likes_count');
        return response()->json(['message' => 'Post unliked']);
    }
}
```

## Profile Controller (app/Http/Controllers/ProfileController.php)

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserActivity;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show($userId)
    {
        $user = User::with('profile', 'communityPosts', 'followers')
            ->findOrFail($userId);
        
        return response()->json($user);
    }

    public function update(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        if ($user->id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'bio' => 'nullable|string|max:500',
            'profile_picture' => 'nullable|string',
        ]);

        $user->update($validated);

        UserActivity::create([
            'user_id' => $user->id,
            'activity_type' => 'profile_updated',
        ]);

        return response()->json($user);
    }

    public function activity($userId)
    {
        $activities = UserActivity::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        
        return response()->json($activities);
    }

    public function follow(Request $request, $userId)
    {
        $targetUser = User::findOrFail($userId);
        
        if ($targetUser->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot follow yourself'], 400);
        }

        $request->user()->following()->attach($targetUser->id);
        
        return response()->json(['message' => 'User followed']);
    }

    public function unfollow(Request $request, $userId)
    {
        $request->user()->following()->detach($userId);
        return response()->json(['message' => 'User unfollowed']);
    }
}
```

## Activity Controller (app/Http/Controllers/ActivityController.php)

```php
<?php

namespace App\Http\Controllers;

use App\Models\UserActivity;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $activities = UserActivity::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return response()->json($activities);
    }

    public function userActivity($userId)
    {
        $activities = UserActivity::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        
        return response()->json($activities);
    }

    public function log(Request $request)
    {
        $validated = $request->validate([
            'activity_type' => 'required|string',
            'details' => 'nullable|array',
        ]);

        $activity = UserActivity::create([
            'user_id' => $request->user()->id,
            'activity_type' => $validated['activity_type'],
            'details' => $validated['details'] ?? null,
            'ip_address' => $request->ip(),
        ]);

        return response()->json($activity, 201);
    }
}
```

## Middleware: Check Role (app/Http/Middleware/CheckRole.php)

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, $role)
    {
        if ($request->user()->role !== $role) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
```
