(function () {
    "use strict";

    var catalog = window.ELIXIR_CATALOG || { products: [] };
    var products = [];
    var wishlist = new Set();
    var dbHandle = null;
    var profile = null;
    var state = {
        query: "",
        gender: "all",
        category: "all",
        brand: "all",
        longevity: "all",
        visibleCount: 16,
        selectedProductId: null
    };

    function byId(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    function uniqueSorted(key) {
        return products
            .map(function (product) { return product[key]; })
            .filter(Boolean)
            .filter(function (value, index, arr) { return arr.indexOf(value) === index; })
            .sort(function (a, b) { return a.localeCompare(b); });
    }

    function optionList(values, label) {
        return ['<option value="all">' + label + '</option>'].concat(
            values.map(function (value) {
                return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
            })
        ).join("");
    }

    function initials(product) {
        var brand = product.brand || "";
        return brand.split(/\s+/).slice(0, 2).map(function (word) {
            return word.charAt(0).toUpperCase();
        }).join("") || "EG";
    }

    function matchesSearch(product) {
        if (!state.query) {
            return true;
        }

        return (product.searchText || [
            product.brand,
            product.name,
            product.type,
            product.category,
            product.gender,
            product.longevity
        ].join(" ").toLowerCase()).indexOf(state.query) !== -1;
    }

    function filteredProducts() {
        return products.filter(function (product) {
            return matchesSearch(product) &&
                (state.gender === "all" || product.gender === state.gender) &&
                (state.category === "all" || product.category === state.category) &&
                (state.brand === "all" || product.brand === state.brand) &&
                (state.longevity === "all" || product.longevity === state.longevity);
        });
    }

    function productCard(product) {
        var wished = wishlist.has(product.id);

        return [
            '<article class="catalog-card scent-card" data-product-id="' + escapeHtml(product.id) + '">',
                '<button class="catalog-card__image scent-card__mark" type="button" aria-label="View recommendations for ' + escapeHtml(product.name) + '">',
                    '<span>' + escapeHtml(initials(product)) + '</span>',
                '</button>',
                '<div class="catalog-card__body">',
                    '<p class="catalog-card__brand">' + escapeHtml(product.brand) + '</p>',
                    '<h3>' + escapeHtml(product.name) + '</h3>',
                    '<p class="catalog-card__meta">' + escapeHtml(product.type) + ' / ' + escapeHtml(product.gender) + '</p>',
                    '<div class="catalog-card__notes scent-tags">',
                        '<span>' + escapeHtml(product.category) + '</span>',
                        '<span>' + escapeHtml(product.longevity) + '</span>',
                    '</div>',
                    '<div class="catalog-card__footer">',
                        '<strong>' + escapeHtml(product.family) + '</strong>',
                        '<button class="wishlist-toggle' + (wished ? ' active' : '') + '" type="button" data-wishlist-id="' + escapeHtml(product.id) + '">',
                            '<i class="fa ' + (wished ? 'fa-heart' : 'fa-heart-o') + '"></i> Wishlist',
                        '</button>',
                    '</div>',
                '</div>',
            '</article>'
        ].join("");
    }

    function similarityScore(base, candidate) {
        if (!base || base.id === candidate.id) {
            return -1;
        }

        var score = 0;
        if (base.brand === candidate.brand) score += 4;
        if (base.category === candidate.category) score += 5;
        if (base.family === candidate.family) score += 2;
        if (base.gender === candidate.gender) score += 2;
        if (base.longevity === candidate.longevity) score += 1;
        if (base.type === candidate.type) score += 1;
        return score;
    }

    function preferenceScore(product) {
        if (!profile || !profile.preferences) {
            return 0;
        }

        var preferences = profile.preferences;
        return (preferences.brand === product.brand ? 4 : 0) +
            (preferences.category === product.category ? 4 : 0) +
            (preferences.gender === product.gender ? 3 : 0) +
            (preferences.longevity === product.longevity ? 2 : 0);
    }

    function renderRecommendations() {
        var container = byId("recommendation-list");
        var title = byId("recommendation-title");
        if (!container || !title) {
            return;
        }

        var selected = products.find(function (product) {
            return product.id === state.selectedProductId;
        });

        var recommendations;
        if (selected) {
            title.textContent = "Similar to " + selected.name;
            recommendations = products
                .map(function (product) {
                    return { product: product, score: similarityScore(selected, product) };
                })
                .filter(function (entry) { return entry.score > 0; })
                .sort(function (a, b) { return b.score - a.score || a.product.name.localeCompare(b.product.name); })
                .slice(0, 4)
                .map(function (entry) { return entry.product; });
        } else {
            title.textContent = "Recommended for Your Profile";
            recommendations = products
                .map(function (product) {
                    return { product: product, score: preferenceScore(product) };
                })
                .filter(function (entry) { return entry.score > 0; })
                .sort(function (a, b) { return b.score - a.score || a.product.name.localeCompare(b.product.name); })
                .slice(0, 4)
                .map(function (entry) { return entry.product; });
        }

        if (!recommendations.length) {
            recommendations = products.slice(0, 4);
        }

        container.innerHTML = recommendations.map(productCard).join("");
    }

    function renderBrandMenus() {
        var menus = document.querySelectorAll("[data-brand-menu]");
        if (!menus.length) {
            return;
        }

        var brandCounts = products.reduce(function (map, product) {
            map[product.brand] = (map[product.brand] || 0) + 1;
            return map;
        }, {});

        var topBrands = Object.keys(brandCounts)
            .sort(function (a, b) { return brandCounts[b] - brandCounts[a] || a.localeCompare(b); })
            .slice(0, 24);

        menus.forEach(function (menu) {
            menu.innerHTML = topBrands.map(function (brand) {
                return '<li><a href="scents.html?brand=' + encodeURIComponent(brand) + '">' +
                    escapeHtml(brand) + ' <span>(' + brandCounts[brand] + ')</span></a></li>';
            }).join("");
        });
    }

    function renderBrandChips() {
        var container = byId("brand-chip-list");
        if (!container) {
            return;
        }

        var brandCounts = products.reduce(function (map, product) {
            map[product.brand] = (map[product.brand] || 0) + 1;
            return map;
        }, {});

        var topBrands = Object.keys(brandCounts)
            .sort(function (a, b) { return brandCounts[b] - brandCounts[a] || a.localeCompare(b); })
            .slice(0, 16);

        container.innerHTML = ['<button class="brand-chip active" type="button" data-brand="all">All brands</button>'].concat(
            topBrands.map(function (brand) {
                return '<button class="brand-chip" type="button" data-brand="' + escapeHtml(brand) + '">' +
                    escapeHtml(brand) + ' <span>' + brandCounts[brand] + '</span></button>';
            })
        ).join("");
    }

    function renderWishlistCount() {
        document.querySelectorAll("[data-wishlist-count]").forEach(function (element) {
            element.textContent = wishlist.size;
        });
    }

    function renderCatalog() {
        var grid = byId("catalog-grid");
        var summary = byId("catalog-summary");
        var loadMore = byId("catalog-load-more");
        if (!grid || !summary || !loadMore) {
            return;
        }

        var matches = filteredProducts();
        var visible = matches.slice(0, state.visibleCount);
        grid.innerHTML = visible.map(productCard).join("");
        summary.textContent = matches.length + " scents found from " + uniqueSorted("brand").length + " brands";
        loadMore.hidden = visible.length >= matches.length;
        renderRecommendations();
        renderWishlistCount();
    }

    function syncProfileForm() {
        if (!profile || !profile.preferences) {
            return;
        }

        var brand = byId("profile-brand");
        var category = byId("profile-category");
        var gender = byId("profile-gender");
        var longevity = byId("profile-longevity");

        if (brand) brand.value = profile.preferences.brand || "all";
        if (category) category.value = profile.preferences.category || "all";
        if (gender) gender.value = profile.preferences.gender || "all";
        if (longevity) longevity.value = profile.preferences.longevity || "all";
    }

    async function saveProfileFromForm() {
        var brand = byId("profile-brand");
        var category = byId("profile-category");
        var gender = byId("profile-gender");
        var longevity = byId("profile-longevity");
        var status = byId("profile-status");

        if (!profile || !brand || !category || !gender || !longevity) {
            return;
        }

        profile.preferences = {
            brand: brand.value,
            category: category.value,
            gender: gender.value,
            longevity: longevity.value
        };

        await window.ElixirDB.saveProfile(dbHandle, profile);
        state.selectedProductId = null;
        renderRecommendations();

        if (status) {
            status.textContent = "Preferences saved. Recommendations refreshed.";
        }
    }

    function hydrateFiltersFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var brand = params.get("brand");
        if (brand && uniqueSorted("brand").indexOf(brand) !== -1) {
            state.brand = brand;
        }
    }

    function initFilters() {
        var genderFilter = byId("gender-filter");
        var categoryFilter = byId("category-filter");
        var brandFilter = byId("brand-filter");
        var longevityFilter = byId("longevity-filter");
        var searchInput = byId("catalog-search");
        var loadMore = byId("catalog-load-more");
        var brandChips = byId("brand-chip-list");
        var catalogArea = byId("brands-section");
        var profileButton = byId("profile-save");

        if (!genderFilter || !categoryFilter || !brandFilter || !longevityFilter || !searchInput || !loadMore || !catalogArea) {
            return;
        }

        genderFilter.innerHTML = optionList(uniqueSorted("gender"), "All audiences");
        categoryFilter.innerHTML = optionList(uniqueSorted("category"), "All scent categories");
        brandFilter.innerHTML = optionList(uniqueSorted("brand"), "All brands");
        longevityFilter.innerHTML = optionList(uniqueSorted("longevity"), "All longevity");

        var profileBrand = byId("profile-brand");
        var profileCategory = byId("profile-category");
        var profileGender = byId("profile-gender");
        var profileLongevity = byId("profile-longevity");
        if (profileBrand) profileBrand.innerHTML = brandFilter.innerHTML;
        if (profileCategory) profileCategory.innerHTML = categoryFilter.innerHTML;
        if (profileGender) profileGender.innerHTML = genderFilter.innerHTML;
        if (profileLongevity) profileLongevity.innerHTML = longevityFilter.innerHTML;

        hydrateFiltersFromUrl();
        genderFilter.value = state.gender;
        categoryFilter.value = state.category;
        brandFilter.value = state.brand;
        longevityFilter.value = state.longevity;
        document.querySelectorAll(".brand-chip").forEach(function (chip) {
            chip.classList.toggle("active", chip.getAttribute("data-brand") === state.brand);
        });
        syncProfileForm();

        searchInput.addEventListener("input", function (event) {
            state.query = event.target.value.trim().toLowerCase();
            state.visibleCount = 16;
            renderCatalog();
        });

        genderFilter.addEventListener("change", function (event) {
            state.gender = event.target.value;
            state.visibleCount = 16;
            renderCatalog();
        });

        categoryFilter.addEventListener("change", function (event) {
            state.category = event.target.value;
            state.visibleCount = 16;
            renderCatalog();
        });

        brandFilter.addEventListener("change", function (event) {
            state.brand = event.target.value;
            state.visibleCount = 16;
            document.querySelectorAll(".brand-chip").forEach(function (chip) {
                chip.classList.toggle("active", chip.getAttribute("data-brand") === state.brand);
            });
            renderCatalog();
        });

        longevityFilter.addEventListener("change", function (event) {
            state.longevity = event.target.value;
            state.visibleCount = 16;
            renderCatalog();
        });

        loadMore.addEventListener("click", function () {
            state.visibleCount += 16;
            renderCatalog();
        });

        brandChips.addEventListener("click", function (event) {
            var button = event.target.closest("button[data-brand]");
            if (!button) {
                return;
            }

            state.brand = button.getAttribute("data-brand");
            brandFilter.value = state.brand;
            state.visibleCount = 16;
            brandChips.querySelectorAll(".brand-chip").forEach(function (chip) {
                chip.classList.toggle("active", chip === button);
            });
            renderCatalog();
        });

        catalogArea.addEventListener("click", async function (event) {
            var wishlistButton = event.target.closest("[data-wishlist-id]");
            if (wishlistButton) {
                var productId = wishlistButton.getAttribute("data-wishlist-id");
                var wished = await window.ElixirDB.toggleWishlist(dbHandle, productId);
                if (wished) {
                    wishlist.add(productId);
                } else {
                    wishlist.delete(productId);
                }
                renderCatalog();
                return;
            }

            var card = event.target.closest(".catalog-card");
            if (!card) {
                return;
            }

            state.selectedProductId = card.getAttribute("data-product-id");
            renderRecommendations();
            var recommendation = byId("recommendation-title");
            if (recommendation) {
                recommendation.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });

        if (profileButton) {
            profileButton.addEventListener("click", saveProfileFromForm);
        }
    }

    async function init() {
        try {
            var databaseState = await window.ElixirDB.initialize(catalog);
            dbHandle = databaseState.db;
            products = databaseState.products;
            profile = databaseState.profile;
            wishlist = new Set(databaseState.wishlist.map(function (item) { return item.productId; }));
        } catch (error) {
            products = catalog.products || [];
            wishlist = new Set();
            console.warn("Elixir Grove database unavailable; using in-memory catalog.", error);
        }

        if (products.length) {
            state.selectedProductId = products[0].id;
        }

        renderBrandMenus();
        renderBrandChips();
        initFilters();
        renderCatalog();
        renderWishlistCount();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
