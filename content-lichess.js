// content-lichess.js — detects losses on Lichess and triggers the FAA sound

let handledGameUrl = null;   // URL of the game whose result we already processed

// On script injection, if a result is already showing (e.g. extension was
// just installed/updated on a tab with a finished game), mark it as handled
// so re-renders of the existing result don't trigger the sound.
if (document.querySelector('.result-wrap .result')) {
  handledGameUrl = location.href;
}

function playFaaSound() {
  try {
    chrome.runtime.sendMessage({ action: 'play_faa' }).catch(() => {});
  } catch (e) {}
}

function getMyColor() {
  if (document.querySelector('.cg-wrap.orientation-black')) return 'black';
  return 'white';
}

function checkForLoss() {
  // If we already handled a result for this exact game URL, skip
  if (handledGameUrl === location.href) return;

  const resultEl = document.querySelector('.result-wrap .result');
  if (!resultEl) return;

  const result = resultEl.textContent.trim().replace(/[–—]/g, '-');
  if (!result || result === '½-½') return;

  // Mark this game URL as handled BEFORE checking win/loss
  handledGameUrl = location.href;

  const me = getMyColor();
  const iLost = (me === 'white' && result === '0-1') ||
    (me === 'black' && result === '1-0');

  if (iLost) {
    playFaaSound();
  }
}

// Only react when a result element is FRESHLY ADDED to the DOM.
// Stale results from a previous game can never trigger.
new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      if (node.matches?.('.result-wrap, .result') ||
          node.querySelector?.('.result-wrap .result')) {
        checkForLoss();
        return;
      }
    }
  }
}).observe(document.body, { childList: true, subtree: true });

