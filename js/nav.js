// =========================================================
// Assignment 5 — Keyboard navigation for the main menu (all pages)
// Author: Dias Zhumakhan
//
// When focus is on a menu link, the arrow keys move between items:
//   → / ↓  next item        ← / ↑  previous item
//   Home    first item      End    last item
// A switch statement decides what each key does.
// =========================================================

const menuItems = Array.from(document.querySelectorAll('.navbar-nav .nav-link, .navbar-nav #theme-toggle'));

menuItems.forEach(function (item, index) {
  item.addEventListener('keydown', function (event) {
    let target;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = (index + 1) % menuItems.length;                     // wrap to the first
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        target = (index - 1 + menuItems.length) % menuItems.length;  // wrap to the last
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = menuItems.length - 1;
        break;
      default:
        return; // other keys (Tab, Enter, letters) work as usual
    }

    event.preventDefault(); // stop the page from scrolling
    menuItems[target].focus();
  });
});
