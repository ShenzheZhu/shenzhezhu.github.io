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
      applyPublicationThumbnails();
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

  // 1. Group by year
  const groups = {};
  const years = [];

  pubs.forEach(pub => {
    const text = pub.textContent || '';
    const match = text.match(/(19|20)\d{2}/);
    const year = match ? match[0] : 'Other';

    if (!groups[year]) {
      groups[year] = [];
      years.push(year);
    }
    groups[year].push(pub);
  });

  // 2. Prepare Insertion Point
  // We need a stable reference because pubs[0] will be moved OUT of the container.
  const container = pubs[0].parentNode;
  const placeholder = document.createElement('div');
  container.insertBefore(placeholder, pubs[0]);

  // 3. Build & Insert Sections
  years.forEach(year => {
    const section = document.createElement('div');
    section.className = 'year-section';

    const label = document.createElement('div');
    label.className = 'year-label';
    label.textContent = year;

    const groupContent = document.createElement('div');
    groupContent.className = 'year-content';

    groups[year].forEach(pub => {
      // Move pub into this new container
      groupContent.appendChild(pub);
    });

    section.appendChild(label);
    section.appendChild(groupContent);

    // Insert before the stable placeholder
    container.insertBefore(section, placeholder);
  });

  // 4. Cleanup
  container.removeChild(placeholder);
}

// Floating Preview Logic
let previewEl = null;

function initFloatingPreview() {
  if (document.getElementById('floating-preview')) return;

  previewEl = document.createElement('div');
  previewEl.id = 'floating-preview';
  // Add an img element inside
  const img = document.createElement('img');
  previewEl.appendChild(img);
  document.body.appendChild(previewEl);
}

function applyPublicationThumbnails() {
  initFloatingPreview();
  const previewImg = previewEl.querySelector('img');

  const map = [
    { re: /Deliberations|Represent\s+Your\s+Voice/i, src: 'asset/paper_fig/deliberation.png' },
    { re: /Automated\s+but\s+Risky\s+Game|A2A/i, src: 'asset/paper_fig/A2A.png' },
    { re: /HarmTransform/i, src: 'asset/paper_fig/harmtransform.png' },
    { re: /JailDAM/i, src: 'asset/paper_fig/jaildam.jpg' },
    { re: /Personality\s+Traits|Persona\s+Steering/i, src: 'asset/paper_fig/LLM-Persona-Steering.png' },
    { re: /AutoTrust/i, src: 'asset/paper_fig/autotrust.png' },
    { re: /Fraud-?R1/i, src: 'asset/paper_fig/fraud-r1.png' },
    { re: /Real-World\s+Planner|Travel\s+Planning/i, src: 'asset/paper_fig/agentplanner.png' },
    { re: /neural-symbolic|knowledge\s+graph/i, src: 'asset/paper_fig/neuro-symbolic.png' },
  ];

  const pubs = Array.from(content.querySelectorAll('.publication'));

  pubs.forEach(pub => {
    // We target the TITLE link for the hover effect
    const titleLink = pub.querySelector('h4 a');
    if (!titleLink) return;

    const titleText = titleLink.textContent || '';
    const pair = map.find(m => m.re.test(titleText));

    if (pair) {
      // Attach events to the link
      titleLink.addEventListener('mouseenter', () => {
        previewImg.src = pair.src;
        previewEl.classList.add('visible');
      });

      titleLink.addEventListener('mousemove', (e) => {
        // Dimensions
        const imgHeight = previewEl.offsetHeight;
        const winHeight = window.innerHeight;
        const padding = 20; // Distance from cursor

        let x = e.clientX + padding;
        let y = e.clientY + padding;

        // Check if image goes below viewport
        if (y + imgHeight > winHeight) {
          // Flip to above cursor
          y = e.clientY - imgHeight - padding;
        }

        previewEl.style.transform = `translate(${x}px, ${y}px)`;
      });

      titleLink.addEventListener('mouseleave', () => {
        previewEl.classList.remove('visible');
      });
    }
  });
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
