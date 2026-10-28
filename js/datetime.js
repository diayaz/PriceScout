// =========================================================
// Task 5 — Display Current Date and Time (footer of every page)
// Author: Dias Zhumakhan
//
// How it works:
//  - new Date() gives the current date and time.
//  - We read its parts (getMonth, getDate, getFullYear, getHours,
//    getMinutes, getSeconds) and build a readable string like
//    "October 20, 2026, 10:45:07 AM".
//  - setInterval runs the function every second, so the clock is live.
// =========================================================

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function twoDigits(number) {
  return number < 10 ? '0' + number : String(number);
}

function formatDateTime(date) {
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12; // 0:xx -> 12:xx AM

  return WEEKDAYS[date.getDay()] + ', ' +
    MONTHS[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear() + ', ' +
    hours + ':' + twoDigits(date.getMinutes()) + ':' + twoDigits(date.getSeconds()) + ' ' + ampm;
}

const dateTimeBlock = document.getElementById('datetime');

function updateDateTime() {
  const now = new Date();
  dateTimeBlock.textContent = formatDateTime(now);
  dateTimeBlock.setAttribute('datetime', now.toISOString());
}

if (dateTimeBlock) {
  updateDateTime();
  setInterval(updateDateTime, 1000);
}
