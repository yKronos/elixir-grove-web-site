(function () {
    "use strict";

    var catalog = window.ELIXIR_CATALOG || { products: [] };
    var products = catalog.products || [];
    var state = {
        query: "",
        gender: "all",
        family: "all",
        brand: "all",
        visibleCount: 12,
        selectedProductId: products[0] ? products[0].id : null
    };

    function byId(id) {
        return document.getElementById(id);
    }

    function formatPrice(product) {
        return product.priceSar ? "SAR " + product.priceSar.toLocaleString() : "Price on request";
    }

    function optionList(values, label) {
        return ['<option value="all">' + label + '</option>'].concat(
            values.map(function (value) {
                return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
            })
        ).join("");
    }

    function uniqueSorted(key) {
        return products
            .map(function (product) { return product[key]; })
            .filter(Boolean)
            .filter(function (value, index, arr) { return arr.indexOf(value) === index; })
            .sort(function (a, b) { return a.localeCompare(b); });
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

    function matchesSearch(product) {
        if (!state.query) {
            return true;
        }

        var haystack = [
            product.name,
            product.brand,
            product.gender,
            product.family,
            product.character,
            product.concentration,
            product.description,
            (product.notes || []).join(" ")
        ].join(" ").toLowerCase();

        return haystack.indexOf(state.query) !== -1;
    }

    function filteredProducts() {
        return products.filter(function (product) {
            return matchesSearch(product) &&
                (state.gender === "all" || product.gender === state.gender) &&
                (state.family === "all" || product.family === state.family) &&
                (state.brand === "all" || product.brand === state.brand);
        });
    }

    function productCard(product) {
        var notes = (product.notes || []).slice(0, 3).map(function (note) {
            return '<span>' + escapeHtml(note) + '</span>';
        }).join("");

        return [
            '<article class="catalog-card" data-product-id="' + escapeHtml(product.id) + '">',
                '<button class="catalog-card__image" type="button" aria-label="View recommendations for ' + escapeHtml(product.name) + '">',
                    '<img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name) + '" loading="lazy">',
                '</button>',
                '<div class="catalog-card__body">',
                    '<p class="catalog-card__brand">' + escapeHtml(product.brand) + '</p>',
                    '<h3>' + escapeHtml(product.name) + '</h3>',
                    '<p class="catalog-card__meta">' + escapeHtml(product.gender) + ' / ' + escapeHtml(product.family) + '</p>',
                    '<p class="catalog-card__description">' + escapeHtml(product.description) + '</p>',
                    '<div class="catalog-card__notes">' + notes + '</div>',
                    '<div class="catalog-card__footer">',
                        '<strong>' + formatPrice(product) + '</strong>',
                        '<span><i class="fa fa-star"></i> ' + product.rating + ' (' + product.ratingCount + ')</span>',
                    '</div>',
                '</div>',
            '</article>'
        ].join("");
    }

    function similarityScore(base, candidate) {
        if (!base || base.id === candidate.id) {
            return -1;
        }

        var baseTerms = new Set([base.gender, base.family, base.character].concat(base.notes || []).filter(Boolean).map(function (term) {
            return term.toLowerCase();
        }));

        var candidateTerms = [candidate.gender, candidate.family, candidate.character].concat(candidate.notes || []).filter(Boolean).map(function (term) {
            return term.toLowerCase();
        });

        return candidateTerms.reduce(function (score, term) {
            return score + (baseTerms.has(term) ? 1 : 0);
        }, 0) + (base.brand === candidate.brand ? 1.5 : 0);
    }

    function renderRecommendations() {
        var container = byId("recommendation-list");
        var title = byId("recommendation-title");
        if (!container || !title) {
            return;
        }

        var selected = products.find(function (product) {
            return product.id === state.selectedProductId;
        }) || products[0];

        if (!selected) {
            container.innerHTML = "";
            return;
        }

        title.textContent = "Similar to " + selected.name;
        container.innerHTML = products
            .map(function (product) {
                return {
                    product: product,
                    score: similarityScore(selected, product)
                };
            })
            .filter(function (entry) { return entry.score > 0; })
            .sort(function (a, b) {
                return b.score - a.score || b.product.ratingCount - a.product.ratingCount;
            })
            .slice(0, 4)
            .map(function (entry) { return productCard(entry.product); })
            .join("");
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
            .slice(0, 14);

        container.innerHTML = ['<button class="brand-chip active" type="button" data-brand="all">All brands</button>'].concat(
            topBrands.map(function (brand) {
                return '<button class="brand-chip" type="button" data-brand="' + escapeHtml(brand) + '">' +
                    escapeHtml(brand) + ' <span>' + brandCounts[brand] + '</span></button>';
            })
        ).join("");
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
        summary.textContent = matches.length + " fragrances found from " + uniqueSorted("brand").length + " brands";
        loadMore.hidden = visible.length >= matches.length;
        renderRecommendations();
    }

    function initFilters() {
        var genderFilter = byId("gender-filter");
        var familyFilter = byId("family-filter");
        var brandFilter = byId("brand-filter");
        var searchInput = byId("catalog-search");
        var loadMore = byId("catalog-load-more");
        var brandChips = byId("brand-chip-list");
        var catalogArea = byId("brands-section");

        if (!genderFilter || !familyFilter || !brandFilter || !searchInput || !loadMore || !catalogArea) {
            return;
        }

        genderFilter.innerHTML = optionList(uniqueSorted("gender"), "All genders");
        familyFilter.innerHTML = optionList(uniqueSorted("family"), "All fragrance families");
        brandFilter.innerHTML = optionList(uniqueSorted("brand"), "All brands");

        searchInput.addEventListener("input", function (event) {
            state.query = event.target.value.trim().toLowerCase();
            state.visibleCount = 12;
            renderCatalog();
        });

        genderFilter.addEventListener("change", function (event) {
            state.gender = event.target.value;
            state.visibleCount = 12;
            renderCatalog();
        });

        familyFilter.addEventListener("change", function (event) {
            state.family = event.target.value;
            state.visibleCount = 12;
            renderCatalog();
        });

        brandFilter.addEventListener("change", function (event) {
            state.brand = event.target.value;
            state.visibleCount = 12;
            renderCatalog();
        });

        loadMore.addEventListener("click", function () {
            state.visibleCount += 12;
            renderCatalog();
        });

        brandChips.addEventListener("click", function (event) {
            var button = event.target.closest("button[data-brand]");
            if (!button) {
                return;
            }

            state.brand = button.getAttribute("data-brand");
            brandFilter.value = state.brand;
            state.visibleCount = 12;
            brandChips.querySelectorAll(".brand-chip").forEach(function (chip) {
                chip.classList.toggle("active", chip === button);
            });
            renderCatalog();
        });

        catalogArea.addEventListener("click", function (event) {
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
    }

    document.addEventListener("DOMContentLoaded", function () {
        renderBrandChips();
        initFilters();
        renderCatalog();
    });
})();
