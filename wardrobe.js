const wardrobe = document.querySelector('.wardrobe');
const categoryLinks = [...wardrobe.querySelectorAll('.wardrobe-category')];
const indexLink = wardrobe.querySelector('.wardrobe-index-link');
const collection = wardrobe.querySelector('.wardrobe-collection');
const heading = collection.querySelector('h2');
const cards = collection.querySelectorAll('.wardrobe-card');

function showCategory(event) {
  const category = location.hash.slice(1);
  const activeLink = categoryLinks.find(link => link.hash === location.hash);
  const browsing = Boolean(activeLink);

  wardrobe.classList.toggle('is-browsing', browsing);
  indexLink.hidden = !browsing;
  collection.hidden = !browsing;
  heading.textContent = activeLink?.querySelector('span').textContent ?? '';
  document.title = browsing ? `${heading.textContent} — Wardrobe` : 'Wardrobe — Shenzhe Zhu';

  categoryLinks.forEach(link => {
    if (link === activeLink) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
  cards.forEach(card => {
    card.hidden = card.dataset.category !== category;
  });

  if (event) {
    const focusTarget = browsing ? heading : categoryLinks[0];
    focusTarget.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

showCategory();
window.addEventListener('hashchange', showCategory);
