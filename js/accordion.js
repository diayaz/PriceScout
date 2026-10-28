// =========================================================
// Task 2 — FAQ Accordion (products.html)
// Author: Dias Zhumakhan
//
// How it works:
//  - Each .faq-item has a <button class="faq-question"> and a
//    <div class="faq-answer"> below it.
//  - On page load JavaScript HIDES every answer (max-height: 0).
//    (Without JS the answers stay visible, so content is never lost.)
//  - Clicking a question sets max-height to the real content height
//    (scrollHeight), and CSS `transition: max-height` animates it.
//  - Clicking the same question again sets max-height back to 0.
// =========================================================

const faqItems = document.querySelectorAll('.faq-item');

function closeItem(item) {
  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  button.setAttribute('aria-expanded', 'false');
  item.classList.remove('open');
  answer.style.maxHeight = '0px';
}

function openItem(item) {
  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');
  button.setAttribute('aria-expanded', 'true');
  item.classList.add('open');
  answer.style.maxHeight = answer.scrollHeight + 'px';
}

faqItems.forEach(function (item) {
  // 1) hidden by default
  closeItem(item);

  // 2) toggle on click
  item.querySelector('.faq-question').addEventListener('click', function () {
    if (item.classList.contains('open')) {
      closeItem(item);
    } else {
      openItem(item);
    }
  });
});

// Keep open answers the right height when the window is resized
window.addEventListener('resize', function () {
  document.querySelectorAll('.faq-item.open').forEach(openItem);
});

// "Expand all" / "Collapse all" helper buttons
const expandAll = document.getElementById('faq-expand-all');
const collapseAll = document.getElementById('faq-collapse-all');
if (expandAll && collapseAll) {
  expandAll.addEventListener('click', function () { faqItems.forEach(openItem); });
  collapseAll.addEventListener('click', function () { faqItems.forEach(closeItem); });
}
