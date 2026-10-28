// =========================================================
// Assignment 5 — Star rating (products.html, "Best deals" cards)
// Author: Agzam Duysenov
//
// document.querySelectorAll selects every star. Clicking a star
// sets the rating: that star and all stars before it turn gold,
// and the message under the stars changes (textContent).
// Hovering previews the rating before you click.
// =========================================================

// One message for every rating — an object used as a lookup table
const RATING_MESSAGES = {
  1: 'Not worth it 😕',
  2: 'Could be cheaper',
  3: 'A fair price',
  4: 'Great deal!',
  5: 'Amazing deal — buy it! 🔥'
};

// Saved ratings: { earbuds: 4, sneakers: 5, ... }
const ratings = {};

// Paint the first `value` stars of one rating block
function paintStars(stars, value) {
  stars.forEach(function (star) {
    const starValue = Number(star.dataset.value);
    star.classList.toggle('filled', starValue <= value);
  });
}

document.querySelectorAll('.rating').forEach(function (block) {
  const productId = block.dataset.product;
  const stars = block.querySelectorAll('.star');
  const message = block.querySelector('.rating-message');

  stars.forEach(function (star) {
    const value = Number(star.dataset.value);

    // click = save the rating
    star.addEventListener('click', function () {
      ratings[productId] = value;
      paintStars(stars, value);
      message.textContent = 'You rated ' + value + '/5 — ' + RATING_MESSAGES[value];

      // small "pop" animation: add the class, remove it when it ends
      star.classList.add('pop');
      star.addEventListener('animationend', function () {
        star.classList.remove('pop');
      }, { once: true });

      playSound('pop');
    });

    // hover = preview the rating
    star.addEventListener('mouseenter', function () {
      paintStars(stars, value);
    });
  });

  // mouse left the stars: show the saved rating again (or none)
  block.querySelector('.stars').addEventListener('mouseleave', function () {
    paintStars(stars, ratings[productId] || 0);
  });
});
