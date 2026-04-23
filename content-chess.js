(function() {
  // 1. Safety Check: If we can't even see the extension API, stop immediately.
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
    return;
  }

  const SESSION_ID = Math.random().toString(36).substring(7);
  window.chessFaaahSession = SESSION_ID;

  function isContextValid() {
    // Check if the extension still exists and this session is the active one
    const hasRuntime = typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
    const isCurrent = window.chessFaaahSession === SESSION_ID;
    
    if (!hasRuntime || !isCurrent) {
      if (observer) observer.disconnect();
      return false;
    }
    return true;
  }

  function playFaaah() {
    if (!isContextValid()) return;

    try {
      chrome.runtime.sendMessage({ action: 'play_faa' }).catch(err => {
        if (err.message.includes('context invalidated')) {
          window.chessFaaahSession = null;
          if (observer) observer.disconnect();
        }
      });
    } catch (e) {
      // This is where the 'undefined' error usually happens if context is lost
      if (observer) observer.disconnect();
    }
  }

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
      if (el) {
        foundElement = el;
        break;
      }
    }

    if (!foundElement) {
      if (soundFiredForCurrentGame) {
        soundFiredForCurrentGame = false;
      }
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

    if (isLoss) {
      soundFiredForCurrentGame = true;
      playFaaah();
    } else {
      // Detected a result but it wasn't a loss (Draw or Win)
      soundFiredForCurrentGame = true;
    }
  }

  document.addEventListener('click', (e) => {
    if (!isContextValid()) return;

    const target = e.target;
    const isResignConfirm = target.closest('.accept-button-component') ||
      target.closest('[aria-label="Confirm"]') ||
      (target.tagName === 'BUTTON' && target.textContent.trim().toLowerCase() === 'yes') ||
      (target.tagName === 'BUTTON' && target.textContent.trim().toLowerCase() === 'resign' && target.classList.contains('ui_v5-button-primary'));

    const isSidebarResign = target.closest('.resign-button-component') && !target.closest('.modal-container');

    if (isResignConfirm && !isSidebarResign && !soundFiredForCurrentGame) {
      soundFiredForCurrentGame = true;
      playFaaah();
    }
  }, true);

  const observer = new MutationObserver((mutations) => {
    if (!isContextValid()) {
      observer.disconnect();
      return;
    }
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        checkForLoss();
        return;
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
