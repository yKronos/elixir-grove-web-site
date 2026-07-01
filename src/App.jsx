import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  HeartCrack,
  Leaf,
  Languages,
  Lock,
  LogOut,
  Maximize2,
  Meh,
  Menu,
  Moon,
  Search,
  Sun,
  Star,
  ThumbsDown,
  ThumbsUp,
  UserRound,
  X
} from "lucide-react";
import {
  catalogProducts,
  loadCatalog,
  scoreByProfile,
  topBrands,
  uniqueValues
} from "./lib/catalog.js";
import {
  castScentVote,
  getScentVotes,
  initializeStore,
  loginAccount,
  logoutAccount,
  registerAccount,
  saveProfile,
  searchProducts,
  toggleWishlist
} from "./lib/store.js";

const navItems = [
  { id: "home", label: "Home" },
  { id: "scents", label: "Scents ˯" },
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

function familyChipClass(family = "") {
  const value = family.toLowerCase();
  if (/wood|oud|earth|leather|chypre/.test(value)) return "bg-moss/10 text-moss dark:bg-moss/25 dark:text-[#b8c5b1]";
  if (/floral|rose|flower/.test(value)) return "bg-rose-50 text-rose-700 dark:bg-rose-950/35 dark:text-rose-300";
  if (/citrus|fresh|aquatic|green/.test(value)) return "bg-amber-50 text-ember dark:bg-ember/10";
  return "bg-mist text-ink/55 dark:bg-white/10 dark:text-white/60";
}

function App() {
  const [route, setRoute] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [db, setDb] = useState(null);
  const [products, setProducts] = useState(catalogProducts);
  const [wishlist, setWishlist] = useState(new Set());
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState(null);
  const [filters, setFilters] = useState({
    query: "",
    brand: "all",
    category: "all",
    gender: "all",
    longevity: "all"
  });
  const [visibleCount, setVisibleCount] = useState(16);
  const [profileStatus, setProfileStatus] = useState("Your preferences are saved to this account.");
  const [accountNotice, setAccountNotice] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currency, setCurrency] = useState(() => localStorage.getItem("elixir-currency") || "PHP");
  const [language, setLanguage] = useState(() => localStorage.getItem("elixir-language") || "en");
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("elixir-theme") === "dark" ||
    (!localStorage.getItem("elixir-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );

  useEffect(() => {
    let mounted = true;

    loadCatalog()
      .then(({ products: importedProducts }) => initializeStore(importedProducts))
      .then((state) => {
        if (!mounted) return;
        setDb(state.db);
        setProducts(state.products);
        setWishlist(state.wishlist);
        setAccount(state.account);
        setProfile(state.profile);
      })
      .catch(() => {
        if (!mounted) return;
        setProducts(catalogProducts);
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
        score: scoreByProfile(profile, product)
      }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
      .slice(0, 4)
      .map((entry) => entry.product);

    return scored.length ? scored : products.slice(0, 4);
  }, [products, profile]);

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

  const showAccount = (notice = "") => {
    setRoute("account");
    setAccountNotice(notice);
    setMenuOpen(false);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
  };

  const updateFilter = (key, value) => {
    setVisibleCount(16);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const handleWishlist = async (productId) => {
    if (!account) {
      showAccount("Join us to unlock wishlists, your scent profile, and personal recommendations!");
      return;
    }
    if (!db) return;
    const wished = await toggleWishlist(db, account.id, productId);
    setWishlist((current) => {
      const next = new Set(current);
      if (wished) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const handleProfileSave = async (preferences) => {
    if (!db || !profile || !account) return;
    const nextProfile = await saveProfile(db, {
      ...profile,
      preferences
    });
    setProfile(nextProfile);
    setProfileStatus("Preferences saved. Recommendations refreshed.");
  };

  const handleAuth = async (mode, values) => {
    if (!db) throw new Error("The account database is still loading. Please try again.");
    const state = mode === "register"
      ? await registerAccount(db, values)
      : await loginAccount(db, values);
    setAccount(state.account);
    setProfile(state.profile);
    setWishlist(state.wishlist);
    setAccountNotice("");
  };

  const handleLogout = () => {
    logoutAccount();
    setAccount(null);
    setProfile(null);
    setWishlist(new Set());
    setAccountNotice("You have been signed out.");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-cream font-body text-ink transition-colors dark:bg-charcoal dark:text-stone-100">
      <Navigation
        route={route}
        setRoute={setRoute}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        brands={featuredBrands}
        wishlistCount={wishlist.size}
        account={account}
        showScents={showScents}
        onSearch={handleSearch}
        onAccount={showAccount}
        currency={currency}
        setCurrency={setCurrency}
        language={language}
        setLanguage={setLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {route === "account" ? (
        <>
          <AccountPage
            account={account}
            notice={accountNotice}
            onAuth={handleAuth}
            onLogout={handleLogout}
            profile={profile}
            profileStatus={profileStatus}
            onProfileSave={handleProfileSave}
            brands={brands}
            categories={categories}
            genders={genders}
            longevity={longevity}
            recommendations={recommendations}
            wishlistProducts={products.filter((product) => wishlist.has(product.id))}
            onWishlist={handleWishlist}
            currency={currency}
          />
          <Footer />
        </>
      ) : route === "scents" ? (
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
          onSelect={setSelectedProduct}
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
      {selectedProduct && (
        <ScentProfileModal
          account={account}
          db={db}
          onClose={() => setSelectedProduct(null)}
          onRequireLogin={() => {
            setSelectedProduct(null);
            showAccount("Log in or create an account before voting on a scent.");
          }}
          product={selectedProduct}
        />
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
  account,
  showScents,
  onSearch,
  onAccount,
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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gold/25 bg-cream/90 backdrop-blur-xl transition-colors dark:border-gold/15 dark:bg-charcoal/90">
      <div className="mx-auto flex h-20 max-w-[90rem] items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <button
          className="group flex items-center gap-3"
          onClick={() => navAction("home")}
          type="button"
        >
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 hidden rounded-full bg-gradient-to-br from-gold/35 via-ember/20 to-moss/25 blur-sm dark:block" />
            <span className="absolute inset-1 hidden rounded-full bg-cream/95 ring-1 ring-gold/25 dark:block" />
            <img className="relative h-12 w-12 rounded-full" src="/elixirgrove-logo.png" alt="Elixir Grove" />
          </span>
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
                {item.id === "scents" && <ChevronDown className="ml-1 inline h-4 w-4" aria-hidden="true" />}
              </button>

              {item.id === "scents" && (
                <div className="pointer-events-none absolute left-1/2 top-full w-[520px] -translate-x-1/2 pt-5 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                  <div className="rounded-3xl border border-white/70 bg-white/95 p-5 shadow-soft dark:border-white/10 dark:bg-charcoalPanel/95">
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-ink/45">
                    Available brands
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {brands.slice(0, 15).map(({ brand, count }) => (
                      <button
                        className="rounded-2xl bg-mist px-3 py-2 text-left text-sm transition hover:bg-ember hover:text-white dark:bg-charcoalPanel/80"
                        key={brand}
                        onClick={() => showScents({ brand })}
                        type="button"
                      >
                        {brand} <span className="text-xs opacity-60">({count})</span>
                      </button>
                    ))}
                  </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <form className="relative hidden xl:block" onSubmit={submitSearch}>
            <input aria-label={text.search} className="h-10 w-52 rounded-full border border-ink/10 bg-white/75 pl-4 pr-10 text-sm outline-none transition focus:w-64 focus:border-ember dark:border-white/15 dark:bg-charcoalPanel" onChange={(event) => setSearchQuery(event.target.value)} placeholder={text.search} value={searchQuery} />
            <button aria-label="Submit search" className="absolute right-1 top-1 rounded-full p-2 text-ink/55 hover:text-ember dark:text-white/65" type="submit"><Search className="h-4 w-4" /></button>
          </form>
          <select aria-label="Currency" className="hidden h-10 rounded-full border border-ink/10 bg-white px-3 text-xs font-bold outline-none xl:block dark:border-white/15 dark:bg-charcoalPanel" onChange={(event) => setCurrency(event.target.value)} value={currency}>
            <option value="PHP">PHP</option><option value="USD">USD</option><option value="EUR">EUR</option>
          </select>
          <button aria-label={language === "en" ? "Switch to Filipino" : "Switch to English"} className="hidden h-10 items-center gap-1 rounded-full border border-ink/10 bg-white px-3 text-xs font-bold xl:flex dark:border-white/15 dark:bg-charcoalPanel" onClick={() => setLanguage((current) => current === "en" ? "fil" : "en")} type="button"><Languages className="h-4 w-4" />{language.toUpperCase()}</button>
          <button aria-label={darkMode ? "Use light mode" : "Use dark mode"} className="hidden rounded-full border border-ink/10 bg-white p-2.5 transition hover:text-ember sm:block dark:border-white/15 dark:bg-charcoalPanel" onClick={() => setDarkMode((current) => !current)} type="button">{darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <button aria-label={account ? `Account: ${account.name}` : "Log in or register"} className="hidden rounded-full border border-ink/10 bg-white p-2.5 transition hover:text-ember sm:block dark:border-white/15 dark:bg-charcoalPanel" onClick={() => onAccount()} type="button"><UserRound className="h-4 w-4" /></button>
          <button
            aria-label={`${text.wishlist}: ${wishlistCount}`}
            className="hidden rounded-full border border-ink/10 bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:border-ember hover:text-ember md:flex dark:border-white/15 dark:bg-charcoalPanel"
            onClick={() => onAccount(account ? "" : "Join us to unlock your wishlist!")}
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
        <div className="border-t border-white/60 bg-cream px-4 py-5 lg:hidden dark:border-white/10 dark:bg-charcoal">
          <div className="grid gap-3">
            <form className="relative" onSubmit={submitSearch}>
              <input aria-label={text.search} className="h-12 w-full rounded-2xl border border-ink/10 bg-white px-4 pr-12 outline-none dark:border-white/15 dark:bg-charcoalPanel" onChange={(event) => setSearchQuery(event.target.value)} placeholder={text.search} value={searchQuery} />
              <button aria-label="Submit search" className="absolute right-2 top-2 rounded-xl p-2" type="submit"><Search /></button>
            </form>
            {navItems.map((item) => (
              <button
                className="rounded-2xl bg-white px-4 py-3 text-left font-semibold shadow-sm dark:bg-charcoalPanel"
                key={item.id}
                onClick={() => navAction(item.id)}
                type="button"
              >
                {text[item.id]}{item.id === "scents" && <ChevronDown className="ml-2 inline h-4 w-4" />}
              </button>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <select aria-label="Currency" className="rounded-2xl bg-white px-4 py-3 dark:bg-charcoalPanel" onChange={(event) => setCurrency(event.target.value)} value={currency}><option value="PHP">PHP</option><option value="USD">USD</option><option value="EUR">EUR</option></select>
              <button className="rounded-2xl bg-white px-4 py-3 text-left dark:bg-charcoalPanel" onClick={() => setLanguage((current) => current === "en" ? "fil" : "en")} type="button"><Languages className="mr-2 inline h-4 w-4" />{language.toUpperCase()}</button>
              <button className="rounded-2xl bg-white px-4 py-3 text-left dark:bg-charcoalPanel" onClick={() => setDarkMode((current) => !current)} type="button">{darkMode ? <Sun className="mr-2 inline h-4 w-4" /> : <Moon className="mr-2 inline h-4 w-4" />}Theme</button>
              <button className="rounded-2xl bg-white px-4 py-3 text-left dark:bg-charcoalPanel" onClick={() => onAccount()} type="button"><UserRound className="mr-2 inline h-4 w-4" />{account ? "My account" : "Log in / Sign up"}</button>
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
            <h1 className="mt-4 animate-reveal font-display text-5xl leading-tight tracking-tight sm:text-6xl lg:text-7xl">{heroSlides[activeSlide].name}</h1>
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

      <section id="scents-preview" className="flex min-h-screen flex-col justify-center overflow-hidden bg-cream py-16 transition-colors dark:bg-charcoal">
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
              <button className="group w-64 shrink-0 bg-white p-4 text-left shadow-sm transition hover:-translate-y-2 hover:shadow-soft dark:bg-charcoalPanel" key={`${product.id}-${index}`} onClick={() => showScents({ brand: product.brand })} type="button">
                <div className="flex h-40 items-center justify-center bg-mist dark:bg-charcoalPanel/80">
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
    onSelect,
    currency
  } = props;

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <main className="bg-cream pt-20 transition-colors dark:bg-charcoal">
      <section className="relative overflow-hidden bg-ink px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-30">
          <img className="h-full w-full object-cover" src="/images/banner/mutiny.jpg" alt="Perfume bottles" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/55" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.32em] text-ember">Scents</p>
          <h1 className="mt-4 max-w-4xl font-display text-6xl leading-tight tracking-tight">Discover your next signature scent.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
            Browse {brands.length} fragrance houses across {categories.length} scent families, then save the ones that speak to you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/70 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-charcoalPanel">
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
          <p className="rounded-full bg-mist px-4 py-2 text-sm text-ink/60 dark:bg-charcoalPanel dark:text-white/60">
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
              onSelect={onSelect}
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

function ProductVisual({ product, compact = false }) {
  if (product.imageUrl) {
    return <img className={cx("object-contain", compact ? "h-12 w-12 rounded-full bg-white p-1" : "h-full w-full p-4")} src={product.imageUrl} alt={`${product.brand} ${product.name}`} />;
  }
  return (
    <span className={cx(
      "flex items-center justify-center rounded-full border border-ember/30 bg-white font-display text-ember shadow-sm",
      compact ? "h-12 w-12 text-sm" : "h-24 w-24 text-3xl"
    )}>
      {initials(product)}
    </span>
  );
}

function ScentCard({ product, wished, onWishlist, onSelect, index, currency }) {
  return (
    <article
      className={cx(
        "group animate-reveal overflow-hidden rounded-[1.75rem] border border-ink/5 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-soft dark:border-white/10 dark:bg-charcoalPanel",
        onSelect && "cursor-pointer focus-within:ring-4 focus-within:ring-ember/20"
      )}
      onClick={() => onSelect?.(product)}
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      <button
        aria-label={`Open ${product.brand} ${product.name} scent profile`}
        className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-white via-mist to-orange-50 dark:from-charcoalPanel dark:via-charcoalPanel dark:to-ember/5"
        disabled={!onSelect}
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.(product);
        }}
        type="button"
      >
        <div className="absolute inset-y-0 w-1/2 -skew-x-12 bg-white/35 opacity-0 group-hover:animate-sheen group-hover:opacity-100" />
        <ProductVisual product={product} />
      </button>
      <div className="flex min-h-64 flex-col p-5">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-ember">{product.brand}</p>
        <h3 className="mt-2 text-xl font-bold leading-snug">{product.name}</h3>
        <p className="mt-2 text-sm text-ink/55 dark:text-white/55">{product.type} / {product.gender}</p>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-ink/40 dark:text-white/40">Price unavailable · {currency}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-ember">{product.category}</span>
          <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-ink/55">{product.longevity}</span>
          {product.family && <span className={cx("rounded-full px-3 py-1 text-xs font-semibold", familyChipClass(product.family))}>{product.family}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-sm font-semibold text-ink/50">{product.family}</span>
          <button
            className={cx(
              "rounded-full border px-3 py-2 text-xs font-bold transition",
              wished
                ? "border-ember bg-ember text-white"
                : "border-ink/10 bg-white text-ink/60 hover:border-ember hover:text-ember dark:border-white/15 dark:bg-charcoalPanel dark:text-white/60"
            )}
            onClick={(event) => {
              event.stopPropagation();
              onWishlist(product.id);
            }}
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

const voteOptions = [
  { id: "love", label: "Love", Icon: Heart },
  { id: "like", label: "Like", Icon: ThumbsUp },
  { id: "ok", label: "OK", Icon: Meh },
  { id: "dislike", label: "Dislike", Icon: ThumbsDown },
  { id: "hate", label: "Hate", Icon: HeartCrack }
];

function profileHash(value) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) % 997, 17);
}

function buildScentProfile(product) {
  const text = `${product.category} ${product.family} ${(product.accords || []).join(" ")}`.toLowerCase();
  const warm = /amber|oriental|oud|wood|spic|gourmand|vanilla|leather|tobacco/.test(text);
  const fresh = /fresh|citrus|aquatic|green|aromatic|fruity/.test(text);
  const floral = /floral|flower|rose/.test(text);
  const score = (key, fallback) => Math.max(28, Math.min(96, fallback + (profileHash(`${product.id}-${key}`) % 15) - 7));
  const wear = [
    { label: "Day", value: score("day", fresh || floral ? 82 : 60) },
    { label: "Night", value: score("night", warm ? 88 : 58) },
    { label: "Spring", value: score("spring", fresh || floral ? 86 : 55) },
    { label: "Summer", value: score("summer", fresh ? 90 : 46) },
    { label: "Autumn", value: score("autumn", warm ? 88 : 62) },
    { label: "Winter", value: score("winter", warm ? 92 : 48) }
  ];
  const accordLabels = [...new Set(product.accords?.length
    ? product.accords
    : [product.category, product.family, product.type, product.longevity])]
    .filter(Boolean)
    .slice(0, 4);
  const accords = accordLabels.map((label, index) => ({
    label,
    value: Math.max(42, 94 - index * 13 - (profileHash(`${product.id}-${label}`) % 8))
  }));
  return {
    accords,
    wear,
    genderPosition: product.gender === "Men" ? 18 : product.gender === "Women" ? 82 : 50
  };
}

function ScentProfileModal({ product, account, db, onClose, onRequireLogin }) {
  const [activeImage, setActiveImage] = useState(0);
  const [voteState, setVoteState] = useState({
    totals: { love: 0, like: 0, ok: 0, dislike: 0, hate: 0 },
    viewerVote: null
  });
  const [voting, setVoting] = useState(false);
  const profile = useMemo(() => buildScentProfile(product), [product]);
  const images = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length) return product.images;
    return product.imageUrl ? [product.imageUrl] : [];
  }, [product]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  useEffect(() => {
    let current = true;
    if (!db) return () => { current = false; };
    getScentVotes(db, product.id, account?.id).then((next) => {
      if (current) setVoteState(next);
    });
    return () => { current = false; };
  }, [account?.id, db, product.id]);

  const submitVote = async (vote) => {
    if (!account) {
      onRequireLogin();
      return;
    }
    if (!db || voting) return;
    setVoting(true);
    try {
      setVoteState(await castScentVote(db, account.id, product.id, vote));
    } finally {
      setVoting(false);
    }
  };

  const moveImage = (direction) => {
    if (images.length < 2) return;
    setActiveImage((current) => (current + direction + images.length) % images.length);
  };

  return (
    <div
      aria-label={`${product.name} scent profile`}
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/75 p-3 backdrop-blur-md sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <div className="relative grid max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] border border-white/60 bg-cream shadow-2xl dark:border-white/10 dark:bg-charcoal lg:grid-cols-[0.82fr_1.18fr]">
        <div className="relative flex min-h-[25rem] flex-col bg-gradient-to-br from-white via-mist to-orange-100 p-5 dark:from-charcoalPanel dark:via-charcoalPanel dark:to-charcoal sm:p-7 lg:min-h-[42rem]">
          <div className="flex flex-1 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/55 dark:border-white/10 dark:bg-white/5">
            {images.length ? (
              <img className="h-full max-h-[32rem] w-full object-contain p-8" src={images[activeImage]} alt={`${product.brand} ${product.name}, view ${activeImage + 1}`} />
            ) : (
              <div className="flex flex-col items-center gap-5 text-center">
                <ProductVisual product={product} />
                <p className="max-w-xs text-xs font-semibold uppercase tracking-[0.2em] text-ink/40 dark:text-white/40">Product image coming soon</p>
              </div>
            )}
          </div>

          <button aria-label="Previous image" className="absolute left-7 top-[42%] rounded-full border border-ink/10 bg-white/90 p-3 shadow-lg transition enabled:hover:-translate-x-1 enabled:hover:text-ember disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/10 dark:bg-charcoalPanel" disabled={images.length < 2} onClick={() => moveImage(-1)} type="button"><ChevronLeft className="h-5 w-5" /></button>
          <button aria-label="Next image" className="absolute right-7 top-[42%] rounded-full border border-ink/10 bg-white/90 p-3 shadow-lg transition enabled:hover:translate-x-1 enabled:hover:text-ember disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/10 dark:bg-charcoalPanel" disabled={images.length < 2} onClick={() => moveImage(1)} type="button"><ChevronRight className="h-5 w-5" /></button>

          <div className="mt-5 flex min-h-2 justify-center gap-2" aria-label={`${Math.max(images.length, 1)} image available`}>
            {Array.from({ length: Math.max(images.length, 1) }, (_, index) => (
              <button aria-label={`Show image ${index + 1}`} className={cx("h-2 rounded-full transition-all", activeImage === index ? "w-8 bg-ember" : "w-2 bg-ink/20 dark:bg-white/25")} disabled={!images.length} key={index} onClick={() => setActiveImage(index)} type="button" />
            ))}
          </div>

          <div className="mt-5 border-t border-ink/10 pt-5 dark:border-white/10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45 dark:text-white/45">Rate this scent</p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {voteOptions.map(({ id, label, Icon }) => {
                const selected = voteState.viewerVote === id;
                return (
                  <button aria-label={`${label}, ${voteState.totals[id]} votes`} className={cx("group/vote rounded-2xl border px-1 py-3 text-center transition disabled:cursor-wait", selected ? "border-ember bg-ember text-white" : "border-ink/10 bg-white/70 hover:border-ember hover:text-ember dark:border-white/10 dark:bg-white/5")} disabled={voting} key={id} onClick={() => submitVote(id)} type="button">
                    <Icon className="mx-auto h-5 w-5" fill={id === "love" && selected ? "currentColor" : "none"} />
                    <span className="mt-1 block text-[10px] font-bold sm:text-xs">{label}</span>
                    <span className={cx("mt-1 block text-xs", selected ? "text-white/75" : "text-ink/40 dark:text-white/40")}>{voteState.totals[id]}</span>
                  </button>
                );
              })}
            </div>
            {!account && <button className="mt-3 flex items-center gap-2 text-xs font-bold text-ember hover:underline" onClick={onRequireLogin} type="button"><Lock className="h-3.5 w-3.5" />Log in to vote</button>}
          </div>
        </div>

        <div className="relative p-6 sm:p-9 lg:p-12">
          <div className="absolute right-5 top-5 flex gap-2">
            <button aria-label="Full scent profile coming soon" className="rounded-full border border-ink/10 bg-white p-2.5 text-ink/35 dark:border-white/10 dark:bg-charcoalPanel dark:text-white/35" disabled title="Full-page scent profiles are coming soon" type="button"><Maximize2 className="h-5 w-5" /></button>
            <button aria-label="Close scent profile" className="rounded-full bg-ink p-2.5 text-white transition hover:rotate-90 hover:bg-ember dark:bg-white dark:text-ink" onClick={onClose} type="button"><X className="h-5 w-5" /></button>
          </div>

          <p className="pr-24 text-xs font-bold uppercase tracking-[0.28em] text-ember">{product.brand}</p>
          <h2 className="mt-3 pr-20 font-display text-4xl leading-tight sm:text-5xl">{product.name}</h2>
          <p className="mt-3 text-sm font-semibold text-ink/50 dark:text-white/50">
            {[product.gender, product.year, product.country].filter(Boolean).join(" · ")}
          </p>
          {product.ratingValue && (
            <p className="mt-3 flex items-center gap-2 text-sm font-bold text-ember">
              <Star className="h-4 w-4" fill="currentColor" />
              {product.ratingValue.toFixed(2)} <span className="font-medium text-ink/40 dark:text-white/40">from {product.ratingCount.toLocaleString()} ratings</span>
            </p>
          )}
          {product.description && <p className="mt-5 line-clamp-4 text-sm leading-6 text-ink/60 dark:text-white/60">{product.description}</p>}

          <section className="mt-9">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45 dark:text-white/45">Main accords</p>
            <div className="mt-4 space-y-3">
              {profile.accords.map((accord) => (
                <div key={accord.label}>
                  <div className="mb-1.5 flex justify-between text-xs font-semibold"><span>{accord.label}</span><span className="text-ink/35 dark:text-white/35">{accord.value}%</span></div>
                  <div className="h-2 rounded-full bg-ink/8 dark:bg-white/10"><div className="accord-fill bg-gradient-to-r from-ember to-orange-300 text-orange-300" style={{ width: `${accord.value}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          {product.notes && (product.notes.top.length || product.notes.middle.length || product.notes.base.length) ? (
            <section className="mt-9">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45 dark:text-white/45">Fragrance notes</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[{ label: "Top", notes: product.notes.top }, { label: "Heart", notes: product.notes.middle }, { label: "Base", notes: product.notes.base }].map((group) => (
                  <div className="rounded-2xl border border-ink/8 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5" key={group.label}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ember">{group.label}</p>
                    <p className="mt-2 text-xs leading-5 text-ink/60 dark:text-white/60">{group.notes.length ? group.notes.join(", ") : "Not listed"}</p>
                  </div>
                ))}
              </div>
              {product.perfumers?.length > 0 && <p className="mt-3 text-xs text-ink/45 dark:text-white/45">Created by {product.perfumers.join(" and ")}</p>}
            </section>
          ) : null}

          <section className="mt-9">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink/45 dark:text-white/45">Best time to wear</p>
            <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {profile.wear.map((item) => (
                <div className="grid grid-cols-[4.5rem_1fr] items-center gap-3" key={item.label}>
                  <span className="rounded-lg border border-ink/10 bg-white px-2 py-1.5 text-center text-[11px] font-bold uppercase tracking-wide dark:border-white/10 dark:bg-charcoalPanel">{item.label}</span>
                  <div className="h-2 rounded-full bg-ink/8 dark:bg-white/10"><div className="accord-fill bg-moss text-moss" style={{ width: `${item.value}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-9">
            <div className="flex justify-between text-xs font-bold uppercase tracking-[0.18em] text-ink/45 dark:text-white/45"><span>Masculine</span><span>Feminine</span></div>
            <div className="relative mt-4 h-2 rounded-full bg-gradient-to-r from-slate-500 via-amber-100 to-rose-400">
              <span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-ink shadow-md dark:border-charcoal dark:bg-white" style={{ left: `${profile.genderPosition}%` }} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AccountPage({
  account,
  notice,
  onAuth,
  onLogout,
  profile,
  profileStatus,
  onProfileSave,
  brands,
  categories,
  genders,
  longevity,
  recommendations,
  wishlistProducts,
  onWishlist,
  currency
}) {
  const [draftProfile, setDraftProfile] = useState(profile?.preferences || {});

  useEffect(() => {
    setDraftProfile(profile?.preferences || {});
  }, [profile]);

  if (!account) {
    return (
      <main className="min-h-screen bg-cream px-4 pb-20 pt-32 dark:bg-charcoal sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2.5rem] bg-white shadow-soft dark:bg-charcoalPanel lg:grid-cols-[0.9fr_1.1fr]">
          <section className="bg-ink p-8 text-white sm:p-12">
            <span className="inline-flex rounded-2xl bg-white/10 p-3"><Lock className="h-6 w-6 text-ember" /></span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-ember">Members only</p>
            <h1 className="mt-4 font-display text-5xl leading-tight">Join us to unlock more amazing features!</h1>
            <p className="mt-5 leading-8 text-white/65">Create an account or log in to save perfumes, shape your scent profile, and receive recommendations made for you.</p>
            <div className="mt-10 grid gap-3">
              {["A wishlist that follows your account", "Your private scent preferences", "Personal fragrance recommendations"].map((feature) => (
                <div className="flex items-center gap-3 rounded-2xl bg-white/8 p-4" key={feature}>
                  <Lock className="h-4 w-4 text-ember" />
                  <span className="text-sm font-semibold">{feature}</span>
                </div>
              ))}
            </div>
          </section>
          <AuthPanel notice={notice} onAuth={onAuth} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pt-20 dark:bg-charcoal">
      <section className="bg-ink px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-ember">My account</p>
            <h1 className="mt-3 font-display text-5xl">Welcome, {account.name}.</h1>
            <p className="mt-3 text-white/55">{account.email}</p>
          </div>
          <button className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold transition hover:border-ember hover:text-ember" onClick={onLogout} type="button">
            <LogOut className="mr-2 inline h-4 w-4" />Sign out
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
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
          <RecommendationPanel recommendations={recommendations} />
        </div>

        <section className="mt-14">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-ember">Saved for later</p>
          <h2 className="mt-3 font-display text-4xl">Your wishlist</h2>
          {wishlistProducts.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {wishlistProducts.map((product, index) => (
                <ScentCard key={product.id} product={product} wished onWishlist={onWishlist} index={index} currency={currency} />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-[2rem] border border-dashed border-ink/15 bg-white p-10 text-center dark:border-white/15 dark:bg-charcoalPanel">
              <Heart className="mx-auto h-7 w-7 text-ember" />
              <p className="mt-4 font-semibold">Your wishlist is waiting for its first scent.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function AuthPanel({ notice, onAuth }) {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    const values = Object.fromEntries(data.entries());
    try {
      await onAuth(mode, values);
    } catch (caught) {
      setError(caught.message || "We could not complete that request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="p-8 sm:p-12">
      <div className="flex rounded-full bg-mist p-1 dark:bg-charcoalPanel/80">
        {[{ id: "login", label: "Log in" }, { id: "register", label: "Create account" }].map((option) => (
          <button className={cx("flex-1 rounded-full px-4 py-3 text-sm font-bold transition", mode === option.id && "bg-white text-ember shadow-sm dark:bg-charcoal")} key={option.id} onClick={() => { setMode(option.id); setError(""); }} type="button">{option.label}</button>
        ))}
      </div>
      <h2 className="mt-8 font-display text-4xl">{mode === "login" ? "Good to see you again." : "Make the grove yours."}</h2>
      {notice && <p className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm font-semibold text-ember dark:bg-ember/10">{notice}</p>}
      {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">{error}</p>}
      <form className="mt-7 grid gap-4" onSubmit={submit}>
        {mode === "register" && <AuthField label="Name" name="name" type="text" autoComplete="name" />}
        <AuthField label="Email address" name="email" type="email" autoComplete="email" />
        <AuthField label="Password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} />
        <button className="mt-2 rounded-full bg-ember px-6 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-ink disabled:cursor-wait disabled:opacity-60" disabled={submitting} type="submit">
          {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create my account"}
        </button>
      </form>
      <p className="mt-5 text-xs leading-5 text-ink/45 dark:text-white/45">This version stores account data securely in this browser. Use a server-backed authentication service before deploying accounts across devices.</p>
    </section>
  );
}

function AuthField({ label, ...inputProps }) {
  return (
    <label className="catalog-field">
      <span>{label}</span>
      <input required {...inputProps} />
    </label>
  );
}

function ProfilePanel({ brands, categories, genders, longevity, draftProfile, setDraftProfile, status, onSave }) {
  const update = (key, value) => {
    setDraftProfile((current) => ({ ...current, [key]: value }));
  };

  return (
    <div id="profile-panel" className="scroll-mt-24 rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-charcoalPanel">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-ink p-3 text-white ring-2 ring-gold/30">
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

function RecommendationPanel({ recommendations }) {
  return (
    <div className="rounded-[2rem] bg-ink p-6 text-white shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-ember">Recommendations</p>
      <h2 className="mt-3 font-display text-3xl">Recommended for your profile</h2>
      <div className="mt-6 grid gap-3">
        {recommendations.map((product) => (
          <div className="flex items-center gap-4 rounded-2xl bg-white/8 p-4 backdrop-blur" key={product.id}>
            <ProductVisual product={product} compact />
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
    <section id="community" className="flex min-h-screen items-center bg-white px-4 py-24 transition-colors sm:px-6 lg:px-8 dark:bg-charcoalPanel">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="max-w-xl">
          <p className="eyebrow-moss">Community</p>
          <h2 className="mt-4 font-display text-5xl leading-tight sm:text-6xl">Fragrance is better when it is shared.</h2>
          <p className="mt-6 leading-8 text-ink/60 dark:text-white/60">A gathering place for personal stories, thoughtful recommendations and the scents that become part of our lives.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {["Scent stories", "Shared collections", "House discoveries", "Community favourites"].map((item) => (
            <div className="rounded-3xl border-t-2 border-moss/40 bg-moss/5 p-6 transition hover:bg-moss/10 dark:bg-mossDeep/50" key={item}>
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
    <section id="about" className="flex min-h-screen flex-col bg-cream transition-colors dark:bg-charcoal">
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

const socialLinks = [
  {
    label: "Email",
    href: "mailto:charlesecnoleal@gmail.com",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    )
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/yKronos.017.341/",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 8.6V7.1c0-.7.5-1.1 1.2-1.1H17V3.1c-.9-.1-1.8-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.5v1.1H7v3.2h2.8V21h3.4v-9.2h2.8l.5-3.2H14Z" />
      </svg>
    )
  },
  {
    label: "GitHub",
    href: "https://github.com/yKronos",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.3-.3-4.7-1.2-4.7-5A3.9 3.9 0 0 1 6.6 8.8c-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1a9.6 9.6 0 0 1 5.1 0c2-1.3 2.8-1 2.8-1 .6 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1.1 2.8c0 3.9-2.4 4.7-4.7 5 .4.3.7 1 .7 2v2.9c0 .3.2.6.8.5A10 10 0 0 0 12 2Z" />
      </svg>
    )
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/imnotcharlesss/",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </svg>
    )
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@yesimnotcharles?is_from_webapp=1&sender_device=pc",
    icon: (
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.7 3c.4 2.4 1.8 3.9 4.3 4.1v3.1a7 7 0 0 1-4.2-1.3v6.3c0 3.2-2.3 5.8-5.7 5.8-3.2 0-5.8-2.1-5.8-5.2 0-3.6 3.3-6.2 7-5.4v3.3c-1.7-.5-3.6.4-3.6 2.1 0 1.3 1.1 2.1 2.4 2.1 1.5 0 2.3-1 2.3-2.5V3h3.3Z" />
      </svg>
    )
  }
];

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink px-4 py-10 text-white sm:px-6 lg:px-8">
      <img aria-hidden="true" className="pointer-events-none absolute -bottom-40 left-1/2 w-[36rem] -translate-x-1/2 opacity-[0.05] invert" src="/elixirgrove-logo.png" />
      <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-3xl">Elixir Grove</p>
          <p className="mt-2 text-white/50">Find the fragrance that feels unmistakably yours.</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Created 2024</p>
        </div>
        <div className="flex items-center gap-3">
          {socialLinks.map((link) => (
            <a
              aria-label={link.label}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:-translate-y-1 hover:border-gold/50 hover:bg-gold/10 hover:text-gold"
              href={link.href}
              key={link.label}
              rel="noreferrer"
              target="_blank"
              title={link.label}
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default App;
