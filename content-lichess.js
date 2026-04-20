let handledGameUrl = null;

if (document.querySelector('.result-wrap .result')) {
  handledGameUrl = location.href;
}

function playFaaSound() {
  try {
    chrome.runtime.sendMessage({ action: 'play_faa' }).catch(() => { });
  } catch (e) { }
}

function getMyColor() {
  if (document.querySelector('.cg-wrap.orientation-black')) return 'black';
  return 'white';
}

function checkForLoss() {
  if (handledGameUrl === location.href) return;

  const resultEl = document.querySelector('.result-wrap .result');
  if (!resultEl) return;

  const result = resultEl.textContent.trim().replace(/[–—]/g, '-');
  if (!result || result === '½-½') return;

  handledGameUrl = location.href;

  const me = getMyColor();
  const iLost = (me === 'white' && result === '0-1') ||
    (me === 'black' && result === '1-0');

  if (iLost) {
    playFaaSound();
  }
}

document.addEventListener('click', (e) => {
  const target = e.target;
  const isResignConfirm = target.closest('.resign-button.confirm') ||
    (target.closest('.mousetrap') && target.classList.contains('confirm'));

  if (isResignConfirm && handledGameUrl !== location.href) {
    playFaaSound();
  }
}, true);

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
