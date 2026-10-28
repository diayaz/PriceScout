// =========================================================
// Task 1 — Form Validation (contact.html)
// Author: Agzam Duysenov
//
// How it works:
//  1. The form has `novalidate`, so the browser does NOT show its own
//     bubbles — our JavaScript checks every field instead.
//  2. Every rule returns an error message ('' = field is OK).
//  3. On submit we check all fields. If something is wrong we show the
//     message under the field (Bootstrap .is-invalid + .invalid-feedback)
//     and stop. If everything is OK we show the success alert.
//  4. After the first submit, fields are re-checked live while typing.
// =========================================================

const contactForm = document.getElementById('contact-form');

if (contactForm) {
  const successBox = document.getElementById('form-success');
  const errorSummary = document.getElementById('form-errors');

  // Simple email pattern: something@something.domain
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const MIN_PASSWORD = 8;

  // field id -> function that returns an error message or ''
  const rules = {
    name: function (value) {
      if (value === '') return 'Full name is required.';
      if (value.length < 2) return 'Name must be at least 2 characters.';
      if (!/^[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі\s'-]+$/.test(value)) return 'Name can contain only letters, spaces and hyphens.';
      return '';
    },
    email: function (value) {
      if (value === '') return 'Email is required.';
      if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email, e.g. name@example.com.';
      return '';
    },
    password: function (value) {
      if (value === '') return 'Password is required.';
      if (value.length < MIN_PASSWORD) return 'Password must be at least ' + MIN_PASSWORD + ' characters (now ' + value.length + ').';
      if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return 'Password must contain at least one letter and one number.';
      return '';
    },
    'confirm-password': function (value) {
      const password = document.getElementById('password').value;
      if (value === '') return 'Please confirm your password.';
      if (value !== password) return 'Passwords do not match.';
      return '';
    },
    category: function (value) {
      if (value === '') return 'Please choose a category.';
      return '';
    },
    'max-price': function (value) {
      if (value === '') return ''; // optional field
      const price = Number(value);
      if (isNaN(price) || price <= 0) return 'Price must be a positive number.';
      if (price > 100000) return 'Price looks too high (max $100,000).';
      return '';
    },
    agree: function (_value, input) {
      if (!input.checked) return 'You must agree before registering.';
      return '';
    }
  };

  // Show or clear the error for one field. Returns true if the field is valid.
  function validateField(id) {
    const input = document.getElementById(id);
    const message = rules[id](input.value.trim(), input);
    const feedback = document.getElementById(id + '-error');

    feedback.textContent = message;
    input.classList.toggle('is-invalid', message !== '');
    input.classList.toggle('is-valid', message === '' && input.type !== 'checkbox' && input.value !== '');
    input.setAttribute('aria-invalid', message !== '' ? 'true' : 'false');
    return message === '';
  }

  let submittedOnce = false;

  contactForm.addEventListener('submit', function (event) {
    event.preventDefault();
    submittedOnce = true;

    const invalidIds = Object.keys(rules).filter(function (id) {
      return !validateField(id);
    });

    if (invalidIds.length > 0) {
      successBox.classList.add('d-none');
      errorSummary.textContent = 'Please fix ' + invalidIds.length +
        (invalidIds.length === 1 ? ' field' : ' fields') + ' marked in red.';
      errorSummary.classList.remove('d-none');
      document.getElementById(invalidIds[0]).focus(); // jump to first error
      return;
    }

    // Everything is valid
    errorSummary.classList.add('d-none');
    const name = document.getElementById('name').value.trim();
    successBox.textContent = 'Thanks, ' + name + '! You are registered. We will email you when the price drops.';
    successBox.classList.remove('d-none');
    contactForm.reset();
    clearStates();
    submittedOnce = false;
  });

  // Live re-check after the first submit attempt
  Object.keys(rules).forEach(function (id) {
    const input = document.getElementById(id);
    const eventName = (input.type === 'checkbox' || input.tagName === 'SELECT') ? 'change' : 'input';
    input.addEventListener(eventName, function () {
      if (!submittedOnce) return;
      validateField(id);
      if (id === 'password') validateField('confirm-password');
    });
  });

  function clearStates() {
    Object.keys(rules).forEach(function (id) {
      const input = document.getElementById(id);
      input.classList.remove('is-invalid', 'is-valid');
      input.removeAttribute('aria-invalid');
      document.getElementById(id + '-error').textContent = '';
    });
  }

  contactForm.addEventListener('reset', function () {
    submittedOnce = false;
    errorSummary.classList.add('d-none');
    clearStates();
  });
}
