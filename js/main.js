// PriceScout — small scripts for Assignment 3
// Team: Dias Zhumakhan, Agzam Duysenov

// 1) Products page: filter the price table with the Bootstrap button group
const filterButtons = document.querySelectorAll('[data-filter]');

filterButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    const category = button.dataset.filter;

    // highlight the clicked button
    filterButtons.forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');

    // show / hide table rows (d-none is a Bootstrap class)
    document.querySelectorAll('.price-table tbody tr').forEach(function (row) {
      const show = category === 'all' || row.dataset.category === category;
      row.classList.toggle('d-none', !show);
    });
  });
});

// 2) Contact page: Bootstrap form validation
const form = document.getElementById('contact-form');

if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const success = document.getElementById('form-success');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      success.classList.add('d-none');
      return;
    }

    form.classList.remove('was-validated');
    success.classList.remove('d-none');
    form.reset();
  });

  form.addEventListener('reset', function () {
    form.classList.remove('was-validated');
  });
}
