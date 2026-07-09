(function() {
  // Safety Check: If we can't even see the extension API, stop immediately.
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
    return;
  }

  const SESSION_ID = Math.random().toString(36).substring(7);
  window.chessFaaahSession = SESSION_ID;

  function isContextValid() {
    const hasRuntime = typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
    const isCurrent = window.chessFaaahSession === SESSION_ID;
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
    el.preload = 'auto'; // buffer the file immediately
    return el;
  }

  function initAudio() {
    chrome.storage.sync.get({ selectedSound: 'faaah.mp3' }, (data) => {
      selectedSound = data.selectedSound || 'faaah.mp3';
      audioEl = buildAudioElement(selectedSound);
    });
  }

  // Refresh audio element when user changes sound in popup
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.selectedSound) {
      selectedSound = changes.selectedSound.newValue;
      audioEl = buildAudioElement(selectedSound);
    }
  });

  function playFaaah() {
    if (!isContextValid()) return;
    try {
      if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play().catch(() => {});
        // Rebuild for next potential loss in same session
        setTimeout(() => { audioEl = buildAudioElement(selectedSound); }, 500);
      } else {
        // Fallback: create on the spot (should rarely happen)
        buildAudioElement(selectedSound).play().catch(() => {});
      }
    } catch (e) {}
  }

  // Pre-load immediately
  initAudio();

  // ── Loss detection ─────────────────────────────────────────────────────────
  let soundFiredForCurrentGame = false;

  function checkForLoss() {
    if (!isContextValid()) return;

    const selectors = [
      '.result-row-component',
      '.game-over-modal-shell-container',
      '.game-over-modal-content',
      '[data-testid="game-over-modal"]',
      '.game-result-container',
      '.game-over-container'
    ];

    let foundElement = null;
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) { foundElement = el; break; }
    }

    if (!foundElement) {
      if (soundFiredForCurrentGame) soundFiredForCurrentGame = false;
      return;
    }

    if (soundFiredForCurrentGame) return;

    const board = document.querySelector('wc-chess-board') || document.querySelector('.board');
    const userIsBlack = board ? board.classList.contains('flipped') : false;
    const text = foundElement.textContent.toLowerCase();

    let isLoss = false;
    if (text.includes('you lost') || (text.includes('0-1') && !userIsBlack) || (text.includes('1-0') && userIsBlack)) {
      isLoss = true;
    } else if (text.includes('black won') && !userIsBlack) {
      isLoss = true;
    } else if (text.includes('white won') && userIsBlack) {
      isLoss = true;
    } else if (text.includes('computer won') || text.includes('bot won')) {
      isLoss = true;
    }

    soundFiredForCurrentGame = true;
    if (isLoss) playFaaah();
  }

  // ── Resign click (fires before the modal appears) ─────────────────────────
  document.addEventListener('click', (e) => {
    if (!isContextValid()) return;
    const target = e.target;
    const isResignConfirm =
      target.closest('.accept-button-component') ||
      target.closest('[aria-label="Confirm"]') ||
      (target.tagName === 'BUTTON' && target.textContent.trim().toLowerCase() === 'yes') ||
      (target.tagName === 'BUTTON' && target.textContent.trim().toLowerCase() === 'resign' &&
        target.classList.contains('ui_v5-button-primary'));

    const isSidebarResign = target.closest('.resign-button-component') && !target.closest('.modal-container');

    if (isResignConfirm && !isSidebarResign && !soundFiredForCurrentGame) {
      soundFiredForCurrentGame = true;
      playFaaah();
    }
  }, true);

  // ── MutationObserver: watch for modal + board attribute changes ────────────
  const observer = new MutationObserver((mutations) => {
    if (!isContextValid()) { observer.disconnect(); return; }
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0 || mutation.type === 'attributes') {
        checkForLoss();
        return;
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also watch board attributes — chess.com sets game-state attrs on
  // wc-chess-board before the result modal fully renders.
  function attachBoardObserver() {
    const board = document.querySelector('wc-chess-board');
    if (board) observer.observe(board, { attributes: true });
  }
  attachBoardObserver();
  setTimeout(attachBoardObserver, 2000);
})();
