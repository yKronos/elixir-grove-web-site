import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Heart,
  Leaf,
  Menu,
  Search,
  Sparkles,
  Star,
  UserRound,
  X
} from "lucide-react";
import {
  catalogProducts,
  scoreByProfile,
  scoreBySimilarity,
  topBrands,
  uniqueValues
} from "./lib/catalog.js";
import { initializeStore, saveProfile, toggleWishlist } from "./lib/store.js";

const navItems = [
  { id: "home", label: "Home" },
  { id: "scents", label: "Scents" },
  { id: "community", label: "Community" },
  { id: "about", label: "About" }
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function initials(product) {
  return product.brand
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function App() {
  const [route, setRoute] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [db, setDb] = useState(null);
  const [products, setProducts] = useState(catalogProducts);
  const [wishlist, setWishlist] = useState(new Set());
  const [profile, setProfile] = useState(null);
  const [filters, setFilters] = useState({
    query: "",
    brand: "all",
    category: "all",
    gender: "all",
    longevity: "all"
  });
  const [visibleCount, setVisibleCount] = useState(16);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [profileStatus, setProfileStatus] = useState("Wishlist and profile data save locally.");

  useEffect(() => {
    let mounted = true;

    initializeStore(catalogProducts)
      .then((state) => {
        if (!mounted) return;
        setDb(state.db);
        setProducts(state.products);
        setWishlist(state.wishlist);
        setProfile(state.profile);
        setSelectedProduct(state.products[0] || null);
      })
      .catch(() => {
        if (!mounted) return;
        setProducts(catalogProducts);
        setSelectedProduct(catalogProducts[0] || null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const brands = useMemo(() => uniqueValues(products, "brand"), [products]);
  const categories = useMemo(() => uniqueValues(products, "category"), [products]);
  const genders = useMemo(() => uniqueValues(products, "gender"), [products]);
  const longevity = useMemo(() => uniqueValues(products, "longevity"), [products]);
  const featuredBrands = useMemo(() => topBrands(products, 18), [products]);

  const filteredProducts = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return products.filter((product) => {
      const searchText =
        product.searchText ||
        [product.brand, product.name, product.type, product.category, product.gender, product.longevity]
          .join(" ")
          .toLowerCase();

      return (
        (!query || searchText.includes(query)) &&
        (filters.brand === "all" || product.brand === filters.brand) &&
        (filters.category === "all" || product.category === filters.category) &&
        (filters.gender === "all" || product.gender === filters.gender) &&
        (filters.longevity === "all" || product.longevity === filters.longevity)
      );
    });
  }, [filters, products]);

  const recommendations = useMemo(() => {
    const scored = products
      .map((product) => ({
        product,
        score: selectedProduct
          ? scoreBySimilarity(selectedProduct, product)
          : scoreByProfile(profile, product)
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
      .slice(0, 4)
      .map((entry) => entry.product);

    return scored.length ? scored : products.slice(0, 4);
  }, [products, profile, selectedProduct]);

  const showScents = (nextFilters = {}) => {
    setRoute("scents");
    setMenuOpen(false);
    setVisibleCount(16);
    setFilters((current) => ({ ...current, ...nextFilters }));
  };

  const updateFilter = (key, value) => {
    setVisibleCount(16);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleWishlist = async (productId) => {
    if (!db) return;
    const wished = await toggleWishlist(db, productId);
    setWishlist((current) => {
      const next = new Set(current);
      if (wished) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const handleProfileSave = async (preferences) => {
    if (!db || !profile) return;
    const nextProfile = await saveProfile(db, {
      ...profile,
      preferences
    });
    setProfile(nextProfile);
    setSelectedProduct(null);
    setProfileStatus("Preferences saved. Recommendations refreshed.");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-cream font-body text-ink">
      <Navigation
        route={route}
        setRoute={setRoute}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        brands={featuredBrands}
        wishlistCount={wishlist.size}
        showScents={showScents}
      />

      {route === "scents" ? (
        <Scents
          brands={brands}
          categories={categories}
          genders={genders}
          longevity={longevity}
          featuredBrands={featuredBrands}
          filters={filters}
          filteredProducts={filteredProducts}
          visibleCount={visibleCount}
          setVisibleCount={setVisibleCount}
          updateFilter={updateFilter}
          wishlist={wishlist}
          onWishlist={handleWishlist}
          onSelectProduct={setSelectedProduct}
          selectedProduct={selectedProduct}
          recommendations={recommendations}
          profile={profile}
          profileStatus={profileStatus}
          onProfileSave={handleProfileSave}
        />
      ) : (
        <Home showScents={showScents} products={products} brands={featuredBrands} />
      )}

      <Community />
      <About />
      <Footer />
    </div>
  );
}

function Navigation({ route, setRoute, menuOpen, setMenuOpen, brands, wishlistCount, showScents }) {
  const navAction = (id) => {
    if (id === "scents") showScents();
    else if (id === "community" || id === "about") {
      setRoute("home");
      setMenuOpen(false);
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    }
    else {
      setRoute(id);
      setMenuOpen(false);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/40 bg-cream/82 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          className="group flex items-center gap-3"
          onClick={() => navAction("home")}
          type="button"
        >
          <img className="h-12 w-12 rounded-full" src="/elixirgrove-logo.png" alt="Elixir Grove" />
          <span className="text-left">
            <span className="block font-display text-2xl leading-none">Elixir</span>
            <span className="block text-sm uppercase tracking-[0.36em] text-ember">Grove</span>
          </span>
        </button>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <div key={item.id} className="group relative">
              <button
                className={cx(
                  "text-sm font-semibold uppercase tracking-[0.22em] transition",
                  route === item.id ? "text-ember" : "text-ink/70 hover:text-ink"
                )}
                onClick={() => navAction(item.id)}
                type="button"
              >
                {item.label}
              </button>

              {item.id === "scents" && (
                <div className="pointer-events-none absolute left-1/2 top-9 w-[520px] -translate-x-1/2 rounded-3xl border border-white/70 bg-white/95 p-5 opacity-0 shadow-soft transition duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-ink/45">
                    Available brands
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {brands.slice(0, 15).map(({ brand, count }) => (
                      <button
                        className="rounded-2xl bg-mist px-3 py-2 text-left text-sm transition hover:bg-ember hover:text-white"
                        key={brand}
                        onClick={() => showScents({ brand })}
                        type="button"
                      >
                        {brand} <span className="text-xs opacity-60">({count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="hidden rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:border-ember hover:text-ember sm:flex"
            onClick={() => showScents()}
            type="button"
          >
            <Heart className="mr-2 h-4 w-4" />
            Wishlist {wishlistCount}
          </button>
          <button
            className="rounded-full bg-ink p-3 text-white lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/60 bg-cream px-4 py-5 lg:hidden">
          <div className="grid gap-3">
            {navItems.map((item) => (
              <button
                className="rounded-2xl bg-white px-4 py-3 text-left font-semibold shadow-sm"
                key={item.id}
                onClick={() => navAction(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function Home({ showScents, products, brands }) {
  const heroStats = [
    ["Scents", products.length],
    ["Brands", brands.length],
    ["Profiles", "Local"]
  ];

  return (
    <main className="relative pt-20">
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/images/banner/banner1.jpeg"
          alt="Luxury perfume display"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/72 to-ink/20" />
        <div className="absolute -right-20 top-28 h-72 w-72 rounded-full bg-ember/30 blur-3xl" />
        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl animate-reveal text-white">
            <p className="mb-5 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] backdrop-blur">
              Dataset-backed fragrance discovery
            </p>
            <h1 className="font-display text-6xl leading-[0.92] sm:text-7xl lg:text-8xl">
              Find the scent that feels inevitable.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
              Elixir Grove is now a React storefront with a dedicated Scents catalog,
              local profile preferences, wishlist persistence, and animated product discovery.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <button
                className="group rounded-full bg-ember px-7 py-4 font-bold text-white shadow-glow transition hover:-translate-y-1"
                onClick={() => showScents()}
                type="button"
              >
                Explore Scents
                <ArrowRight className="ml-2 inline h-5 w-5 transition group-hover:translate-x-1" />
              </button>
              <button
                className="rounded-full border border-white/35 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur transition hover:bg-white hover:text-ink"
                onClick={() => showScents({ gender: "Unisex" })}
                type="button"
              >
                Start With Unisex
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 rounded-[2rem] border border-white/70 bg-white/90 p-4 shadow-soft backdrop-blur md:grid-cols-3">
          {heroStats.map(([label, value]) => (
            <div className="rounded-[1.5rem] bg-mist p-6" key={label}>
              <p className="text-sm font-bold uppercase tracking-[0.28em] text-ink/45">{label}</p>
              <p className="mt-2 font-display text-4xl">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-ember">A cleaner landing page</p>
          <h2 className="mt-4 font-display text-5xl leading-tight">The catalog moved where it belongs.</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {[
            ["Scents page", "Browse, filter, save, and compare perfumes without crowding the home page."],
            ["Local database", "IndexedDB stores products, preferences, and wishlist data in the browser."],
            ["React motion", "Cards, menus, and hero elements use polished Tailwind transitions."],
            ["Future-ready", "The schema can map cleanly to a backend database when you add auth."]
          ].map(([title, body]) => (
            <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft" key={title}>
              <Sparkles className="mb-5 h-6 w-6 text-ember" />
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-ink/60">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Scents(props) {
  const {
    brands,
    categories,
    genders,
    longevity,
    featuredBrands,
    filters,
    filteredProducts,
    visibleCount,
    setVisibleCount,
    updateFilter,
    wishlist,
    onWishlist,
    onSelectProduct,
    selectedProduct,
    recommendations,
    profile,
    profileStatus,
    onProfileSave
  } = props;

  const [draftProfile, setDraftProfile] = useState(profile?.preferences || {});

  useEffect(() => {
    setDraftProfile(profile?.preferences || {});
  }, [profile]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <main className="pt-20">
      <section className="relative overflow-hidden bg-ink px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-30">
          <img className="h-full w-full object-cover" src="/images/banner/mutiny.jpg" alt="Perfume bottles" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/55" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.32em] text-ember">Scents</p>
          <h1 className="mt-4 max-w-4xl font-display text-6xl leading-tight">A proper catalog, not hardcoded cards.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
            Filter {brands.length} brands and {categories.length} scent categories from your Kaggle dataset.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/70 bg-white p-5 shadow-soft">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <label className="catalog-field">
              <span>Search</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/35" />
                <input
                  className="pl-12"
                  onChange={(event) => updateFilter("query", event.target.value)}
                  placeholder="Search brand, perfume, type, or category"
                  value={filters.query}
                />
              </div>
            </label>
            <FilterSelect label="Audience" value={filters.gender} values={genders} onChange={(value) => updateFilter("gender", value)} />
            <FilterSelect label="Category" value={filters.category} values={categories} onChange={(value) => updateFilter("category", value)} />
            <FilterSelect label="Brand" value={filters.brand} values={brands} onChange={(value) => updateFilter("brand", value)} />
            <FilterSelect label="Longevity" value={filters.longevity} values={longevity} onChange={(value) => updateFilter("longevity", value)} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              className={cx("brand-pill", filters.brand === "all" && "brand-pill-active")}
              onClick={() => updateFilter("brand", "all")}
              type="button"
            >
              All brands
            </button>
            {featuredBrands.map(({ brand, count }) => (
              <button
                className={cx("brand-pill", filters.brand === brand && "brand-pill-active")}
                key={brand}
                onClick={() => updateFilter("brand", brand)}
                type="button"
              >
                {brand} <span>{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink/50">
            {filteredProducts.length} scents found from {brands.length} brands
          </p>
          <p className="rounded-full bg-mist px-4 py-2 text-sm text-ink/60">
            Data is seeded into a local browser database.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {visibleProducts.map((product, index) => (
            <ScentCard
              index={index}
              key={product.id}
              product={product}
              wished={wishlist.has(product.id)}
              onWishlist={onWishlist}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>

        {visibleProducts.length < filteredProducts.length && (
          <div className="mt-10 flex justify-center">
            <button
              className="rounded-full bg-ink px-7 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-ember"
              onClick={() => setVisibleCount((count) => count + 16)}
              type="button"
            >
              Load more scents
            </button>
          </div>
        )}

        <section className="mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <ProfilePanel
            brands={brands}
            categories={categories}
            genders={genders}
            longevity={longevity}
            draftProfile={draftProfile}
            setDraftProfile={setDraftProfile}
            status={profileStatus}
            onSave={onProfileSave}
          />

          <RecommendationPanel selectedProduct={selectedProduct} recommendations={recommendations} />
        </section>
      </section>
    </main>
  );
}

function FilterSelect({ label, value, values, onChange }) {
  return (
    <label className="catalog-field">
      <span>{label}</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="all">All {label.toLowerCase()}</option>
        {values.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

function ScentCard({ product, wished, onWishlist, onSelectProduct, index }) {
  return (
    <article
      className="group animate-reveal overflow-hidden rounded-[1.75rem] border border-ink/5 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-soft"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <button
        className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-white via-mist to-orange-50"
        onClick={() => onSelectProduct(product)}
        type="button"
      >
        <div className="absolute inset-y-0 w-1/2 -skew-x-12 bg-white/35 opacity-0 group-hover:animate-sheen group-hover:opacity-100" />
        <span className="flex h-24 w-24 items-center justify-center rounded-full border border-ember/30 bg-white font-display text-3xl text-ember shadow-sm">
          {initials(product)}
        </span>
      </button>
      <div className="flex min-h-64 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-ember">{product.brand}</p>
        <h3 className="mt-2 text-xl font-bold leading-snug">{product.name}</h3>
        <p className="mt-2 text-sm text-ink/55">{product.type} / {product.gender}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-ember">{product.category}</span>
          <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink/55">{product.longevity}</span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-sm font-semibold text-ink/50">{product.family}</span>
          <button
            className={cx(
              "rounded-full border px-3 py-2 text-xs font-bold transition",
              wished
                ? "border-ember bg-ember text-white"
                : "border-ink/10 bg-white text-ink/60 hover:border-ember hover:text-ember"
            )}
            onClick={() => onWishlist(product.id)}
            type="button"
          >
            <Heart className="mr-1 inline h-4 w-4" fill={wished ? "currentColor" : "none"} />
            Save
          </button>
        </div>
      </div>
    </article>
  );
}

function ProfilePanel({ brands, categories, genders, longevity, draftProfile, setDraftProfile, status, onSave }) {
  const update = (key, value) => {
    setDraftProfile((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-ink p-3 text-white">
          <UserRound className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display text-3xl">Your Scent Profile</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">
            Save preference hints for scent type, brand, audience, and longevity.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FilterSelect label="Brand" value={draftProfile.brand || "all"} values={brands} onChange={(value) => update("brand", value)} />
        <FilterSelect label="Category" value={draftProfile.category || "all"} values={categories} onChange={(value) => update("category", value)} />
        <FilterSelect label="Audience" value={draftProfile.gender || "all"} values={genders} onChange={(value) => update("gender", value)} />
        <FilterSelect label="Longevity" value={draftProfile.longevity || "all"} values={longevity} onChange={(value) => update("longevity", value)} />
      </div>

      <button
        className="mt-6 rounded-full bg-ember px-6 py-3 font-bold text-white shadow-glow transition hover:-translate-y-1 hover:bg-ink"
        onClick={() => onSave(draftProfile)}
        type="button"
      >
        Save profile
      </button>
      <p className="mt-4 text-sm text-ink/55">{status}</p>
    </div>
  );
}

function RecommendationPanel({ selectedProduct, recommendations }) {
  return (
    <div className="rounded-[2rem] bg-ink p-6 text-white shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-ember">Recommendations</p>
      <h2 className="mt-3 font-display text-3xl">
        {selectedProduct ? `Similar to ${selectedProduct.name}` : "Recommended for your profile"}
      </h2>
      <div className="mt-6 grid gap-3">
        {recommendations.map((product) => (
          <div className="flex items-center gap-4 rounded-2xl bg-white/8 p-4 backdrop-blur" key={product.id}>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-ember">
              {initials(product)}
            </span>
            <div>
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm text-white/60">{product.brand} / {product.category}</p>
            </div>
            <Star className="ml-auto h-5 w-5 text-ember" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Community() {
  return (
    <section id="community" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-ember">Community</p>
          <h2 className="mt-4 font-display text-5xl">A home for scent notes and discoveries.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {["Scent journals", "Wishlist sharing", "Brand follows", "Personal picks"].map((item) => (
            <div className="rounded-3xl bg-mist p-6" key={item}>
              <Leaf className="mb-5 h-6 w-6 text-moss" />
              <h3 className="text-xl font-bold">{item}</h3>
              <p className="mt-3 text-ink/60">Ready for your future auth and profile backend.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="bg-cream px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.28em] text-ember">About Elixir Grove</p>
        <h2 className="mt-4 font-display text-5xl">A practice e-commerce project with room to grow.</h2>
        <p className="mt-6 text-lg leading-8 text-ink/62">
          The project now has a real React surface, Tailwind styling, client-side persistence,
          and a cleaner path toward a future backend when you are ready.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-3xl">Elixir Grove</p>
          <p className="mt-2 text-white/50">A practice project of Charles Edward Noleal.</p>
        </div>
        <a className="text-white/70 transition hover:text-ember" href="mailto:charlesecnoleal@gmail.com">
          charlesecnoleal@gmail.com
        </a>
      </div>
    </footer>
  );
}

export default App;
