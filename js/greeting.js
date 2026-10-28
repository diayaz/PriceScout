// =========================================================
// Assignment 5 — Personal greeting + "Check prices" button (index.html)
// Author: Dias Zhumakhan
//
// 1) A switch statement picks a greeting for the time of day.
// 2) The user types a name; the greeting updates without reloading.
// 3) "Check prices now" shows the current time with
//    new Date().toLocaleTimeString() and spins the refresh icon.
// =========================================================

const greetingTitle = document.getElementById('greeting');
const greetingText = document.getElementById('greeting-text');
const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('name-input');
const checkButton = document.getElementById('check-prices');
const checkIcon = document.getElementById('check-icon');
const lastChecked = document.getElementById('last-checked');

let userName = '';
try { userName = localStorage.getItem('ps-name') || ''; } catch (e) { /* ignore */ }

// Returns { title, text } for the current hour
function getGreeting(hour) {
  // Math.floor(hour / 6) splits the day into 4 parts: 0, 1, 2, 3
  switch (Math.floor(hour / 6)) {
    case 0: // 00:00 – 05:59
      return { title: 'Good night', text: 'Night owl? Prices on Pinduoduo often drop overnight.' };
    case 1: // 06:00 – 11:59
      return { title: 'Good morning', text: 'Fresh prices are in — start your day with a deal.' };
    case 2: // 12:00 – 17:59
      return { title: 'Good afternoon', text: 'Lunch break? Check today\'s biggest price gaps.' };
    default: // 18:00 – 23:59
      return { title: 'Good evening', text: 'Relax and compare — the best deals are one click away.' };
  }
}

function renderGreeting() {
  const greeting = getGreeting(new Date().getHours());
  greetingTitle.textContent = greeting.title + (userName ? ', ' + userName : '') + '!';
  greetingText.textContent = greeting.text;
}

if (greetingTitle) {
  renderGreeting();
  if (userName) nameInput.value = userName;

  // name form: update the greeting without reloading the page
  nameForm.addEventListener('submit', function (event) {
    event.preventDefault();
    userName = nameInput.value.trim();
    try { localStorage.setItem('ps-name', userName); } catch (e) { /* ignore */ }
    renderGreeting();

    greetingTitle.classList.add('pulse');           // short highlight animation
    setTimeout(function () { greetingTitle.classList.remove('pulse'); }, 600);
    playSound('pop');
  });

  // "Check prices now": show the current time and spin the icon
  let rotation = 0;
  checkButton.addEventListener('click', function () {
    rotation += 360;
    checkIcon.style.transform = 'rotate(' + rotation + 'deg)';
    lastChecked.textContent = 'Prices checked at ' + new Date().toLocaleTimeString() + ' — all 9 tracked products are up to date.';
    playSound('click');
  });
}
