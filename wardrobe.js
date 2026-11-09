const wardrobe = document.querySelector('.wardrobe');
const categoryLinks = [...wardrobe.querySelectorAll('.wardrobe-category')];
const brandOptions = wardrobe.querySelector('.wardrobe-brand-options');
const collection = wardrobe.querySelector('.wardrobe-collection');
const products = [...collection.querySelectorAll('.wardrobe-card')].map(card => ({
  card,
  brand: card.querySelector('strong').textContent.trim(),
}));

function showBrands(categoryProducts) {
  const names = [...new Set(categoryProducts.map(product => product.brand))]
    .sort((a, b) => a.localeCompare(b));

  brandOptions.replaceChildren(...['', ...names].map(name => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name || 'All brands';
    button.setAttribute('aria-pressed', String(!name));
    button.addEventListener('click', () => {
      brandOptions.querySelector('[aria-pressed="true"]').setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-pressed', 'true');
      categoryProducts.forEach(({ card, brand }) => {
        card.hidden = Boolean(name && brand !== name);
      });
    });
    return button;
  }));
}

function showCategory(event) {
  const activeLink = categoryLinks.find(link => link.hash === location.hash) ?? categoryLinks[0];
  const category = activeLink.hash.slice(1);
  const label = activeLink.textContent;
  collection.setAttribute('aria-label', label);
  document.title = `${label} — Wardrobe`;

  categoryLinks.forEach(link => {
    if (link === activeLink) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  products.forEach(({ card }) => {
    card.hidden = card.dataset.category !== category;
  });
  showBrands(products.filter(({ card }) => !card.hidden));

  if (event) {
    collection.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

showCategory();
window.addEventListener('hashchange', showCategory);
