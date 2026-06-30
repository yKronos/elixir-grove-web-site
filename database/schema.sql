PRAGMA foreign_keys = ON;

CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    created_at TEXT NOT NULL
);

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

-- Images remain separate so catalog queries stay small and an image can be
-- replaced without rewriting perfume metadata. image_data may hold a BLOB;
-- image_url may point at object/CDN storage in a server-backed deployment.
CREATE TABLE product_images (
    product_id TEXT PRIMARY KEY,
    image_data BLOB,
    image_url TEXT,
    mime_type TEXT NOT NULL DEFAULT 'image/webp',
    alt_text TEXT,
    updated_at TEXT NOT NULL,
    CHECK (image_data IS NOT NULL OR image_url IS NOT NULL),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE user_profiles (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL UNIQUE,
    preferred_brand TEXT,
    preferred_category TEXT,
    preferred_gender TEXT,
    preferred_longevity TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE wishlists (
    account_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (account_id, product_id),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
