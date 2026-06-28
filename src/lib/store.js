const DB_NAME = "elixirGroveReactStore";
const DB_VERSION = 1;
const PROFILE_ID = "default";

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("products")) {
        const products = db.createObjectStore("products", { keyPath: "id" });
        products.createIndex("brand", "brand");
        products.createIndex("category", "category");
        products.createIndex("gender", "gender");
        products.createIndex("longevity", "longevity");
      }

      if (!db.objectStoreNames.contains("profiles")) {
        db.createObjectStore("profiles", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("wishlist")) {
        const wishlist = db.createObjectStore("wishlist", { keyPath: "productId" });
        wishlist.createIndex("profileId", "profileId");
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = () => reject(request.error);
  });
}

function runTransaction(db, stores, mode, callback) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode);
    let result;

    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    result = callback(tx);
  });
}

async function seedProducts(db, products) {
  const count = await runTransaction(db, ["products"], "readonly", (tx) =>
    requestToPromise(tx.objectStore("products").count())
  );

  if (count === products.length) return;

  await runTransaction(db, ["products"], "readwrite", (tx) => {
    const store = tx.objectStore("products");
    store.clear();
    products.forEach((product) => store.put(product));
  });
}

async function ensureProfile(db) {
  const existing = await runTransaction(db, ["profiles"], "readonly", (tx) =>
    requestToPromise(tx.objectStore("profiles").get(PROFILE_ID))
  );

  if (existing) return existing;

  const profile = {
    id: PROFILE_ID,
    name: "Guest",
    preferences: {
      brand: "all",
      category: "all",
      gender: "all",
      longevity: "all"
    },
    updatedAt: new Date().toISOString()
  };

  await saveProfile(db, profile);
  return profile;
}

export async function saveProfile(db, profile) {
  const nextProfile = {
    ...profile,
    updatedAt: new Date().toISOString()
  };

  await runTransaction(db, ["profiles"], "readwrite", (tx) => {
    tx.objectStore("profiles").put(nextProfile);
  });

  return nextProfile;
}

export async function toggleWishlist(db, productId) {
  const existing = await runTransaction(db, ["wishlist"], "readonly", (tx) =>
    requestToPromise(tx.objectStore("wishlist").get(productId))
  );

  if (existing) {
    await runTransaction(db, ["wishlist"], "readwrite", (tx) => {
      tx.objectStore("wishlist").delete(productId);
    });
    return false;
  }

  await runTransaction(db, ["wishlist"], "readwrite", (tx) => {
    tx.objectStore("wishlist").put({
      productId,
      profileId: PROFILE_ID,
      createdAt: new Date().toISOString()
    });
  });

  return true;
}

export async function searchProducts(db, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const products = await runTransaction(db, ["products"], "readonly", (tx) =>
    requestToPromise(tx.objectStore("products").getAll())
  );

  return products.filter((product) => {
    const searchText =
      product.searchText ||
      [product.brand, product.name, product.type, product.category, product.gender, product.family]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return searchText.includes(normalizedQuery);
  });
}

export async function initializeStore(products) {
  const db = await openDatabase();
  await seedProducts(db, products);

  const [storedProducts, wishlist, profile] = await Promise.all([
    runTransaction(db, ["products"], "readonly", (tx) =>
      requestToPromise(tx.objectStore("products").getAll())
    ),
    runTransaction(db, ["wishlist"], "readonly", (tx) =>
      requestToPromise(tx.objectStore("wishlist").getAll())
    ),
    ensureProfile(db)
  ]);

  return {
    db,
    products: storedProducts,
    wishlist: new Set(wishlist.map((item) => item.productId)),
    profile
  };
}
