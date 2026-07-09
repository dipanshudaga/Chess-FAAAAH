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

  // ── Audio: play directly in content script (no service worker round-trip) ──
  let audioEl = null;
  let selectedSound = 'faaah.mp3';

  function buildAudioElement(soundFile) {
    const url = chrome.runtime.getURL(soundFile);
    const el = new Audio(url);
    el.preload = 'auto';
    return el;
  }

  function initAudio() {
    chrome.storage.sync.get({ selectedSound: 'faaah.mp3' }, (data) => {
      selectedSound = data.selectedSound || 'faaah.mp3';
      audioEl = buildAudioElement(selectedSound);
    });
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.selectedSound) {
      selectedSound = changes.selectedSound.newValue;
      audioEl = buildAudioElement(selectedSound);
    }
  });

  function playFaaSound() {
    if (!isContextValid()) return;
    try {
      if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play().catch(() => {});
        setTimeout(() => { audioEl = buildAudioElement(selectedSound); }, 500);
      } else {
        buildAudioElement(selectedSound).play().catch(() => {});
      }
    } catch (e) {}
  }

  initAudio();

  // ── Loss detection ─────────────────────────────────────────────────────────
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

    if (iLost) playFaaSound();
  }

  // ── Resign click ───────────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    if (!isContextValid()) return;
    const target = e.target;
    const isResignConfirm =
      target.closest('.resign-button.confirm') ||
      (target.closest('.mousetrap') && target.classList.contains('confirm'));

    if (isResignConfirm && handledGameUrl !== location.href) {
      playFaaSound();
    }
  }, true);

  // ── MutationObserver ───────────────────────────────────────────────────────
  const observer = new MutationObserver((mutations) => {
    if (!isContextValid()) { observer.disconnect(); return; }
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
