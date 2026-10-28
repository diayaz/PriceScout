// =========================================================
// Task 3 — Popup Subscription Form (all pages)
// Author: Agzam Duysenov
//
// How it works:
//  - The popup HTML (#subscribe-popup) has the `hidden` attribute,
//    so it is invisible when the page loads.
//  - Any button with [data-open-popup] opens it.
//  - It closes with: the × button, a click OUTSIDE the white box
//    (on the dark overlay), or the Escape key.
//  - The form inside checks the name and email, then (Assignment 5)
//    sends them with fetch() and shows the answer via callbacks.
// =========================================================

const popup = document.getElementById('subscribe-popup');

if (popup) {
  const popupBox = popup.querySelector('.popup-box');
  const closeBtn = popup.querySelector('.popup-close');
  const subForm = document.getElementById('subscribe-form');
  const subEmail = document.getElementById('sub-email');
  const subName = document.getElementById('sub-name');
  const subSuccess = document.getElementById('sub-success');
  let lastTrigger = null; // button that opened the popup (focus returns there)

  function openPopup(event) {
    lastTrigger = event ? event.currentTarget : null;
    popup.hidden = false;
    // wait one frame so the CSS fade/scale transition can play
    requestAnimationFrame(function () { popup.classList.add('show'); });
    document.body.classList.add('popup-open'); // stop page scrolling
    subName.focus();
  }

  function closePopup() {
    popup.classList.remove('show');
    document.body.classList.remove('popup-open');
    // hide completely after the transition (250ms)
    setTimeout(function () {
      popup.hidden = true;
      subForm.reset();
      subForm.hidden = false;
      subSuccess.classList.add('d-none');
      document.getElementById('sub-error').classList.add('d-none');
      [subName, subEmail].forEach(function (input) { input.classList.remove('is-invalid'); });
    }, 250);
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll('[data-open-popup]').forEach(function (button) {
    button.addEventListener('click', openPopup);
  });

  closeBtn.addEventListener('click', closePopup);

  // click outside the white box = click on the overlay itself
  popup.addEventListener('click', function (event) {
    if (event.target === popup) closePopup();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !popup.hidden) closePopup();
  });

  // Keep keyboard focus inside the popup while it is open
  popupBox.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    const focusable = popupBox.querySelectorAll('button, input');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  // ---------- Assignment 5: send the form with fetch + callbacks ----------
  // sendSubscription does NOT know what to show on the page.
  // It receives two CALLBACK functions and calls one of them later:
  //   onSuccess(result) — the server answered OK
  //   onError(error)    — no internet / server error
  const SUBSCRIBE_URL = 'https://jsonplaceholder.typicode.com/posts'; // free test API that accepts POST

  function sendSubscription(data, onSuccess, onError) {
    fetch(SUBSCRIBE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('Server error ' + response.status);
        return response.json();
      })
      .then(onSuccess)   // callback #1
      .catch(onError);   // callback #2
  }

  const subButton = subForm.querySelector('button[type="submit"]');
  const subError = document.getElementById('sub-error');

  subForm.addEventListener('submit', function (event) {
    event.preventDefault(); // no page reload
    const nameOk = subName.value.trim().length >= 2;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(subEmail.value.trim());

    subName.classList.toggle('is-invalid', !nameOk);
    subEmail.classList.toggle('is-invalid', !emailOk);

    if (!nameOk) { subName.focus(); return; }
    if (!emailOk) { subEmail.focus(); return; }

    const data = { name: subName.value.trim(), email: subEmail.value.trim(), list: 'weekly-deals' };

    // show that we are waiting for the server
    subButton.disabled = true;
    subButton.textContent = 'Sending…';
    subError.classList.add('d-none');

    sendSubscription(
      data,
      function onSuccess(result) {
        subForm.hidden = true;
        subSuccess.textContent = 'Thank you, ' + data.name + '! You are subscriber #' + result.id +
          '. Weekly deals will be sent to ' + data.email + '.';
        subSuccess.classList.remove('d-none');
        subButton.disabled = false;
        subButton.textContent = 'Subscribe';
        closeBtn.focus();
        playSound('success');
      },
      function onError() {
        subError.textContent = 'Could not send — please check your internet connection and try again.';
        subError.classList.remove('d-none');
        subButton.disabled = false;
        subButton.textContent = 'Subscribe';
      }
    );
  });
}
