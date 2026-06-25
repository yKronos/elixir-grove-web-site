CREATE TABLE products (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    family TEXT NOT NULL,
    gender TEXT NOT NULL,
    longevity TEXT NOT NULL,
    search_text TEXT NOT NULL
);

CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Guest',
    preferred_brand TEXT,
    preferred_category TEXT,
    preferred_gender TEXT,
    preferred_longevity TEXT,
    updated_at TEXT NOT NULL
);

CREATE TABLE wishlists (
    profile_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (profile_id, product_id),
    FOREIGN KEY (profile_id) REFERENCES user_profiles(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
