// =========================================================
// Final Project — Authentication simulation with localStorage
// Author: Agzam Duysenov
// Pages: signup.html, login.html, profile.html (+ the navbar on every page)
//
// There is no server, so the browser's localStorage plays the database:
//   'ps-users'   → JSON array of all accounts  [{ name, email, phone, password, createdAt }]
//   'ps-session' → email of the user who is logged in right now
//
// 1) Sign Up  : validates the form, checks the email is free, saves the user.
// 2) Log In   : validates the form, compares email + password, opens profile.html.
// 3) Profile  : shows the saved details; redirects to login.html if nobody is logged in.
// 4) Navbar   : "👤 Log in" becomes "👤 <first name>" after logging in.
//
// NOTE: a real site would never keep passwords in the browser —
// this is only a simulation required by the project brief.
// =========================================================

const USERS_KEY = 'ps-users';
const SESSION_KEY = 'ps-session';

// ---------- storage helpers ----------
function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; }
}

function saveUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) { /* storage blocked */ }
}

function findUser(email) {
  return getUsers().find(function (user) { return user.email === email.toLowerCase(); }) || null;
}

function getCurrentUser() {
  let email = null;
  try { email = localStorage.getItem(SESSION_KEY); } catch (e) { /* ignore */ }
  return email ? findUser(email) : null;
}

function logIn(email) {
  try { localStorage.setItem(SESSION_KEY, email.toLowerCase()); } catch (e) { /* ignore */ }
}

function logOut() {
  try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
}

// ---------- validation rules (each returns an error message, '' = OK) ----------
const AUTH_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const AUTH_PHONE = /^(\+7|8)\d{10}$/;           // +7 7012345678 or 8 7012345678

const authRules = {
  name: function (value) {
    if (value === '') return 'Full name is required.';
    if (value.length < 2) return 'Name must be at least 2 characters.';
    if (!/^[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі\s'-]+$/.test(value)) return 'Use letters, spaces and hyphens only.';
    return '';
  },
  email: function (value) {
    if (value === '') return 'Email is required.';
    if (!AUTH_EMAIL.test(value)) return 'Enter a valid email, e.g. name@example.com.';
    return '';
  },
  phone: function (value) {
    if (value === '') return 'Phone number is required.';
    if (!AUTH_PHONE.test(value.replace(/[\s()-]/g, ''))) return 'Enter a phone like +7 701 234 56 78 (11 digits).';
    return '';
  },
  password: function (value) {
    if (value === '') return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters (now ' + value.length + ').';
    if (!/[A-Z]/.test(value)) return 'Add at least one uppercase letter (A–Z).';
    if (!/[a-z]/.test(value)) return 'Add at least one lowercase letter (a–z).';
    if (!/[0-9]/.test(value)) return 'Add at least one number (0–9).';
    return '';
  },
  loginPassword: function (value) {             // on login we only check it is filled in
    return value === '' ? 'Password is required.' : '';
  },
  confirm: function (value) {
    if (value === '') return 'Please repeat your password.';
    if (value !== document.getElementById('signup-password').value) return 'Passwords do not match.';
    return '';
  },
  terms: function (_value, input) {
    return input.checked ? '' : 'Please accept the terms to create an account.';
  }
};

// Shows/clears the message under one field. fieldMap: input id -> rule name
function checkField(inputId, ruleName) {
  const input = document.getElementById(inputId);
  const value = input.type === 'password' ? input.value : input.value.trim();
  const message = authRules[ruleName](value, input);
  document.getElementById(inputId + '-error').textContent = message;
  input.classList.toggle('is-invalid', message !== '');
  input.classList.toggle('is-valid', message === '' && input.type !== 'checkbox');
  return message === '';
}

// Checks every field of a form; returns true when all are valid
function checkForm(fieldMap) {
  let firstBad = null;
  Object.keys(fieldMap).forEach(function (id) {
    if (!checkField(id, fieldMap[id]) && !firstBad) firstBad = id;
  });
  if (firstBad) document.getElementById(firstBad).focus();
  return firstBad === null;
}

// Re-check a field while the user types (after the first submit)
function liveCheck(form, fieldMap) {
  Object.keys(fieldMap).forEach(function (id) {
    const input = document.getElementById(id);
    input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', function () {
      if (form.dataset.submitted) checkField(id, fieldMap[id]);
    });
  });
}

function showFormAlert(box, message, type) {
  box.className = 'alert alert-' + type;
  box.textContent = message;
}

// ---------- show / hide password buttons ----------
document.querySelectorAll('[data-toggle-password]').forEach(function (button) {
  button.addEventListener('click', function () {
    const input = document.getElementById(button.dataset.togglePassword);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.textContent = show ? 'Hide' : 'Show';
    button.setAttribute('aria-pressed', String(show));
  });
});

// ---------- navbar account link (all pages) ----------
const navAccount = document.getElementById('nav-account');
const currentUser = getCurrentUser();
if (navAccount && currentUser) {
  navAccount.textContent = '👤 ' + currentUser.name.split(' ')[0];
  navAccount.href = 'profile.html';
}

// ---------- 1) SIGN UP ----------
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  const signupFields = {
    'signup-name': 'name', 'signup-email': 'email', 'signup-phone': 'phone',
    'signup-password': 'password', 'signup-confirm': 'confirm', 'signup-terms': 'terms'
  };
  const signupAlert = document.getElementById('signup-alert');
  const passwordInput = document.getElementById('signup-password');

  liveCheck(signupForm, signupFields);

  // live password checklist: each <li data-rule="..."> turns green when met
  const strengthRules = {
    length: function (v) { return v.length >= 8; },
    upper: function (v) { return /[A-Z]/.test(v); },
    lower: function (v) { return /[a-z]/.test(v); },
    number: function (v) { return /[0-9]/.test(v); }
  };
  passwordInput.addEventListener('input', function () {
    document.querySelectorAll('#password-checklist li').forEach(function (item) {
      item.classList.toggle('met', strengthRules[item.dataset.rule](passwordInput.value));
    });
  });

  signupForm.addEventListener('submit', function (event) {
    event.preventDefault();
    signupForm.dataset.submitted = 'yes';
    if (!checkForm(signupFields)) {
      showFormAlert(signupAlert, 'Please fix the fields marked in red.', 'danger');
      return;
    }

    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    if (findUser(email)) {
      showFormAlert(signupAlert, 'An account with ' + email + ' already exists. Please log in instead.', 'warning');
      return;
    }

    const users = getUsers();
    users.push({
      name: document.getElementById('signup-name').value.trim(),
      email: email,
      phone: document.getElementById('signup-phone').value.trim(),
      password: passwordInput.value,
      createdAt: new Date().toISOString()
    });
    saveUsers(users);

    showFormAlert(signupAlert, 'Account created! Taking you to the log-in page…', 'success');
    playSound('success');
    showToast('Welcome to PriceScout! Now log in with your new account.');
    setTimeout(function () {
      window.location.href = 'login.html?email=' + encodeURIComponent(email);
    }, 1500);
  });
}

// ---------- 2) LOG IN ----------
const loginForm = document.getElementById('login-form');
if (loginForm) {
  const loginFields = { 'login-email': 'email', 'login-password': 'loginPassword' };
  const loginAlert = document.getElementById('login-alert');

  // came from Sign Up? fill in the email
  const params = new URLSearchParams(window.location.search);
  if (params.get('email')) {
    document.getElementById('login-email').value = params.get('email');
    showFormAlert(loginAlert, 'Your account is ready — enter your password to log in.', 'success');
  } else if (params.get('from') === 'profile') {
    showFormAlert(loginAlert, 'Please log in to see your profile.', 'info');
  }

  liveCheck(loginForm, loginFields);

  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();
    loginForm.dataset.submitted = 'yes';
    if (!checkForm(loginFields)) {
      showFormAlert(loginAlert, 'Please fix the fields marked in red.', 'danger');
      return;
    }

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const user = findUser(email);

    if (!user || user.password !== password) {
      showFormAlert(loginAlert, 'Wrong email or password. Try again or create an account.', 'danger');
      document.getElementById('login-password').value = '';
      document.getElementById('login-password').focus();
      return;
    }

    logIn(user.email);
    showFormAlert(loginAlert, 'Welcome back, ' + user.name + '! Opening your profile…', 'success');
    playSound('success');
    setTimeout(function () { window.location.href = 'profile.html'; }, 900);
  });
}

// ---------- 3) PROFILE ----------
const profilePage = document.getElementById('profile-page');
if (profilePage) {
  if (!currentUser) {
    window.location.replace('login.html?from=profile'); // not logged in → go to log in
  } else {
    const initials = currentUser.name.split(' ').map(function (part) { return part[0]; }).join('').slice(0, 2).toUpperCase();
    document.getElementById('profile-avatar').textContent = initials;
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-greeting').textContent = 'Hi, ' + currentUser.name.split(' ')[0] + '!';
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-phone').textContent = currentUser.phone;
    document.getElementById('profile-since').textContent = new Date(currentUser.createdAt)
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('profile-password').textContent = '•'.repeat(currentUser.password.length);

    document.getElementById('logout-btn').addEventListener('click', function () {
      logOut();
      playSound('switch');
      window.location.href = 'login.html';
    });
  }
}
