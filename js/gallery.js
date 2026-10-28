// =========================================================
// Assignment 5 — Thumbnail gallery (products.html)
// Author: Dias Zhumakhan
//
// Manipulating attributes: clicking a thumbnail changes the `src`
// and `alt` of the big image. The image fades out, the src changes,
// and it fades back in (CSS transition on opacity).
// =========================================================

const mainImage = document.getElementById('gallery-image');
const galleryTitle = document.getElementById('gallery-title');
const galleryInfo = document.getElementById('gallery-info');
const thumbs = document.querySelectorAll('.thumb');

function showImage(thumb) {
  // nothing to do if this photo is already shown
  if (mainImage.getAttribute('src') === thumb.dataset.full) return;

  // highlight the chosen thumbnail
  thumbs.forEach(function (t) {
    t.classList.remove('active');
    t.setAttribute('aria-pressed', 'false');
  });
  thumb.classList.add('active');
  thumb.setAttribute('aria-pressed', 'true');

  // 1) fade out
  mainImage.classList.add('fading');

  // 2) after the fade (250 ms) change the attributes and fade back in
  setTimeout(function () {
    mainImage.setAttribute('src', thumb.dataset.full);
    mainImage.setAttribute('alt', thumb.dataset.title);
    galleryTitle.textContent = thumb.dataset.title;
    galleryInfo.textContent = thumb.dataset.info;
    mainImage.classList.remove('fading');
  }, 250);

  playSound('click');
}

if (mainImage) {
  thumbs.forEach(function (thumb, index) {
    thumb.addEventListener('click', function () {
      showImage(thumb);
    });

    // keyboard: arrows move between thumbnails
    thumb.addEventListener('keydown', function (event) {
      let next = null;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = thumbs[(index + 1) % thumbs.length];
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          next = thumbs[(index - 1 + thumbs.length) % thumbs.length];
          break;
        default:
          return; // any other key: do nothing
      }
      event.preventDefault();
      next.focus();
      showImage(next);
    });
  });
}
