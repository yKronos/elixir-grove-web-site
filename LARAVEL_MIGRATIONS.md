# Laravel Database Migrations

## Migration 1: Create Users Table (2024_01_01_000000_create_users_table.php)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('profile_picture')->nullable();
            $table->text('bio')->nullable();
            $table->string('role')->default('user'); // user, admin
            $table->rememberToken();
            $table->timestamps();
            
            $table->index('email');
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

## Migration 2: Create Brands Table (2024_01_02_000000_create_brands_table.php)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('category'); // men, women, unisex
            $table->string('website_url')->nullable();
            $table->integer('followers_count')->default(0);
            $table->timestamps();
            
            $table->index('category');
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brands');
    }
};
```

## Migration 3: Create Community Posts Table (2024_01_03_000000_create_community_posts_table.php)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->string('category'); // newsletter, social_media, discussion
            $table->integer('likes_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('category');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_posts');
    }
};
```

## Migration 4: Create User Activities Table (2024_01_04_000000_create_user_activities_table.php)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('activity_type'); // login, brand_view, post_created, post_liked
            $table->json('details')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('activity_type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_activities');
    }
};
```

## Migration 5: Create User Profiles Table (2024_01_05_000000_create_user_profiles_table.php)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->json('favorite_brands')->nullable();
            $table->integer('community_posts_count')->default(0);
            $table->integer('followers_count')->default(0);
            $table->integer('following_count')->default(0);
            $table->integer('total_likes_received')->default(0);
            $table->timestamps();
            
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
```

## How to Use

1. Copy each migration file into `backend/database/migrations/`
2. Name them with the timestamp prefix shown
3. Run: `php artisan migrate`

