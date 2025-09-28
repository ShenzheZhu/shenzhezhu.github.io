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
    // 显示加载状态
    content.innerHTML = '<p>Loading...</p>';
    
    // 从对应的HTML文件加载内容
    const response = await fetch(`pages/${page}.html`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    
    // 更新内容
    content.innerHTML = html;

    // Publications: group cards by year with a muted year label
    if (page === 'publications') {
      groupPublicationsByYear();
      applyPublicationThumbnails();
    }

    // 添加动画
    content.classList.remove('fade');
    void content.offsetWidth; // trigger reflow for animation
    content.classList.add('fade');
  } catch (error) {
    console.error('Error loading page:', error);
    content.innerHTML = '<p>Error loading page. Please try again.</p>';
  }
}

function groupPublicationsByYear() {
  const pubs = Array.from(content.querySelectorAll('.publication'));
  if (!pubs.length) return;
  let lastYear = null;
  pubs.forEach(pub => {
    const text = pub.textContent || '';
    const match = text.match(/(19|20)\d{2}/);
    const year = match ? match[0] : (lastYear || 'Other');
    if (year !== lastYear) {
      const label = document.createElement('div');
      label.className = 'pub-year';
      label.textContent = year;
      pub.parentNode.insertBefore(label, pub);
      lastYear = year;
    }
  });
}

function applyPublicationThumbnails() {
  const map = [
    { re: /Deliberations|Represent\s+Your\s+Voice/i, src: 'asset/paper_fig/deliberation.png', alt: 'Deliberations study illustration' },
    { re: /Automated\s+but\s+Risky\s+Game|A2A/i, src: 'asset/paper_fig/A2A.png', alt: 'Agent-to-Agent negotiation illustration' },
    { re: /HarmTransform/i, src: 'asset/paper_fig/harmtransform.png', alt: 'HarmTransform concept' },
    { re: /JailDAM/i, src: 'asset/paper_fig/jaildam.jpg', alt: 'JailDAM visual' },
    { re: /Personality\s+Traits|Persona\s+Steering/i, src: 'asset/paper_fig/LLM-Persona-Steering.png', alt: 'Persona steering chart' },
    { re: /AutoTrust/i, src: 'asset/paper_fig/autotrust.png', alt: 'AutoTrust benchmark' },
    { re: /Fraud-?R1/i, src: 'asset/paper_fig/fraud-r1.png', alt: 'Fraud-R1 flow' },
    { re: /Real-World\s+Planner|Travel\s+Planning/i, src: 'asset/paper_fig/agentplanner.png', alt: 'Planner robustness' },
    { re: /neural-symbolic|knowledge\s+graph/i, src: 'asset/paper_fig/neuro-symbolic.png', alt: 'Neural-symbolic survey' },
  ];

  const pubs = Array.from(content.querySelectorAll('.publication'));
  pubs.forEach(pub => {
    if (pub.querySelector('.pub-thumb')) return; // already enhanced

    const titleEl = pub.querySelector('h4, h4 a');
    const title = titleEl ? (titleEl.textContent || '') : '';
    const pair = map.find(m => m.re.test(title));
    if (!pair) return; // skip if no match

    // Wrap existing content in .pub-text
    let textWrap = pub.querySelector('.pub-text');
    if (!textWrap) {
      textWrap = document.createElement('div');
      textWrap.className = 'pub-text';
      while (pub.firstChild) {
        textWrap.appendChild(pub.firstChild);
      }
      pub.appendChild(textWrap);
    }

    // Add thumbnail BEFORE text content so text wraps around it
    const thumb = document.createElement('div');
    thumb.className = 'pub-thumb';
    const img = document.createElement('img');
    img.src = pair.src;
    img.alt = pair.alt;
    img.loading = 'lazy';
    thumb.appendChild(img);
    textWrap.insertBefore(thumb, textWrap.firstChild);
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
(function initThemeToggle(){
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

  function apply(theme){
    const useLight = theme === 'light';
    document.documentElement.classList.toggle('theme-light', useLight);
    try { localStorage.setItem(KEY, useLight ? 'light' : 'dark'); } catch {}
    label();
  }

  // Determine initial theme from storage or system preference
  let init = 'dark';
  try { init = localStorage.getItem(KEY) || init; } catch {}
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
