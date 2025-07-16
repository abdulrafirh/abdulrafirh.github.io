// --- SPA Router and App Logic ---

// Handle redirects from 404.html
(function() {
    const redirect = sessionStorage.getItem('redirect');
    delete sessionStorage.redirect;
    if (redirect && redirect !== window.location.pathname) {
        history.replaceState(null, null, redirect);
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Load writeups data once and make it available globally
    fetch('/writeups-data.js')
        .then(response => response.text())
        .then(text => {
            const data = new Function(`${text}; return writeupsData;`)();
            window.writeupsData = data;
            
            // This needs to be called AFTER data is loaded
            if(window.initializeFileSystem) window.initializeFileSystem();

            handleLocation();
        });

    document.body.addEventListener('click', e => {
        if (e.target.matches('a:not([href^="http"])')) {
            e.preventDefault();
            navigate(e.target.getAttribute('href'));
        }
    });

    window.addEventListener('popstate', handleLocation);
});

const routes = {
    404: { path: '/pages/_404.html', title: '404' },
    '/': { path: '/pages/_home.html', title: 'Home' },
    '/about': { path: '/pages/_about.html', title: 'About' },
    '/blog': { path: '/pages/_blog.html', title: 'Blog' },
};

const handleLocation = async () => {
    let path = window.location.pathname;
    if (path.endsWith('/index.html')) path = '/';

    const mainContent = document.getElementById('main-content');
    
    if (window.setTerminalCwd) {
        window.setTerminalCwd(path);
    }
    
    if (path.startsWith('/blog/')) {
        const postId = path.split('/')[2];
        await renderSinglePost(postId);
        return;
    }

    const route = routes[path] || routes[404];
    const html = await fetch(route.path).then(data => data.text());
    mainContent.innerHTML = html;
    document.title = `Etynso's Page - ${route.title}`;

    if (path === '/') {
        if (!sessionStorage.getItem('animationDone')) {
            if (mainContent.querySelector('[data-scramble]')) {
                runDecryptionSequence();
                sessionStorage.setItem('animationDone', 'true');
            }
        } else {
            mainContent.querySelectorAll('[data-scramble]').forEach(el => el.removeAttribute('data-scramble'));
        }
    } else if (path === '/blog') {
        renderWriteupsPage();
    }
};

const navigate = (path) => {
    window.history.pushState({}, '', path);
    handleLocation();
};

// --- Writeups Page Specific Logic ---
let activeTags = new Set();

function renderWriteupsPage() {
    const allTags = new Set();
    window.writeupsData.forEach(post => post.tags.forEach(tag => allTags.add(tag)));

    const tagFilterContainer = document.getElementById('tag-filter-container');
    tagFilterContainer.innerHTML = `
        <strong>Filter by Tag:</strong><br><br>
        ${[...allTags].map(tag => `<button class="tag-btn" data-tag="${tag}">${tag}</button>`).join('')}
    `;

    document.querySelectorAll('.tag-btn').forEach(button => {
        button.addEventListener('click', () => {
            const tag = button.dataset.tag;
            button.classList.toggle('active');
            if (activeTags.has(tag)) {
                activeTags.delete(tag);
            } else {
                activeTags.add(tag);
            }
            filterArticles();
        });
    });

    renderArticleCards();
}

function renderArticleCards() {
    const articlesList = document.getElementById('articles-list');
    articlesList.innerHTML = window.writeupsData.map(post => `
        <a href="/writeups/${post.id}" class="article-card" data-tags="${post.tags.join(',')}">
            <div class="article-card-content">
                <h2>${post.title}</h2>
                <div class="article-card-meta">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <p class="article-card-preview">${post.preview}</p>
                <div class="article-card-tags">
                    ${post.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${post.tags.length > 3 ? `<span class="tag">...</span>` : ''}
                </div>
            </div>
            ${post.image ? `<div class="article-card-image" style="background-image: url('${post.image}')"></div>` : ''}
        </a>
    `).join('');
}

function filterArticles() {
    const cards = document.querySelectorAll('.article-card');
    cards.forEach(card => {
        const cardTags = card.dataset.tags.split(',');
        const shouldShow = [...activeTags].every(tag => cardTags.includes(tag));
        
        if (shouldShow) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}


// --- Decryption Animation Logic ---

const hexChars = '0123456789abcdef';
function getRandomHexString(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += hexChars[Math.floor(Math.random() * hexChars.length)];
    }
    return result;
}

async function runDecryptionSequence() {
    document.documentElement.classList.add('loading');
    document.body.classList.add('loading');

    const statusLogContainer = document.getElementById('status-log-container');
    statusLogContainer.innerHTML = '<div id="status-log-overlay"></div>';
    const statusLogEl = document.getElementById('status-log-overlay');

    const scrambleElements = document.querySelectorAll('[data-scramble]');
    const originalTexts = new Map();

    const statusMessages = [
        "[+] Initiating key exchange...",
        "[+] Performing 2-isogeny walks...",
        "[+] Generating strong primes...",
        "[+] Establishing secure channel...",
        "[+] Receiving encrypted payload...",
        "[+] Decrypting page content..."
    ];

    scrambleElements.forEach(el => {
        originalTexts.set(el, el.textContent);
        el.textContent = getRandomHexString(el.textContent.length);
    });

    for (const msg of statusMessages) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200));
        const statusItem = document.createElement('div');
        statusItem.textContent = msg;
        statusLogEl.appendChild(statusItem);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));

    const decryptionPromises = [];
    scrambleElements.forEach(el => {
        decryptionPromises.push(decryptElement(el, originalTexts.get(el)));
    });
    
    await Promise.all(decryptionPromises);
    
    statusLogEl.style.opacity = '0';
    setTimeout(() => {
        statusLogContainer.remove();
        document.documentElement.classList.remove('loading');
        document.body.classList.remove('loading');
    }, 500);
}

function decryptElement(element, originalText) {
    return new Promise(resolve => {
        const totalLength = originalText.length;
        if (totalLength === 0) {
            element.removeAttribute('data-scramble');
            resolve();
            return;
        }
        
        let decryptedLength = 0;
        const duration = 1200;
        const intervalDelay = duration / totalLength;

        const interval = setInterval(() => {
            decryptedLength++;
            const revealedPart = originalText.substring(0, decryptedLength);
            const scrambledPart = getRandomHexString(totalLength - decryptedLength);
            
            element.textContent = revealedPart + scrambledPart;
            
            if (decryptedLength >= totalLength) {
                clearInterval(interval);
                element.textContent = originalText;
                element.removeAttribute('data-scramble');
                resolve();
            }
        }, intervalDelay);
    });
}

// --- Single Post Rendering ---
async function renderSinglePost(postId) {
    const mainContent = document.getElementById('main-content');
    const postData = window.writeupsData.find(p => p.id === postId);

    if (!postData) {
        mainContent.innerHTML = '<h1>404 - Post Not Found</h1>';
        document.title = "Etynso's Page - Not Found";
        return;
    }

    document.title = `Etynso's Page - ${postData.title}`;
    
    try {
        const markdown = await fetch(postData.contentPath).then(res => res.text());
        // 1. Convert Markdown to HTML using marked.js
        const rawHtml = marked.parse(markdown);
        
        mainContent.innerHTML = `<div class="post-content">${rawHtml}</div>`;

        // 2. Render LaTeX using KaTeX
        renderMathInElement(mainContent, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ]
        });

    } catch (error) {
        mainContent.innerHTML = '<h1>Error loading post content.</h1>';
        console.error('Error fetching or rendering post:', error);
    }
}