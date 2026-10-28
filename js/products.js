// =========================================================
// Assignment 5 — Deal Finder (products.html)
// Author: Dias Zhumakhan
//
// Shows: objects + methods, arrays + loops (for, for...of, while),
// higher-order functions (filter, map, sort, reduce, forEach),
// switch statements, event listeners and animations.
//
// The price table is no longer written by hand in HTML —
// JavaScript builds every row from the `products` array.
// =========================================================

// ---------- 1. Data: store names (an object used as a dictionary) ----------
const STORE_NAMES = {
  amazon: 'Amazon',
  pinduoduo: 'Pinduoduo',
  poizon: 'Poizon',
  official: 'Official Site'
};

// ---------- 2. Objects with methods ----------
// A "factory" function: builds one product object, so we don't
// repeat the same methods 9 times.
function createProduct(name, category, image, prices) {
  return {
    name: name,
    category: category,
    image: image,
    prices: prices, // { amazon: 59, pinduoduo: 34, ... }

    // lowest price among all stores
    bestPrice: function () {
      return Math.min(...Object.values(this.prices));
    },

    // highest price among all stores
    worstPrice: function () {
      return Math.max(...Object.values(this.prices));
    },

    // key of the store with the lowest price, e.g. 'pinduoduo'
    bestStore: function () {
      for (const store in this.prices) {
        if (this.prices[store] === this.bestPrice()) return store;
      }
    },

    // how many % you save compared with the most expensive store
    savingsPercent: function () {
      return Math.round((1 - this.bestPrice() / this.worstPrice()) * 100);
    }
  };
}

// ---------- 3. Array of products ----------
const products = [
  createProduct('Wireless Earbuds', 'electronics', 'images/ear.jpg',        { amazon: 59,  pinduoduo: 34,  poizon: 45,  official: 79 }),
  createProduct('Smartwatch',       'electronics', 'images/watch.jpg',      { amazon: 129, pinduoduo: 135, poizon: 149, official: 199 }),
  createProduct('Smartphone',       'electronics', 'images/smartphone.jpg', { amazon: 289, pinduoduo: 245, poizon: 259, official: 329 }),
  createProduct('Running Sneakers', 'sneakers',    'images/sneakers.jpg',   { amazon: 120, pinduoduo: 95,  poizon: 88,  official: 150 }),
  createProduct('Retro Sneakers',   'sneakers',    'images/look.jpg',       { amazon: 110, pinduoduo: 79,  poizon: 72,  official: 140 }),
  createProduct('Denim Jacket',     'clothing',    'images/denimjeans.jpg', { amazon: 40,  pinduoduo: 42,  poizon: 55,  official: 90 }),
  createProduct('Hoodie',           'clothing',    'images/hoodie.jpg',     { amazon: 38,  pinduoduo: 22,  poizon: 31,  official: 65 }),
  createProduct('Backpack',         'accessories', 'images/backpack.jpg',   { amazon: 49,  pinduoduo: 27,  poizon: 36,  official: 70 }),
  createProduct('Sunglasses',       'accessories', 'images/sun.jpg',        { amazon: 25,  pinduoduo: 12,  poizon: 19,  official: 45 })
];

// ---------- 4. Current state of the filters ----------
const PAGE_SIZE = 5;          // rows shown at first and added by "Show more"
let currentCategory = 'all';
let currentPrice = 'all';
let currentSort = 'default';
let visibleCount = PAGE_SIZE;

// ---------- 5. Elements we work with ----------
const tableBody = document.querySelector('#deal-table tbody');
const summary = document.getElementById('deal-summary');
const showMoreBtn = document.getElementById('show-more');
const priceSelect = document.getElementById('price-filter');
const sortSelect = document.getElementById('sort-select');
const categoryButtons = document.querySelectorAll('[data-filter]');

// ---------- 6. Filtering with SWITCH ----------
function matchesCategory(product) {
  switch (currentCategory) {
    case 'all':
      return true;
    case 'electronics':
    case 'clothing':
    case 'sneakers':
    case 'accessories':
      return product.category === currentCategory;
    default:
      return true;
  }
}

function matchesPrice(product) {
  const price = product.bestPrice();
  switch (currentPrice) {
    case 'under50':
      return price < 50;
    case '50to100':
      return price >= 50 && price <= 100;
    case 'over100':
      return price > 100;
    default: // 'all'
      return true;
  }
}

function sortProducts(list) {
  const copy = list.slice(); // don't change the original array
  switch (currentSort) {
    case 'cheapest':
      return copy.sort(function (a, b) { return a.bestPrice() - b.bestPrice(); });
    case 'savings':
      return copy.sort(function (a, b) { return b.savingsPercent() - a.savingsPercent(); });
    case 'name':
      return copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
    default:
      return copy;
  }
}

// ---------- 7. Build one table row (DOM manipulation) ----------
function createRow(product, index) {
  const row = document.createElement('tr');
  row.classList.add('row-enter');
  row.style.animationDelay = (index * 60) + 'ms'; // rows appear one after another

  // product name + small photo
  const nameCell = document.createElement('th');
  nameCell.scope = 'row';
  nameCell.innerHTML = '<img src="' + product.image + '" alt="" class="deal-thumb me-2">' + product.name;
  row.appendChild(nameCell);

  // one cell per store — loop over the store keys
  for (const store of Object.keys(STORE_NAMES)) {
    const cell = document.createElement('td');
    cell.textContent = '$' + product.prices[store];
    if (store === product.bestStore()) cell.classList.add('best-price');
    row.appendChild(cell);
  }

  // savings column
  const saveCell = document.createElement('td');
  saveCell.innerHTML = '<span class="badge save-badge">−' + product.savingsPercent() + '%</span>';
  row.appendChild(saveCell);

  return row;
}

// ---------- 8. Render the table ----------
function renderTable() {
  // higher-order functions: filter() takes our functions as arguments
  const filtered = sortProducts(products.filter(matchesCategory).filter(matchesPrice));

  tableBody.innerHTML = ''; // clear old rows

  if (filtered.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">No products match these filters.</td></tr>';
  }

  // WHILE loop: add rows until we reach visibleCount or run out of products
  let i = 0;
  while (i < filtered.length && i < visibleCount) {
    tableBody.appendChild(createRow(filtered[i], i));
    i++;
  }

  // summary text: reduce() adds up all savings in dollars
  const shown = filtered.slice(0, visibleCount);
  const totalSaved = shown.reduce(function (sum, p) { return sum + (p.worstPrice() - p.bestPrice()); }, 0);
  summary.textContent = 'Showing ' + shown.length + ' of ' + filtered.length + ' products · ' +
    'Buying them at the best store saves you $' + totalSaved + ' in total.';

  // "Show more" button is only visible when there are hidden rows
  showMoreBtn.style.display = filtered.length > visibleCount ? 'inline-block' : 'none';
}

// ---------- 9. Event listeners ----------
if (tableBody) {
  categoryButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      categoryButtons.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      currentCategory = button.dataset.filter;
      visibleCount = PAGE_SIZE;
      renderTable();
      playSound('click');
    });
  });

  priceSelect.addEventListener('change', function () {
    currentPrice = priceSelect.value;
    visibleCount = PAGE_SIZE;
    renderTable();
    playSound('click');
  });

  sortSelect.addEventListener('change', function () {
    currentSort = sortSelect.value;
    renderTable();
    playSound('click');
  });

  // load more rows without reloading the page
  showMoreBtn.addEventListener('click', function () {
    visibleCount += PAGE_SIZE;
    renderTable();
    playSound('pop');
  });

  renderTable(); // first render when the page opens
}
