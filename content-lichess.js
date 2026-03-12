// content-lichess.js — detects losses on Lichess and triggers the FAA sound

let played = false;
let lastUrl = location.href;

function playFaaSound() {
  chrome.runtime.sendMessage({ action: 'play_faa' }).catch(() => {});
}

function getMyColor() {
  if (document.querySelector('.cg-wrap.orientation-black')) return 'black';
  return 'white';
}

function checkForLoss() {
  if (played) return;
  const resultEl = document.querySelector('.result-wrap .result');
  if (!resultEl) return;
  const result = resultEl.textContent.trim().replace(/[–—]/g, '-');
  if (!result || result === '½-½') return;
  const me = getMyColor();
  const iLost = (me === 'white' && result === '0-1') ||
    (me === 'black' && result === '1-0');
  if (iLost) {
    played = true;
    playFaaSound();
  }
}

new MutationObserver(() => checkForLoss())
  .observe(document.body, { childList: true, subtree: true });

setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    played = false;
  }
  checkForLoss();
}, 1000);
