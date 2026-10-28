// =========================================================
// Assignment 5 — Day / Night theme switch (all pages)
// Author: Agzam Duysenov
//
// The theme is an ATTRIBUTE on <html>: data-bs-theme="light" or "dark".
// Bootstrap 5.3 reads this attribute and switches its own colors, and
// our style.css changes the brand colors for [data-bs-theme="dark"].
//
// This file is loaded in <head> so the saved theme is applied BEFORE
// the page is drawn (no white flash). The button is connected later,
// when the HTML is ready (DOMContentLoaded).
// =========================================================

const THEME_KEY = 'ps-theme';

function getSavedTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'light'; } catch (e) { return 'light'; }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);

  const button = document.getElementById('theme-toggle');
  if (button) {
    // the button shows what you will switch TO
    button.textContent = theme === 'dark' ? '☀️ Day' : '🌙 Night';
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to day theme' : 'Switch to night theme');
  }
}

// 1) apply the saved theme immediately
applyTheme(getSavedTheme());

// 2) when the page is ready, connect the button
document.addEventListener('DOMContentLoaded', function () {
  applyTheme(getSavedTheme()); // update the button text

  const button = document.getElementById('theme-toggle');
  if (!button) return;

  button.addEventListener('click', function () {
    const current = document.documentElement.getAttribute('data-bs-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    playSound('switch');
  });
});
