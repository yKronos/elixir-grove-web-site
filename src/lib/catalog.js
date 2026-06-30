let catalogPromise;

export const catalogProducts = [];

export async function loadCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch("/data/fragrances.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Catalog request failed with ${response.status}.`);
        return response.json();
      })
      .then((payload) => ({
        source: payload.source || {},
        products: payload.products || []
      }));
  }
  return catalogPromise;
}

export function uniqueValues(products, key) {
  return [...new Set(products.map((product) => product[key]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function topBrands(products, limit = 18) {
  const counts = products.reduce((map, product) => {
    map[product.brand] = (map[product.brand] || 0) + 1;
    return map;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([brand, count]) => ({ brand, count }));
}

export function scoreBySimilarity(base, candidate) {
  if (!base || base.id === candidate.id) return -1;

  return (
    (base.category === candidate.category ? 5 : 0) +
    (base.brand === candidate.brand ? 4 : 0) +
    (base.gender === candidate.gender ? 2 : 0) +
    (base.family === candidate.family ? 2 : 0) +
    (base.longevity === candidate.longevity ? 1 : 0) +
    (base.type === candidate.type ? 1 : 0)
  );
}

export function scoreByProfile(profile, product) {
  const preferences = profile?.preferences || {};

  return (
    (preferences.brand === product.brand ? 4 : 0) +
    (preferences.category === product.category ? 4 : 0) +
    (preferences.gender === product.gender ? 3 : 0) +
    (preferences.longevity === product.longevity ? 2 : 0)
  );
}
