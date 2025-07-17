// script.js

const links = document.querySelectorAll('nav a[data-page]');
const content = document.getElementById('content');

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
    
    // 更新内容并添加动画
    content.innerHTML = html;
    content.classList.remove('fade');
    void content.offsetWidth; // trigger reflow for animation
    content.classList.add('fade');
  } catch (error) {
    console.error('Error loading page:', error);
    content.innerHTML = '<p>Error loading page. Please try again.</p>';
  }
}

// Handle internal navigation
links.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;
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

// Load default page
loadPage('about');