// =========================================================
// Final Project — Live Market: external API integration
// Author: Dias Zhumakhan
// Pages: market.html (search) and profile.html (watchlist)
//
// API: DummyJSON Products — https://dummyjson.com/docs/products
//   free, no API key, returns real-looking products with price,
//   discount %, rating, brand and photo. Endpoints we use:
//     /products/search?q=phone      → search by text
//     /products/category/laptops    → all products of one category
//     /products/category-list       → names of all categories
//
// How it works:
//  1. async/await + fetch() load the data; a spinner shows while waiting.
//  2. If the request fails, an error message with a "Try again" button appears.
//  3. Search text, category and sort are saved in localStorage, so the
//     page opens with the same results next time; the last 5 searches are
//     shown as quick buttons.
//  4. "☆ Watch" saves a product to localStorage — it appears on profile.html.
// =========================================================

const API_BASE = 'https://dummyjson.com/products';
const API_FIELDS = 'select=title,price,discountPercentage,rating,thumbnail,brand,category,stock';
const MARKET_KEY = 'ps-market';        // { query, category, sort }
const RECENT_KEY = 'ps-recent-searches';
const WATCH_KEY = 'ps-watchlist';

// ---------- localStorage helpers ----------
function readStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked */ }
}
function getWatchlist() { return readStore(WATCH_KEY, []); }

// price before the discount, e.g. $80 with 20% off → was $100
function oldPrice(item) {
  return item.price / (1 - item.discountPercentage / 100);
}

// turns "mens-shoes" into "Mens Shoes"
function prettyCategory(slug) {
  return slug.split('-').map(function (word) { return word[0].toUpperCase() + word.slice(1); }).join(' ');
}

function stars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

// ================= market.html =================
const marketGrid = document.getElementById('market-grid');

if (marketGrid) {
  const searchForm = document.getElementById('market-search-form');
  const searchInput = document.getElementById('market-query');
  const searchError = document.getElementById('market-query-error');
  const categorySelect = document.getElementById('market-category');
  const sortSelect = document.getElementById('market-sort');
  const statusLine = document.getElementById('market-status');
  const recentBox = document.getElementById('recent-searches');
  const resetBtn = document.getElementById('market-reset');

  const saved = readStore(MARKET_KEY, { query: '', category: 'all', sort: 'default' });
  let state = { query: saved.query, category: saved.category, sort: saved.sort };
  let items = [];          // products from the last API answer
  let requestId = 0;       // ignore old answers if the user searched again

  searchInput.value = state.query;
  sortSelect.value = state.sort;

  // ----- 1. load categories for the <select> -----
  async function loadCategories() {
    try {
      const response = await fetch(API_BASE + '/category-list');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const categories = await response.json();
      categories.forEach(function (slug) {
        const option = document.createElement('option');
        option.value = slug;
        option.textContent = prettyCategory(slug);
        categorySelect.appendChild(option);
      });
    } catch (error) {
      // the search still works without the list, so we only log it
      console.warn('Could not load categories:', error.message);
    }
    categorySelect.value = state.category;
    if (categorySelect.value !== state.category) state.category = 'all';
  }

  // ----- 2. build the request URL from the current state -----
  function buildUrl() {
    if (state.query) return API_BASE + '/search?q=' + encodeURIComponent(state.query) + '&limit=30&' + API_FIELDS;
    if (state.category !== 'all') return API_BASE + '/category/' + state.category + '?limit=30&' + API_FIELDS;
    return API_BASE + '?limit=12&skip=0&sortBy=discountPercentage&order=desc&' + API_FIELDS; // top discounts
  }

  // ----- 3. loading / error states -----
  function showLoading() {
    statusLine.textContent = 'Loading live prices…';
    marketGrid.setAttribute('aria-busy', 'true');
    marketGrid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      marketGrid.insertAdjacentHTML('beforeend',
        '<div class="col-12 col-sm-6 col-lg-4"><div class="market-card skeleton" aria-hidden="true"></div></div>');
    }
  }

  function showError(message) {
    marketGrid.removeAttribute('aria-busy');
    statusLine.textContent = '';
    marketGrid.innerHTML =
      '<div class="col-12"><div class="alert alert-danger d-flex flex-wrap align-items-center gap-3 mb-0" role="alert">' +
      '<span>⚠️ Could not load live prices: ' + escapeHtml(message) + '. Check your internet connection.</span>' +
      '<button type="button" class="btn btn-outline-danger btn-sm ms-auto" id="market-retry">Try again</button></div></div>';
    document.getElementById('market-retry').addEventListener('click', loadProducts);
  }

  // ----- 4. the API request (async / await) -----
  async function loadProducts() {
    const myId = ++requestId;
    showLoading();
    try {
      const response = await fetch(buildUrl());
      if (!response.ok) throw new Error('server answered ' + response.status);
      const data = await response.json();
      if (myId !== requestId) return; // a newer search has started
      items = data.products;
      // a text search + a category → filter the search results by category too
      if (state.query && state.category !== 'all') {
        items = items.filter(function (item) { return item.category === state.category; });
      }
      renderProducts();
    } catch (error) {
      if (myId === requestId) showError(error.message);
    }
  }

  // ----- 5. sort + draw the cards -----
  function sortItems(list) {
    const copy = list.slice();
    switch (state.sort) {
      case 'price-asc': return copy.sort(function (a, b) { return a.price - b.price; });
      case 'price-desc': return copy.sort(function (a, b) { return b.price - a.price; });
      case 'discount': return copy.sort(function (a, b) { return b.discountPercentage - a.discountPercentage; });
      case 'rating': return copy.sort(function (a, b) { return b.rating - a.rating; });
      default: return copy;
    }
  }

  function renderProducts() {
    marketGrid.removeAttribute('aria-busy');
    marketGrid.innerHTML = '';

    if (items.length === 0) {
      statusLine.textContent = '';
      marketGrid.innerHTML = '<div class="col-12"><div class="market-empty text-center p-5 rounded-3">' +
        '<div class="fs-1" aria-hidden="true">🔍</div><p class="mb-0">No products found for “' + escapeHtml(state.query) +
        '”. Try another word, e.g. <em>phone</em>, <em>watch</em> or <em>shoes</em>.</p></div></div>';
      return;
    }

    const watched = getWatchlist().map(function (w) { return w.id; });
    const list = sortItems(items);
    const label = state.query ? '“' + state.query + '”' : (state.category !== 'all' ? prettyCategory(state.category) : 'today’s top discounts');
    statusLine.textContent = list.length + (list.length === 1 ? ' product' : ' products') + ' — ' + label;

    list.forEach(function (item, index) {
      const isWatched = watched.indexOf(item.id) !== -1;
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-lg-4';
      col.innerHTML =
        '<article class="market-card h-100" style="animation-delay:' + (index * 40) + 'ms">' +
          '<div class="market-img">' +
            '<img src="' + item.thumbnail + '" alt="' + escapeHtml(item.title) + '" loading="lazy" width="300" height="300">' +
            '<span class="badge market-discount">−' + Math.round(item.discountPercentage) + '%</span>' +
          '</div>' +
          '<div class="p-3 d-flex flex-column flex-grow-1">' +
            '<span class="market-category small">' + prettyCategory(item.category) + (item.brand ? ' · ' + escapeHtml(item.brand) : '') + '</span>' +
            '<h3 class="h6 mt-1 mb-2">' + escapeHtml(item.title) + '</h3>' +
            '<p class="small mb-2 market-rating" aria-label="Rating ' + item.rating + ' of 5">' + stars(item.rating) + ' <span>' + item.rating.toFixed(1) + '</span></p>' +
            '<div class="d-flex align-items-end justify-content-between mt-auto gap-2">' +
              '<p class="mb-0"><span class="market-price">$' + item.price.toFixed(2) + '</span> ' +
              '<s class="market-old small">$' + oldPrice(item).toFixed(2) + '</s></p>' +
              '<button type="button" class="btn btn-sm watch-btn' + (isWatched ? ' watching' : '') + '" data-id="' + item.id + '" aria-pressed="' + isWatched + '">' +
                (isWatched ? '★ Watching' : '☆ Watch') + '</button>' +
            '</div>' +
          '</div>' +
        '</article>';
      marketGrid.appendChild(col);
    });
  }

  // ----- 6. watchlist button (one listener for all cards) -----
  marketGrid.addEventListener('click', function (event) {
    const button = event.target.closest('.watch-btn');
    if (!button) return;
    const id = Number(button.dataset.id);
    let watchlist = getWatchlist();
    const already = watchlist.some(function (w) { return w.id === id; });

    if (already) {
      watchlist = watchlist.filter(function (w) { return w.id !== id; });
      showToast('Removed from your watchlist.', 'info');
    } else {
      const item = items.find(function (i) { return i.id === id; });
      watchlist.push({ id: item.id, title: item.title, price: item.price, thumbnail: item.thumbnail,
                       discount: Math.round(item.discountPercentage) });
      showToast('Added to your watchlist — see it in your profile.');
    }
    writeStore(WATCH_KEY, watchlist);
    button.classList.toggle('watching', !already);
    button.setAttribute('aria-pressed', String(!already));
    button.textContent = already ? '☆ Watch' : '★ Watching';
    playSound('pop');
  });

  // ----- 7. save state + recent searches in localStorage -----
  function saveState() {
    writeStore(MARKET_KEY, state);
  }

  function addRecent(query) {
    if (!query) return;
    let recent = readStore(RECENT_KEY, []).filter(function (q) { return q.toLowerCase() !== query.toLowerCase(); });
    recent.unshift(query);
    writeStore(RECENT_KEY, recent.slice(0, 5));
    renderRecent();
  }

  function renderRecent() {
    const recent = readStore(RECENT_KEY, []);
    recentBox.innerHTML = '';
    recentBox.parentElement.classList.toggle('d-none', recent.length === 0);
    recent.forEach(function (query) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'btn btn-sm recent-chip';
      chip.textContent = query;
      chip.addEventListener('click', function () {
        searchInput.value = query;
        runSearch();
      });
      recentBox.appendChild(chip);
    });
  }

  // ----- 8. search form (validated by JS, no HTML attributes) -----
  function validateQuery(value) {
    if (value.length === 1) return 'Type at least 2 letters to search.';
    if (value.length > 40) return 'Search is too long — 40 characters max.';
    if (/[<>{}]/.test(value)) return 'Please use letters and numbers only.';
    return '';
  }

  function runSearch() {
    const value = searchInput.value.trim();
    const message = validateQuery(value);
    searchError.textContent = message;
    searchInput.classList.toggle('is-invalid', message !== '');
    if (message) return;

    state.query = value;
    saveState();
    addRecent(value);
    loadProducts();
  }

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    runSearch();
    playSound('click');
  });

  // dynamic search: wait 500 ms after the user stops typing
  let typingTimer;
  searchInput.addEventListener('input', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
      const value = searchInput.value.trim();
      if (value === '' && state.query !== '') { state.query = ''; saveState(); searchError.textContent = ''; searchInput.classList.remove('is-invalid'); loadProducts(); }
      else if (value.length >= 2 && value !== state.query) runSearch();
    }, 500);
  });

  categorySelect.addEventListener('change', function () {
    state.category = categorySelect.value;
    saveState();
    loadProducts();
    playSound('click');
  });

  // sorting does not need a new request — the data is already here
  sortSelect.addEventListener('change', function () {
    state.sort = sortSelect.value;
    saveState();
    renderProducts();
    playSound('click');
  });

  resetBtn.addEventListener('click', function () {
    state = { query: '', category: 'all', sort: 'default' };
    searchInput.value = '';
    categorySelect.value = 'all';
    sortSelect.value = 'default';
    searchError.textContent = '';
    searchInput.classList.remove('is-invalid');
    saveState();
    loadProducts();
  });

  renderRecent();
  loadCategories().then(loadProducts);
}

// ================= profile.html: watchlist =================
const watchlistBox = document.getElementById('profile-watchlist');

function renderWatchlist() {
  const list = getWatchlist();
  document.getElementById('watch-count').textContent = list.length;
  watchlistBox.innerHTML = '';
  if (list.length === 0) {
    watchlistBox.innerHTML = '<p class="mb-0 text-body-secondary">Your watchlist is empty. ' +
      '<a href="market.html">Open Live Market</a> and press <strong>☆ Watch</strong> on any product.</p>';
    return;
  }
  list.forEach(function (item) {
    const row = document.createElement('div');
    row.className = 'watch-row d-flex align-items-center gap-3 py-2';
    row.innerHTML = '<img src="' + item.thumbnail + '" alt="" width="56" height="56" class="rounded-2">' +
      '<div class="flex-grow-1"><p class="mb-0 fw-semibold">' + escapeHtml(item.title) + '</p>' +
      '<p class="mb-0 small"><span class="best-price">$' + item.price.toFixed(2) + '</span> · −' + item.discount + '%</p></div>' +
      '<button type="button" class="btn btn-sm btn-outline-danger remove-watch" data-id="' + item.id + '" aria-label="Remove ' + escapeHtml(item.title) + '">✕</button>';
    watchlistBox.appendChild(row);
  });
}

if (watchlistBox) {
  renderWatchlist();
  watchlistBox.addEventListener('click', function (event) {
    const button = event.target.closest('.remove-watch');
    if (!button) return;
    const id = Number(button.dataset.id);
    writeStore(WATCH_KEY, getWatchlist().filter(function (w) { return w.id !== id; }));
    renderWatchlist();
    playSound('pop');
  });

  const recent = readStore(RECENT_KEY, []);
  const recentList = document.getElementById('profile-recent');
  if (recent.length === 0) {
    recentList.innerHTML = '<span class="text-body-secondary small">No searches yet.</span>';
  } else {
    recent.forEach(function (query) {
      const link = document.createElement('a');
      link.className = 'btn btn-sm recent-chip';
      link.href = 'market.html';
      link.textContent = query;
      link.addEventListener('click', function () {
        const st = readStore(MARKET_KEY, { query: '', category: 'all', sort: 'default' });
        st.query = query;
        writeStore(MARKET_KEY, st);
      });
      recentList.appendChild(link);
    });
  }
}
