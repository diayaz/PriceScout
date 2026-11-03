// =========================================================
// Assignment 6 — jQuery (all pages)
// Team: Dias Zhumakhan, Agzam Duysenov
//
// This file is loaded in <head> right after jQuery:
//   <script src="https://code.jquery.com/jquery-4.0.0.min.js"></script>
//   <script src="js/script.js"></script>
//
// Two kinds of code live here:
//   A) helper functions (showToast, showLoading, highlightText) —
//      declared at the top level, so other files can call them too;
//   B) everything that works with the page — inside
//      $(document).ready(), which waits until the HTML is loaded.
// =========================================================


/* =========================================================
   A) HELPER FUNCTIONS
   ========================================================= */

// ---------- Task 7. Toast notifications (Agzam Duysenov) ----------
// showToast('Item saved')            → green toast
// showToast('No internet', 'error')  → red toast
// The toast slides in, stays 3 seconds, then fades out and is removed.
function showToast(message, type) {
  type = type || 'success';
  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  // create the container once, the first time a toast is shown
  let $box = $('#toast-box');
  if ($box.length === 0) {
    $box = $('<div id="toast-box" class="toast-box" aria-live="polite"></div>').appendTo('body');
  }

  const $toast = $('<div class="ps-toast"></div>').addClass('ps-toast-' + type);
  $('<span class="ps-toast-icon"></span>').text(icons[type] || icons.info).appendTo($toast);
  $('<span class="ps-toast-text"></span>').text(message).appendTo($toast);

  $toast.hide().appendTo($box).fadeIn(250);

  setTimeout(function () {
    $toast.fadeOut(600, function () {
      $(this).remove(); // remove from the page after fading out
    });
  }, 3000);
}

// ---------- Task 6. Loading spinner on a submit button (Agzam Duysenov) ----------
// showLoading($button, 1500, function () { ... })
// 1) the button shows a spinner + "Please wait…" and is disabled,
// 2) after `delay` ms (a pretend server call) it goes back to normal,
// 3) then the `done` callback runs.
function showLoading($button, delay, done) {
  const originalHtml = $button.html();

  $button
    .prop('disabled', true)
    .addClass('is-loading')
    .html('<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait…');

  setTimeout(function () {
    $button.prop('disabled', false).removeClass('is-loading').html(originalHtml);
    if (done) done();
  }, delay);
}

// ---------- Used by Task 2 and Task 3: wrap matches in <mark> ----------
function escapeHtml(text) {
  return $('<div>').text(text).html();             // "<b>" → "&lt;b&gt;"
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // "a.b" → "a\.b"
}

// highlightText('Running Sneakers', 'sne') → 'Running <mark>Sne</mark>akers'
function highlightText(text, term) {
  const safeText = escapeHtml(text);
  if (!term) return safeText;
  const regex = new RegExp('(' + escapeRegex(escapeHtml(term)) + ')', 'gi'); // g = all, i = ignore case
  return safeText.replace(regex, '<mark>$1</mark>');
}


/* =========================================================
   B) PAGE CODE — runs when the HTML is ready
   ========================================================= */
$(document).ready(function () {

  // ---------- Task 0. Setup ----------
  console.log('jQuery is ready!');


  // ---------- Task 4. Scroll progress bar (all pages) — Agzam Duysenov ----------
  // The bar is created by jQuery and added to the top of <body>.
  const $progress = $('<div class="scroll-progress" aria-hidden="true">' +
    '<div class="scroll-progress-fill"><span class="scroll-progress-label">0%</span></div></div>');
  $('body').prepend($progress);

  const $progressFill = $progress.find('.scroll-progress-fill');
  const $progressLabel = $progress.find('.scroll-progress-label');

  function updateProgress() {
    const scrollTop = $(window).scrollTop();                       // how far we scrolled
    const maxScroll = $(document).height() - $(window).height();  // how far we CAN scroll
    const percent = maxScroll > 0 ? Math.min(100, (scrollTop / maxScroll) * 100) : 0;

    $progressFill.css('width', percent + '%');
    $progressLabel.text(Math.round(percent) + '%');
    $progress.toggleClass('is-complete', percent >= 99.5);         // extra glow at 100%
    $progress.toggleClass('has-progress', percent > 1);            // show the % bubble
  }

  $(window).on('scroll resize', updateProgress);
  updateProgress();


  // ---------- Task 1 + Task 2. Live search + autocomplete (products.html) — Dias Zhumakhan ----------
  const $search = $('#product-search');

  if ($search.length) {
    const $suggestions = $('#search-suggestions');
    const $searchStatus = $('#search-status');
    let activeIndex = -1; // which suggestion is selected with the arrow keys

    // Suggestions come from the same products array that products.js uses
    const suggestionData = products.map(function (product) {
      return { label: product.name, type: product.category };
    }).concat([
      { label: 'Electronics', type: 'category' },
      { label: 'Clothing', type: 'category' },
      { label: 'Sneakers', type: 'category' },
      { label: 'Accessories', type: 'category' }
    ]);

    // ----- Task 1: live filter of the table rows -----
    function applySearch() {
      const term = $search.val().trim().toLowerCase();
      const $rows = $('#deal-table tbody tr');
      $('#deal-table .search-empty').remove();

      if (term === '') {
        $rows.show();
        $searchStatus.text('');
        return;
      }

      // while searching we want ALL products, not only the first 5
      if ($('#show-more').is(':visible')) {
        showAllDeals(); // products.js draws all rows → 'deals:rendered' → applySearch() runs again
        return;
      }

      // .filter() keeps only the rows whose name or category contains the term
      const $matches = $rows.filter(function () {
        const name = $(this).find('th').text().toLowerCase();
        const category = String($(this).data('category') || '');
        return name.includes(term) || category.includes(term);
      });

      $rows.hide();
      $matches.show();

      if ($matches.length === 0) {
        $('#deal-table tbody').append('<tr class="search-empty"><td colspan="6" class="text-center py-4">' +
          'No products found for “' + escapeHtml(term) + '”.</td></tr>');
      }
      $searchStatus.text($matches.length + ' product' + ($matches.length === 1 ? '' : 's') +
        ' found for “' + $search.val().trim() + '”');
    }

    // products.js re-draws the table when a filter changes → search again
    $(document).on('deals:rendered', applySearch);

    // ----- Task 2: autocomplete suggestions -----
    function closeSuggestions() {
      $suggestions.hide().empty();
      $search.attr('aria-expanded', 'false');
      activeIndex = -1;
    }

    function renderSuggestions() {
      const term = $search.val().trim().toLowerCase();
      $suggestions.empty();
      activeIndex = -1;

      if (term === '') {
        closeSuggestions();
        return;
      }

      const matches = suggestionData.filter(function (item) {
        return item.label.toLowerCase().includes(term);
      }).slice(0, 6); // show at most 6

      if (matches.length === 0) {
        $suggestions.append('<li class="suggestion-empty">No suggestions</li>');
      }

      $.each(matches, function (index, item) {
        $('<li class="suggestion" role="option"></li>')
          .attr('id', 'suggestion-' + index)
          .data('value', item.label)
          .html('<span class="suggestion-label">' + highlightText(item.label, term) + '</span>' +
                '<span class="suggestion-type">' + item.type + '</span>')
          .appendTo($suggestions);
      });

      $suggestions.show();
      $search.attr('aria-expanded', 'true');
    }

    function chooseSuggestion(value) {
      $search.val(value);
      closeSuggestions();
      applySearch();
      playSound('click');
    }

    function moveActive(step) {
      const $items = $suggestions.find('.suggestion');
      if ($items.length === 0) return;
      activeIndex = (activeIndex + step + $items.length) % $items.length;
      $items.removeClass('active').eq(activeIndex).addClass('active');
      $search.attr('aria-activedescendant', $items.eq(activeIndex).attr('id'));
    }

    // typing → filter the table + update suggestions
    $search.on('keyup input', function (event) {
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) return; // handled below
      applySearch();
      renderSuggestions();
    });

    // keyboard inside the search box
    $search.on('keydown', function (event) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          moveActive(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          moveActive(-1);
          break;
        case 'Enter': {
          event.preventDefault();
          const $active = $suggestions.find('.suggestion.active');
          if ($active.length) chooseSuggestion($active.data('value'));
          else closeSuggestions();
          break;
        }
        case 'Escape':
          closeSuggestions();
          break;
      }
    });

    // click on a suggestion (mousedown fires before the input loses focus)
    $suggestions.on('mousedown', '.suggestion', function (event) {
      event.preventDefault();
      chooseSuggestion($(this).data('value'));
    });

    // click anywhere else closes the list
    $(document).on('click', function (event) {
      if (!$(event.target).closest('.search-wrap').length) closeSuggestions();
    });
  }


  // ---------- Task 3. Search highlighting in the FAQ (products.html) — Agzam Duysenov ----------
  const $faqSearch = $('#faq-search');

  if ($faqSearch.length) {
    const $faqStatus = $('#faq-search-status');
    const $faqTexts = $('.faq-question > span:first-child, .faq-answer p');

    // remember the original text of every question and answer
    $faqTexts.each(function () {
      $(this).data('original', $(this).text());
    });

    $faqSearch.on('keyup input', function () {
      const term = $(this).val().trim();

      // put <mark> around every match (or restore the plain text)
      $faqTexts.each(function () {
        const original = $(this).data('original');
        if (term.length < 2) {
          $(this).text(original);
        } else {
          $(this).html(highlightText(original, term));
        }
      });

      if (term.length < 2) {
        $faqStatus.text('');
        return;
      }

      // open the questions that contain a match, close the others
      let questionsWithMatches = 0;
      $('.faq-item').each(function () {
        if ($(this).find('mark').length > 0) {
          openItem(this); // function from accordion.js
          questionsWithMatches++;
        } else {
          closeItem(this);
        }
      });

      const total = $('#faq mark').length;
      $faqStatus.text(total === 0
        ? 'No matches for “' + term + '”.'
        : total + ' match' + (total === 1 ? '' : 'es') + ' in ' + questionsWithMatches +
          ' question' + (questionsWithMatches === 1 ? '' : 's') + '.');
    });
  }


  // ---------- Task 5. Animated number counter (index.html) — Dias Zhumakhan ----------
  const $counters = $('.counter');
  let countersStarted = false;

  function formatNumber(value, $el) {
    return ($el.data('prefix') || '') + value.toLocaleString('en-US') + ($el.data('suffix') || '');
  }

  function startCountersWhenVisible() {
    if (countersStarted || $counters.length === 0) return;

    const sectionTop = $('#stats').offset().top;
    const viewBottom = $(window).scrollTop() + $(window).height();
    if (viewBottom < sectionTop + 80) return; // not on screen yet

    countersStarted = true; // run only once
    $counters.each(function () {
      const $el = $(this);
      const target = Number($el.data('target'));

      // jQuery animates the "value" property of a plain object from 0 to target
      $({ value: 0 }).animate({ value: target }, {
        duration: 2000,
        easing: 'swing',
        step: function (now) {
          $el.text(formatNumber(Math.floor(now), $el));
        },
        complete: function () {
          $el.text(formatNumber(target, $el));
          $el.closest('.stat-card').addClass('done'); // small "pop" when finished
        }
      });
    });
  }

  $(window).on('scroll', startCountersWhenVisible);
  startCountersWhenVisible();


  // ---------- Task 8. "Copy" buttons (products.html, contact.html, about.html) — Agzam Duysenov ----------
  let textToCopy = null; // text our button wants to copy

  // The 'copy' event fires for EVERY copy on the page:
  //  - when our button runs document.execCommand('copy') → we put our text into the clipboard;
  //  - when the user selects text and presses Ctrl+C / Cmd+C → we just show a toast.
  $(document).on('copy', function (event) {
    if (textToCopy !== null) {
      event.originalEvent.clipboardData.setData('text/plain', textToCopy);
      event.preventDefault();
      textToCopy = null;
    } else {
      showToast('Copied to clipboard!', 'info');
    }
  });

  $('.copy-btn').on('click', function () {
    const $btn = $(this);
    const text = String($btn.data('copy'));

    // Put the text into a hidden textarea and select it, so the browser
    // has something to copy; execCommand('copy') then fires the 'copy' event above.
    textToCopy = text;
    const $temp = $('<textarea class="copy-temp" readonly aria-hidden="true"></textarea>').val(text).appendTo('body');
    $temp[0].select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (e) { copied = false; }
    $temp.remove();
    $btn.trigger('focus');

    function onCopied() {
      textToCopy = null;
      const originalHtml = $btn.data('original-html') || $btn.html();
      $btn.data('original-html', originalHtml);

      // icon → checkmark + tooltip
      $btn.addClass('copied').html('✓' + ($btn.hasClass('copy-icon') ? '' : ' Copied'));
      $btn.find('.copy-tooltip').remove();
      $('<span class="copy-tooltip" role="status">Copied to clipboard!</span>')
        .appendTo($btn).hide().fadeIn(150).delay(1200).fadeOut(400, function () { $(this).remove(); });

      showToast('Copied: “' + (text.length > 40 ? text.slice(0, 40) + '…' : text) + '”');
      playSound('pop');

      setTimeout(function () {
        $btn.removeClass('copied').html(originalHtml);
      }, 2000);
    }

    if (copied) {
      onCopied();
    } else if (navigator.clipboard) {
      // backup: the modern Clipboard API
      navigator.clipboard.writeText(text).then(onCopied).catch(function () {
        textToCopy = null;
        showToast('Could not copy — please copy it by hand.', 'error');
      });
    }
  });


  // ---------- Task 9. Image lazy loading (all pages) — Dias Zhumakhan ----------
  // In HTML the real path is in data-src, and src is a tiny empty placeholder.
  // When an image comes near the screen, jQuery copies data-src into src.
  function loadVisibleImages() {
    const viewBottom = $(window).scrollTop() + $(window).height() + 200; // start 200px early

    $('img.lazy').not('.lazy-started').each(function () {
      const $img = $(this);
      if ($img.offset().top < viewBottom) {
        $img.addClass('lazy-started')
          .one('load', function () {
            $img.addClass('loaded');               // CSS fades it in
          })
          .attr('src', $img.data('src'));          // ← the real download starts here
        console.log('Lazy loaded:', $img.data('src'));
      }
    });
  }

  $(window).on('scroll resize', loadVisibleImages);
  loadVisibleImages();
});
