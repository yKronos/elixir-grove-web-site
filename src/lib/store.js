const DB_NAME = "elixirGroveReactStore";
const DB_VERSION = 3;
const SESSION_KEY = "elixir-account-id";

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("IndexedDB is not available."));

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
      if (!db.objectStoreNames.contains("accounts")) {
        const accounts = db.createObjectStore("accounts", { keyPath: "id" });
        accounts.createIndex("email", "email", { unique: true });
      }
      if (!db.objectStoreNames.contains("profiles")) {
        db.createObjectStore("profiles", { keyPath: "id" });
      }
      // Version 1 used productId as the key, so wishlists could not belong to
      // different people. Recreate the empty guest store with an account key.
      if (event.oldVersion < 2 && db.objectStoreNames.contains("wishlist")) {
        db.deleteObjectStore("wishlist");
      }
      if (!db.objectStoreNames.contains("wishlist")) {
        const wishlist = db.createObjectStore("wishlist", { keyPath: ["accountId", "productId"] });
        wishlist.createIndex("accountId", "accountId");
      }
      if (!db.objectStoreNames.contains("productImages")) {
        db.createObjectStore("productImages", { keyPath: "productId" });
      }
      if (!db.objectStoreNames.contains("scentVotes")) {
        const votes = db.createObjectStore("scentVotes", { keyPath: ["accountId", "productId"] });
        votes.createIndex("productId", "productId");
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
    products.forEach(({ imageUrl, ...product }) => store.put(product));
  });
}

async function hashPassword(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function makeId() {
  return crypto.randomUUID?.() || `account-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function publicAccount(account) {
  if (!account) return null;
  const { passwordHash, passwordSalt, ...safeAccount } = account;
  return safeAccount;
}

async function getProfile(db, accountId) {
  return runTransaction(db, ["profiles"], "readonly", (tx) =>
    requestToPromise(tx.objectStore("profiles").get(accountId))
  );
}

async function getWishlist(db, accountId) {
  if (!accountId) return new Set();
  const entries = await runTransaction(db, ["wishlist"], "readonly", (tx) =>
    requestToPromise(tx.objectStore("wishlist").index("accountId").getAll(accountId))
  );
  return new Set(entries.map((entry) => entry.productId));
}

export async function registerAccount(db, { name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await runTransaction(db, ["accounts"], "readonly", (tx) =>
    requestToPromise(tx.objectStore("accounts").index("email").get(normalizedEmail))
  );
  if (existing) throw new Error("An account already exists for that email.");

  const id = makeId();
  const passwordSalt = makeId();
  const account = {
    id,
    name: name.trim(),
    email: normalizedEmail,
    passwordSalt,
    passwordHash: await hashPassword(password, passwordSalt),
    createdAt: new Date().toISOString()
  };
  const profile = {
    id,
    accountId: id,
    preferences: { brand: "all", category: "all", gender: "all", longevity: "all" },
    updatedAt: new Date().toISOString()
  };
  await runTransaction(db, ["accounts", "profiles"], "readwrite", (tx) => {
    tx.objectStore("accounts").add(account);
    tx.objectStore("profiles").put(profile);
  });
  localStorage.setItem(SESSION_KEY, id);
  return { account: publicAccount(account), profile, wishlist: new Set() };
}

export async function loginAccount(db, { email, password }) {
  const account = await runTransaction(db, ["accounts"], "readonly", (tx) =>
    requestToPromise(tx.objectStore("accounts").index("email").get(email.trim().toLowerCase()))
  );
  if (!account || (await hashPassword(password, account.passwordSalt)) !== account.passwordHash) {
    throw new Error("The email or password is incorrect.");
  }
  localStorage.setItem(SESSION_KEY, account.id);
  return {
    account: publicAccount(account),
    profile: await getProfile(db, account.id),
    wishlist: await getWishlist(db, account.id)
  };
}

export function logoutAccount() {
  localStorage.removeItem(SESSION_KEY);
}

export async function saveProfile(db, profile) {
  const nextProfile = { ...profile, updatedAt: new Date().toISOString() };
  await runTransaction(db, ["profiles"], "readwrite", (tx) => tx.objectStore("profiles").put(nextProfile));
  return nextProfile;
}

export async function toggleWishlist(db, accountId, productId) {
  const key = [accountId, productId];
  const existing = await runTransaction(db, ["wishlist"], "readonly", (tx) =>
    requestToPromise(tx.objectStore("wishlist").get(key))
  );
  await runTransaction(db, ["wishlist"], "readwrite", (tx) => {
    if (existing) tx.objectStore("wishlist").delete(key);
    else tx.objectStore("wishlist").put({ accountId, productId, createdAt: new Date().toISOString() });
  });
  return !existing;
}

export async function getScentVotes(db, productId, accountId = null) {
  const entries = await runTransaction(db, ["scentVotes"], "readonly", (tx) =>
    requestToPromise(tx.objectStore("scentVotes").index("productId").getAll(productId))
  );
  const totals = { love: 0, like: 0, ok: 0, dislike: 0, hate: 0 };
  entries.forEach((entry) => {
    if (Object.prototype.hasOwnProperty.call(totals, entry.vote)) totals[entry.vote] += 1;
  });
  return {
    totals,
    viewerVote: accountId
      ? entries.find((entry) => entry.accountId === accountId)?.vote || null
      : null
  };
}

export async function castScentVote(db, accountId, productId, vote) {
  const allowedVotes = new Set(["love", "like", "ok", "dislike", "hate"]);
  if (!allowedVotes.has(vote)) throw new Error("That vote is not supported.");
  await runTransaction(db, ["scentVotes"], "readwrite", (tx) => {
    tx.objectStore("scentVotes").put({
      accountId,
      productId,
      vote,
      updatedAt: new Date().toISOString()
    });
  });
  return getScentVotes(db, productId, accountId);
}

export async function saveProductImage(db, productId, image, mimeType = "image/webp") {
  const record = { productId, image, mimeType, updatedAt: new Date().toISOString() };
  await runTransaction(db, ["productImages"], "readwrite", (tx) => tx.objectStore("productImages").put(record));
  return record;
}

export async function searchProducts(db, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];
  const products = await runTransaction(db, ["products"], "readonly", (tx) =>
    requestToPromise(tx.objectStore("products").getAll())
  );
  return products.filter((product) => (product.searchText || [product.brand, product.name, product.type, product.category, product.gender, product.family].filter(Boolean).join(" ").toLowerCase()).includes(normalizedQuery));
}

export async function initializeStore(products) {
  const db = await openDatabase();
  const storedImages = await runTransaction(db, ["productImages"], "readonly", (tx) =>
    requestToPromise(tx.objectStore("productImages").getAll())
  );
  const imagesByProduct = new Map(storedImages.map((record) => [
    record.productId,
    record.image instanceof Blob ? URL.createObjectURL(record.image) : record.image
  ]));
  const hydratedProducts = products.map((product) => ({
    ...product,
    imageUrl: imagesByProduct.get(product.id) || null
  }));
  const accountId = localStorage.getItem(SESSION_KEY);
  const storedAccount = accountId
    ? await runTransaction(db, ["accounts"], "readonly", (tx) => requestToPromise(tx.objectStore("accounts").get(accountId)))
    : null;
  if (accountId && !storedAccount) localStorage.removeItem(SESSION_KEY);
  return {
    db,
    products: hydratedProducts,
    account: publicAccount(storedAccount),
    profile: storedAccount ? await getProfile(db, storedAccount.id) : null,
    wishlist: storedAccount ? await getWishlist(db, storedAccount.id) : new Set()
  };
}
