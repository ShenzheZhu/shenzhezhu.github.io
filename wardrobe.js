const wardrobe = document.querySelector('.wardrobe');
const categoryLinks = [...wardrobe.querySelectorAll('.wardrobe-category')];
const brandOptions = wardrobe.querySelector('.wardrobe-brand-options');
const collection = wardrobe.querySelector('.wardrobe-collection');
const products = [...collection.querySelectorAll('.wardrobe-card')].map(card => ({
  card,
  brand: card.querySelector('strong').textContent.trim(),
}));

const brandNames = [...new Set(products.map(product => product.brand))]
  .sort((a, b) => a.localeCompare(b));
const brandRoutes = new Map();
for (const brand of ['', ...brandNames]) {
  const link = document.createElement('a');
  link.href = brand ? `#brand/${encodeURIComponent(brand)}` : '#all-brands';
  link.textContent = brand || 'All brands';
  brandRoutes.set(link.hash, { link, brand });
  brandOptions.append(link);
}

function showCollection(event) {
  const brandRoute = brandRoutes.get(location.hash);
  const activeLink = brandRoute?.link
    ?? categoryLinks.find(link => link.hash === location.hash)
    ?? categoryLinks[0];
  const category = activeLink.hash.slice(1);
  const label = activeLink.textContent;
  collection.setAttribute('aria-label', label);
  document.title = `${label} — Wardrobe`;

  wardrobe.querySelector('[aria-current="page"]')?.removeAttribute('aria-current');
  activeLink.setAttribute('aria-current', 'page');
  products.forEach(({ card, brand }) => {
    card.hidden = brandRoute
      ? Boolean(brandRoute.brand && brand !== brandRoute.brand)
      : card.dataset.category !== category;
  });

  if (event) {
    collection.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

showCollection();
window.addEventListener('hashchange', showCollection);
