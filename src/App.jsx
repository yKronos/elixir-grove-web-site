import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Leaf,
  Languages,
  Menu,
  Moon,
  Search,
  Sun,
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
import { initializeStore, saveProfile, searchProducts, toggleWishlist } from "./lib/store.js";

const navItems = [
  { id: "home", label: "Home" },
  { id: "scents", label: "Scents" },
  { id: "community", label: "Community" },
  { id: "about", label: "About" }
];

const uiText = {
  en: {
    home: "Home",
    scents: "Scents",
    community: "Community",
    about: "About",
    search: "Search fragrances",
    profile: "Scent profile",
    wishlist: "Wishlist"
  },
  fil: {
    home: "Home",
    scents: "Mga Pabango",
    community: "Komunidad",
    about: "Tungkol",
    search: "Maghanap ng pabango",
    profile: "Scent profile",
    wishlist: "Mga Paborito"
  }
};

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
  const [currency, setCurrency] = useState(() => localStorage.getItem("elixir-currency") || "PHP");
  const [language, setLanguage] = useState(() => localStorage.getItem("elixir-language") || "en");
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("elixir-theme") === "dark" ||
    (!localStorage.getItem("elixir-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

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

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("elixir-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("elixir-currency", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("elixir-language", language);
    document.documentElement.lang = language === "fil" ? "fil" : "en";
  }, [language]);

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

  const handleSearch = async (query) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    if (db) await searchProducts(db, normalizedQuery);
    showScents({ query: normalizedQuery, brand: "all", category: "all", gender: "all", longevity: "all" });
  };

  const showProfile = () => {
    setRoute("scents");
    setMenuOpen(false);
    window.setTimeout(() => document.getElementById("profile-panel")?.scrollIntoView({ behavior: "smooth" }), 100);
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
    <div className="min-h-screen overflow-hidden bg-cream font-body text-ink transition-colors dark:bg-zinc-950 dark:text-stone-100">
      <Navigation
        route={route}
        setRoute={setRoute}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        brands={featuredBrands}
        wishlistCount={wishlist.size}
        showScents={showScents}
        onSearch={handleSearch}
        onProfile={showProfile}
        currency={currency}
        setCurrency={setCurrency}
        language={language}
        setLanguage={setLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {route === "scents" ? (
        <>
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
          currency={currency}
          />
          <Footer />
        </>
      ) : (
        <>
          <Home showScents={showScents} products={products} />
          <Community />
          <AboutWithFooter />
        </>
      )}
    </div>
  );
}

function Navigation({
  route,
  setRoute,
  menuOpen,
  setMenuOpen,
  brands,
  wishlistCount,
  showScents,
  onSearch,
  onProfile,
  currency,
  setCurrency,
  language,
  setLanguage,
  darkMode,
  setDarkMode
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const text = uiText[language];

  const submitSearch = (event) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    onSearch(searchQuery);
    setMenuOpen(false);
  };

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
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/40 bg-cream/90 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-20 max-w-[90rem] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
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

        <nav className="hidden items-center gap-10 xl:gap-14 lg:flex">
          {navItems.map((item) => (
            <div key={item.id} className="group relative">
              <button
                className={cx(
                  "text-sm font-semibold uppercase tracking-[0.22em] transition",
                  route === item.id ? "text-ember" : "text-ink/70 hover:text-ink dark:text-white/70 dark:hover:text-white"
                )}
                onClick={() => navAction(item.id)}
                type="button"
              >
                {text[item.id]}
              </button>

              {item.id === "scents" && (
                <div className="pointer-events-none absolute left-1/2 top-9 w-[520px] -translate-x-1/2 rounded-3xl border border-white/70 bg-white/95 p-5 opacity-0 shadow-soft transition duration-300 group-hover:pointer-events-auto group-hover:opacity-100 dark:border-white/10 dark:bg-zinc-900/95">
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-ink/45">
                    Available brands
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {brands.slice(0, 15).map(({ brand, count }) => (
                      <button
                        className="rounded-2xl bg-mist px-3 py-2 text-left text-sm transition hover:bg-ember hover:text-white dark:bg-zinc-800"
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

        <div className="flex items-center gap-2">
          <form className="relative hidden xl:block" onSubmit={submitSearch}>
            <input aria-label={text.search} className="h-10 w-52 rounded-full border border-ink/10 bg-white/75 pl-4 pr-10 text-sm outline-none transition focus:w-64 focus:border-ember dark:border-white/15 dark:bg-zinc-900" onChange={(event) => setSearchQuery(event.target.value)} placeholder={text.search} value={searchQuery} />
            <button aria-label="Submit search" className="absolute right-1 top-1 rounded-full p-2 text-ink/55 hover:text-ember dark:text-white/65" type="submit"><Search className="h-4 w-4" /></button>
          </form>
          <select aria-label="Currency" className="hidden h-10 rounded-full border border-ink/10 bg-white px-3 text-xs font-bold outline-none xl:block dark:border-white/15 dark:bg-zinc-900" onChange={(event) => setCurrency(event.target.value)} value={currency}>
            <option value="PHP">PHP</option><option value="USD">USD</option><option value="EUR">EUR</option>
          </select>
          <button aria-label={language === "en" ? "Switch to Filipino" : "Switch to English"} className="hidden h-10 items-center gap-1 rounded-full border border-ink/10 bg-white px-3 text-xs font-bold xl:flex dark:border-white/15 dark:bg-zinc-900" onClick={() => setLanguage((current) => current === "en" ? "fil" : "en")} type="button"><Languages className="h-4 w-4" />{language.toUpperCase()}</button>
          <button aria-label={darkMode ? "Use light mode" : "Use dark mode"} className="hidden rounded-full border border-ink/10 bg-white p-2.5 transition hover:text-ember sm:block dark:border-white/15 dark:bg-zinc-900" onClick={() => setDarkMode((current) => !current)} type="button">{darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <button aria-label={text.profile} className="hidden rounded-full border border-ink/10 bg-white p-2.5 transition hover:text-ember sm:block dark:border-white/15 dark:bg-zinc-900" onClick={onProfile} type="button"><UserRound className="h-4 w-4" /></button>
          <button
            aria-label={`${text.wishlist}: ${wishlistCount}`}
            className="hidden rounded-full border border-ink/10 bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:border-ember hover:text-ember md:flex dark:border-white/15 dark:bg-zinc-900"
            onClick={() => showScents()}
            type="button"
          >
            <Heart className="mr-2 h-4 w-4" />
            <span className="hidden 2xl:inline">{text.wishlist}&nbsp;</span>{wishlistCount}
          </button>
          <button
            className="rounded-full bg-ink p-3 text-white lg:hidden dark:bg-white dark:text-ink"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/60 bg-cream px-4 py-5 lg:hidden dark:border-white/10 dark:bg-zinc-950">
          <div className="grid gap-3">
            <form className="relative" onSubmit={submitSearch}>
              <input aria-label={text.search} className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 pr-12 outline-none dark:border-white/15 dark:bg-zinc-900" onChange={(event) => setSearchQuery(event.target.value)} placeholder={text.search} value={searchQuery} />
              <button aria-label="Submit search" className="absolute right-2 top-2 rounded-xl p-2" type="submit"><Search /></button>
            </form>
            {navItems.map((item) => (
              <button
                className="rounded-2xl bg-white px-4 py-3 text-left font-semibold shadow-sm dark:bg-zinc-900"
                key={item.id}
                onClick={() => navAction(item.id)}
                type="button"
              >
                {text[item.id]}
              </button>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <select aria-label="Currency" className="rounded-2xl bg-white px-4 py-3 dark:bg-zinc-900" onChange={(event) => setCurrency(event.target.value)} value={currency}><option value="PHP">PHP</option><option value="USD">USD</option><option value="EUR">EUR</option></select>
              <button className="rounded-2xl bg-white px-4 py-3 text-left dark:bg-zinc-900" onClick={() => setLanguage((current) => current === "en" ? "fil" : "en")} type="button"><Languages className="mr-2 inline h-4 w-4" />{language.toUpperCase()}</button>
              <button className="rounded-2xl bg-white px-4 py-3 text-left dark:bg-zinc-900" onClick={() => setDarkMode((current) => !current)} type="button">{darkMode ? <Sun className="mr-2 inline h-4 w-4" /> : <Moon className="mr-2 inline h-4 w-4" />}Theme</button>
              <button className="rounded-2xl bg-white px-4 py-3 text-left dark:bg-zinc-900" onClick={onProfile} type="button"><UserRound className="mr-2 inline h-4 w-4" />{text.profile}</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const heroSlides = [
  {
    image: "/images/banner/banner1.jpeg",
    brand: "Jean Paul Gaultier",
    name: "Le Beau Le Parfum",
    description: "A seductive trail of ginger, ambergris and sandalwood, softened by the delicious warmth of tonka bean.",
    position: "left"
  },
  {
    image: "/images/banner/mutiny.jpg",
    brand: "Maison Margiela",
    name: "Mutiny",
    description: "Tuberose, jasmine and orange blossom meet saffron, oud and vanilla in a bold and unforgettable signature.",
    position: "right"
  },
  {
    image: "/images/banner/test.jpg",
    brand: "Kilian",
    name: "Angel's Share",
    description: "A rich, luminous fragrance inspired by fine cognac, presented with the warmth and indulgence of a treasured nightcap.",
    position: "right"
  }
];

function Home({ showScents, products }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const previewProducts = products.slice(0, 10);
  const scrollingProducts = [...previewProducts, ...previewProducts];

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % heroSlides.length),
      6500
    );
    return () => window.clearInterval(timer);
  }, []);

  const moveSlide = (direction) => {
    setActiveSlide((current) => (current + direction + heroSlides.length) % heroSlides.length);
  };

  return (
    <main className="relative pt-20">
      <section id="home" className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-ink">
        {heroSlides.map((slide, index) => (
          <div className={cx("absolute inset-0 transition-opacity duration-1000", index === activeSlide ? "opacity-100" : "opacity-0")} key={slide.name}>
            <img className="h-full w-full object-cover" src={slide.image} alt={`${slide.brand} ${slide.name}`} />
            <div className={cx("absolute inset-0", slide.position === "left" ? "bg-gradient-to-r from-black/80 via-black/40 to-transparent" : "bg-gradient-to-l from-black/80 via-black/35 to-transparent")} />
          </div>
        ))}
        <div className={cx("relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-6 py-20 lg:px-8", heroSlides[activeSlide].position === "right" && "justify-end")}>
          <div className="max-w-xl text-white" key={activeSlide}>
            <p className="animate-reveal text-sm font-bold uppercase tracking-[0.32em] text-ember">{heroSlides[activeSlide].brand}</p>
            <h1 className="mt-4 animate-reveal font-display text-5xl leading-tight sm:text-6xl lg:text-7xl">{heroSlides[activeSlide].name}</h1>
            <p className="mt-6 animate-reveal text-base leading-8 text-white/80 sm:text-lg">{heroSlides[activeSlide].description}</p>
            <button className="mt-8 rounded-none border border-white px-7 py-3 text-sm font-bold uppercase tracking-[0.18em] transition hover:border-ember hover:bg-ember" onClick={() => showScents()} type="button">
              Discover the collection
            </button>
          </div>
        </div>
        <button aria-label="Previous slide" className="absolute left-5 top-1/2 rounded-full border border-white/30 bg-black/20 p-3 text-white backdrop-blur transition hover:bg-ember" onClick={() => moveSlide(-1)} type="button"><ChevronLeft /></button>
        <button aria-label="Next slide" className="absolute right-5 top-1/2 rounded-full border border-white/30 bg-black/20 p-3 text-white backdrop-blur transition hover:bg-ember" onClick={() => moveSlide(1)} type="button"><ChevronRight /></button>
        <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-3">
          {heroSlides.map((slide, index) => <button aria-label={`Show ${slide.name}`} className={cx("h-1 transition-all", index === activeSlide ? "w-12 bg-ember" : "w-7 bg-white/55")} key={slide.name} onClick={() => setActiveSlide(index)} type="button" />)}
        </div>
      </section>

      <section id="scents-preview" className="flex min-h-screen flex-col justify-center overflow-hidden bg-cream py-16 transition-colors dark:bg-zinc-950">
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-ember">The scent collection</p>
              <h2 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">Find a fragrance that stays with you.</h2>
              <p className="mt-5 max-w-xl leading-7 text-ink/60 dark:text-white/60">Explore distinctive fragrances for every mood, memory and moment—from bright daytime notes to deep evening signatures.</p>
            </div>
            <button className="group flex items-center gap-3 self-start border-b border-ink pb-2 text-sm font-bold uppercase tracking-[0.16em] md:self-auto" onClick={() => showScents()} type="button">View all scents <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
          </div>
        </div>
        <div className="mt-10 overflow-hidden">
          <div className="scent-track flex gap-5 px-3">
            {scrollingProducts.map((product, index) => (
              <button className="group w-64 shrink-0 bg-white p-4 text-left shadow-sm transition hover:-translate-y-2 hover:shadow-soft dark:bg-zinc-900" key={`${product.id}-${index}`} onClick={() => showScents({ brand: product.brand })} type="button">
                <div className="flex h-40 items-center justify-center bg-mist dark:bg-zinc-800">
                  <span className="flex h-24 w-24 items-center justify-center rounded-full border border-ember/30 bg-white font-display text-3xl text-ember">{initials(product)}</span>
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-ember">{product.brand}</p>
                <h3 className="mt-2 min-h-12 text-lg font-semibold leading-snug">{product.name}</h3>
                <p className="mt-3 text-sm text-ink/50">{product.category} · {product.gender}</p>
              </button>
            ))}
          </div>
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
    onProfileSave,
    currency
  } = props;

  const [draftProfile, setDraftProfile] = useState(profile?.preferences || {});

  useEffect(() => {
    setDraftProfile(profile?.preferences || {});
  }, [profile]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <main className="bg-cream pt-20 transition-colors dark:bg-zinc-950">
      <section className="relative overflow-hidden bg-ink px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-30">
          <img className="h-full w-full object-cover" src="/images/banner/mutiny.jpg" alt="Perfume bottles" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/55" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.32em] text-ember">Scents</p>
          <h1 className="mt-4 max-w-4xl font-display text-6xl leading-tight">Discover your next signature scent.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
            Browse {brands.length} fragrance houses across {categories.length} scent families, then save the ones that speak to you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/70 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-zinc-900">
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
          <p className="rounded-full bg-mist px-4 py-2 text-sm text-ink/60 dark:bg-zinc-900 dark:text-white/60">
            Refine the collection to find your perfect match.
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
              currency={currency}
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

function ScentCard({ product, wished, onWishlist, onSelectProduct, index, currency }) {
  return (
    <article
      className="group animate-reveal overflow-hidden rounded-[1.75rem] border border-ink/5 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-soft dark:border-white/10 dark:bg-zinc-900"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <button
        className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-white via-mist to-orange-50 dark:from-zinc-800 dark:via-zinc-800 dark:to-zinc-900"
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
        <p className="mt-2 text-sm text-ink/55 dark:text-white/55">{product.type} / {product.gender}</p>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-ink/40 dark:text-white/40">Price unavailable · {currency}</p>
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
                : "border-ink/10 bg-white text-ink/60 hover:border-ember hover:text-ember dark:border-white/15 dark:bg-zinc-900 dark:text-white/60"
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
    <div id="profile-panel" className="scroll-mt-24 rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-zinc-900">
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
    <section id="community" className="flex min-h-screen items-center bg-white px-4 py-24 transition-colors sm:px-6 lg:px-8 dark:bg-zinc-900">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-ember">Community</p>
          <h2 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">Fragrance is better when it is shared.</h2>
          <p className="mt-6 leading-8 text-ink/60 dark:text-white/60">A gathering place for personal stories, thoughtful recommendations and the scents that become part of our lives.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {["Scent stories", "Shared collections", "House discoveries", "Community favourites"].map((item) => (
            <div className="rounded-3xl bg-mist p-6 dark:bg-zinc-950" key={item}>
              <Leaf className="mb-5 h-6 w-6 text-moss" />
              <h3 className="text-xl font-bold">{item}</h3>
              <p className="mt-3 leading-7 text-ink/60 dark:text-white/60">A new way to exchange inspiration and discover what others are wearing.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutWithFooter() {
  return (
    <section id="about" className="flex min-h-screen flex-col bg-cream transition-colors dark:bg-zinc-950">
      <div className="flex flex-1 items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="overflow-hidden rounded-t-[10rem]"><img className="h-[22rem] w-full object-cover" src="/images/banner/Story_Top_Banner.jpg" alt="The story of Elixir Grove" /></div>
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-ember">About Elixir Grove</p>
            <h2 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">A quiet place for remarkable scents.</h2>
            <p className="mt-6 text-lg leading-8 text-ink/60 dark:text-white/60">Elixir Grove celebrates fragrance as something deeply personal: a memory, a mood and an invisible signature. We bring together beloved houses and intriguing discoveries to make finding your next scent feel considered and inspiring.</p>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-3xl">Elixir Grove</p>
          <p className="mt-2 text-white/50">Find the fragrance that feels unmistakably yours.</p>
        </div>
        <a className="text-white/70 transition hover:text-ember" href="mailto:charlesecnoleal@gmail.com">
          charlesecnoleal@gmail.com
        </a>
      </div>
    </footer>
  );
}

export default App;
