(function() {
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) return;

  const SESSION_ID = Math.random().toString(36).substring(7);
  window.chessFaaahSessionLichess = SESSION_ID;

  let handledGameUrl = null;

  function isContextValid() {
    const hasRuntime = typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
    const isCurrent = window.chessFaaahSessionLichess === SESSION_ID;
    if (!hasRuntime || !isCurrent) {
      if (observer) observer.disconnect();
      return false;
    }
    return true;
  }

  function playFaaSound() {
    if (!isContextValid()) return;
    try {
      chrome.runtime.sendMessage({ action: 'play_faa' }).catch(() => { });
    } catch (e) {
      if (observer) observer.disconnect();
    }
  }

  function getMyColor() {
    if (document.querySelector('.cg-wrap.orientation-black')) return 'black';
    return 'white';
  }

  function checkForLoss() {
    if (!isContextValid() || handledGameUrl === location.href) return;

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
    if (!isContextValid()) return;

    const target = e.target;
    const isResignConfirm = target.closest('.resign-button.confirm') ||
      (target.closest('.mousetrap') && target.classList.contains('confirm'));

    if (isResignConfirm && handledGameUrl !== location.href) {
      playFaaSound();
    }
  }, true);

  const observer = new MutationObserver((mutations) => {
    if (!isContextValid()) {
      observer.disconnect();
      return;
    }
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
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
