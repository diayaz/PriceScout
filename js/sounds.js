// =========================================================
// Assignment 5 — Sound effects (all pages)
// Author: Agzam Duysenov
//
// playSound('click') plays a short sound. Each sound is ONE Audio
// object that we rewind before playing, so sounds never pile up
// or overlap. The "Sound: On/Off" button in the footer mutes them,
// and the choice is remembered in localStorage.
//
// This file is loaded BEFORE the other scripts, so every other
// file can call playSound().
// =========================================================

const sounds = {
  click: new Audio('sounds/click.wav'),     // buttons, filters
  pop: new Audio('sounds/pop.wav'),         // star rating, "show more"
  success: new Audio('sounds/success.wav'), // subscription sent
  switch: new Audio('sounds/switch.wav')    // day / night theme
};

let soundOn = true;
try { soundOn = localStorage.getItem('ps-sound') !== 'off'; } catch (e) { /* ignore */ }

function playSound(name) {
  if (!soundOn) return;
  const sound = sounds[name];
  if (!sound) return;

  sound.pause();          // stop it if it is still playing
  sound.currentTime = 0;  // rewind to the start
  sound.volume = 0.6;
  // play() returns a Promise; browsers block sound until the first click,
  // so we ignore that error instead of showing it in the console
  sound.play().catch(function () { /* ignore */ });
}

// ---------- Mute button (footer) ----------
const soundButton = document.getElementById('sound-toggle');

function updateSoundButton() {
  if (!soundButton) return;
  soundButton.textContent = soundOn ? '🔊 Sound: On' : '🔇 Sound: Off';
  soundButton.setAttribute('aria-pressed', String(soundOn));
}

if (soundButton) {
  updateSoundButton();
  soundButton.addEventListener('click', function () {
    soundOn = !soundOn;
    try { localStorage.setItem('ps-sound', soundOn ? 'on' : 'off'); } catch (e) { /* ignore */ }
    updateSoundButton();
    playSound('click'); // you hear it only when sound was just turned on
  });
}
