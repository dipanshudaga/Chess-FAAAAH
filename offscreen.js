// Pre-load both sounds immediately so .play() fires with zero load time
const preloaded = {};

function preloadSound(soundFile) {
  const url = chrome.runtime.getURL(soundFile);
  const el = new Audio(url);
  el.preload = 'auto';
  preloaded[soundFile] = el;
}

preloadSound('faaah.mp3');
preloadSound('magnus.mp3');

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'do_play') {
    const soundFile = msg.soundFile || 'faaah.mp3';
    const el = preloaded[soundFile];
    if (el) {
      el.currentTime = 0;
      el.play().catch(() => {});
      // Rebuild the element so it's fresh for the next game
      setTimeout(() => preloadSound(soundFile), 1000);
    } else {
      // Fallback for any unexpected sound name
      new Audio(chrome.runtime.getURL(soundFile)).play().catch(() => {});
    }
  }
});
