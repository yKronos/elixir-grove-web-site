(function () {
    "use strict";

    var DB_NAME = "elixirGroveStore";
    var DB_VERSION = 1;
    var PROFILE_ID = "default";

    function openDatabase() {
        return new Promise(function (resolve, reject) {
            if (!("indexedDB" in window)) {
                reject(new Error("IndexedDB is not available in this browser."));
                return;
            }

            var request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = function (event) {
                var db = event.target.result;

                if (!db.objectStoreNames.contains("products")) {
                    var products = db.createObjectStore("products", { keyPath: "id" });
                    products.createIndex("brand", "brand", { unique: false });
                    products.createIndex("category", "category", { unique: false });
                    products.createIndex("gender", "gender", { unique: false });
                    products.createIndex("longevity", "longevity", { unique: false });
                }

                if (!db.objectStoreNames.contains("profiles")) {
                    db.createObjectStore("profiles", { keyPath: "id" });
                }

                if (!db.objectStoreNames.contains("wishlist")) {
                    var wishlist = db.createObjectStore("wishlist", { keyPath: "productId" });
                    wishlist.createIndex("profileId", "profileId", { unique: false });
                }
            };

            request.onsuccess = function (event) {
                resolve(event.target.result);
            };

            request.onerror = function () {
                reject(request.error);
            };
        });
    }

    function transaction(db, stores, mode, callback) {
        return new Promise(function (resolve, reject) {
            var tx = db.transaction(stores, mode);
            var result;

            tx.oncomplete = function () {
                resolve(result);
            };

            tx.onerror = function () {
                reject(tx.error);
            };

            result = callback(tx);
        });
    }

    function requestToPromise(request) {
        return new Promise(function (resolve, reject) {
            request.onsuccess = function () {
                resolve(request.result);
            };
            request.onerror = function () {
                reject(request.error);
            };
        });
    }

    function allFromStore(db, storeName) {
        return transaction(db, [storeName], "readonly", function (tx) {
            return requestToPromise(tx.objectStore(storeName).getAll());
        });
    }

    async function seedProducts(db, products) {
        var existing = await transaction(db, ["products"], "readonly", function (tx) {
            return requestToPromise(tx.objectStore("products").count());
        });

        if (existing === products.length) {
            return;
        }

        await transaction(db, ["products"], "readwrite", function (tx) {
            var store = tx.objectStore("products");
            store.clear();
            products.forEach(function (product) {
                store.put(product);
            });
        });
    }

    async function ensureProfile(db) {
        var profile = await transaction(db, ["profiles"], "readonly", function (tx) {
            return requestToPromise(tx.objectStore("profiles").get(PROFILE_ID));
        });

        if (profile) {
            return profile;
        }

        profile = {
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

    function saveProfile(db, profile) {
        profile.updatedAt = new Date().toISOString();
        return transaction(db, ["profiles"], "readwrite", function (tx) {
            tx.objectStore("profiles").put(profile);
        });
    }

    function getWishlist(db) {
        return allFromStore(db, "wishlist");
    }

    async function toggleWishlist(db, productId) {
        var existing = await transaction(db, ["wishlist"], "readonly", function (tx) {
            return requestToPromise(tx.objectStore("wishlist").get(productId));
        });

        if (existing) {
            await transaction(db, ["wishlist"], "readwrite", function (tx) {
                tx.objectStore("wishlist").delete(productId);
            });
            return false;
        }

        await transaction(db, ["wishlist"], "readwrite", function (tx) {
            tx.objectStore("wishlist").put({
                productId: productId,
                profileId: PROFILE_ID,
                createdAt: new Date().toISOString()
            });
        });
        return true;
    }

    async function initialize(catalog) {
        var db = await openDatabase();
        await seedProducts(db, catalog.products || []);
        var profile = await ensureProfile(db);
        return {
            db: db,
            products: await allFromStore(db, "products"),
            profile: profile,
            wishlist: await getWishlist(db)
        };
    }

    window.ElixirDB = {
        initialize: initialize,
        getProducts: function (db) { return allFromStore(db, "products"); },
        getWishlist: getWishlist,
        toggleWishlist: toggleWishlist,
        saveProfile: saveProfile
    };
})();
