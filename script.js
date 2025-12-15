// script.js (v2)

const links = document.querySelectorAll('nav a[data-page]');
const content = document.getElementById('content');

function setActiveLink(page) {
  links.forEach(link => {
    const isActive = link.dataset.page === page;
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

async function loadPage(page) {
  try {
    // 1. Fetch content first (don't clear screen yet)
    const response = await fetch(`pages/${page}.html`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();

    // 2. Animate out current content
    content.classList.add('fading-out');

    // Wait for the exit animation (match css time)
    await new Promise(r => setTimeout(r, 200));

    // 3. Swap content
    content.innerHTML = html;

    // Reset scroll to top
    window.scrollTo(0, 0);

    // Publications logic
    if (page === 'publications') {
      groupPublicationsByYear();
    }

    // 4. Animate in
    content.classList.remove('fading-out');
    content.classList.add('fading-in');

    // Clean up class after animation
    setTimeout(() => {
      content.classList.remove('fading-in');
    }, 400);

  } catch (error) {
    console.error('Error loading page:', error);
    // If error, force show error message immediately
    content.innerHTML = '<p>Error loading page. Please try again.</p>';
  }
}

function groupPublicationsByYear() {
  const pubs = Array.from(content.querySelectorAll('.publication'));
  if (!pubs.length) return;

  // 1. Prepare Insertion Point (Stable placeholder)
  // We grab the parent of the first pub to use as the container for all sections.
  // Note: This assumes all pubs are in the same flattened list area, which is standard.
  const container = pubs[0].parentNode;
  const placeholder = document.createElement('div');
  container.insertBefore(placeholder, pubs[0]);

  let currentSection = null;
  let currentContent = null;
  let lastYear = null;

  pubs.forEach(pub => {
    // Priority 1: Explicit tag
    let year = pub.dataset.year || pub.getAttribute('data-year');

    // Priority 2: Text scan
    if (!year) {
      const text = pub.textContent || '';
      const match = text.match(/(19|20)\d{2}/);
      if (match) year = match[0];
    }

    // Priority 3: Inherit (Sticky Grouping)
    if (!year) year = lastYear;

    // Fallback
    if (!year) year = '';

    // If year changes (or first run), start a new section
    if (year !== lastYear || !currentSection) {
      currentSection = document.createElement('div');
      currentSection.className = 'year-section';

      const label = document.createElement('div');
      label.className = 'year-label';
      label.textContent = year; // Display year or empty

      currentContent = document.createElement('div');
      currentContent.className = 'year-content';

      currentSection.appendChild(label);
      currentSection.appendChild(currentContent);

      // Insert before our stable anchor
      container.insertBefore(currentSection, placeholder);

      lastYear = year;
    }

    // Move the publication into the current section's content area
    currentContent.appendChild(pub);
  });

  // 2. Cleanup
  container.removeChild(placeholder);
}


// Handle internal navigation
links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;
    if (!page) return;
    // Update hash for deep linking
    if (location.hash.slice(1) !== page) {
      location.hash = page;
    }
    setActiveLink(page);
    loadPage(page);
  });
});

// Handle external links (but not mailto links)
const externalLinks = document.querySelectorAll('a[data-external]');
externalLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    window.open(link.href, '_blank', 'noopener,noreferrer');
  });
});

// Handle mailto links - let them work naturally
const mailtoLinks = document.querySelectorAll('a[data-mailto]');
mailtoLinks.forEach(link => {
  // No need to prevent default behavior for mailto links
  // They will work naturally to open the default email client
});

// Handle hash navigation (back/forward)
window.addEventListener('hashchange', () => {
  const page = location.hash ? location.hash.slice(1) : 'about';
  setActiveLink(page);
  loadPage(page);
});

// Theme toggle
(function initThemeToggle() {
  const KEY = 'theme';
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // Monochrome inline SVG icons (inherit color via currentColor)
  const sunSVG = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="M12 2v2m0 16v2M22 12h-2M4 12H2M18.364 5.636l-1.414 1.414M7.05 16.95l-1.414 1.414M18.364 18.364l-1.414-1.414M7.05 7.05 5.636 5.636" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;
  const moonSVG = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>
    </svg>`;

  function label() {
    const light = document.documentElement.classList.contains('theme-light');
    // Show NEXT mode label (what will happen on click)
    const nextIsLight = !light;
    btn.innerHTML = nextIsLight ? sunSVG : moonSVG;
    btn.setAttribute('aria-label', nextIsLight ? 'Switch to light theme' : 'Switch to dark theme');
    btn.setAttribute('title', nextIsLight ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function apply(theme) {
    const useLight = theme === 'light';
    document.documentElement.classList.toggle('theme-light', useLight);
    try { localStorage.setItem(KEY, useLight ? 'light' : 'dark'); } catch { }
    label();
  }

  // Determine initial theme from storage or system preference
  let init = 'dark';
  try { init = localStorage.getItem(KEY) || init; } catch { }
  if (init !== 'light' && init !== 'dark') {
    init = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  }
  apply(init);

  btn.addEventListener('click', () => {
    const next = document.documentElement.classList.contains('theme-light') ? 'dark' : 'light';
    apply(next);
  });
})();

// Initial load based on hash, default to 'about'
const initialPage = location.hash ? location.hash.slice(1) : 'about';
setActiveLink(initialPage);
loadPage(initialPage);
