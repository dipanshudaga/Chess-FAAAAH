function playFaaah() {
  chrome.runtime.sendMessage({ action: 'play_faa' });
}

let soundFiredForCurrentGame = false;

function checkForLoss() {
  const resultRow = document.querySelector('.result-row-component');
  const modal = document.querySelector('.game-over-modal-shell-container');

  if (!resultRow && !modal) {
    soundFiredForCurrentGame = false;
    return;
  }

  if (soundFiredForCurrentGame) return;

  let isLoss = false;
  const board = document.querySelector('wc-chess-board') || document.querySelector('.board');
  const userIsBlack = board ? board.classList.contains('flipped') : false;

  if (resultRow) {
    const text = resultRow.textContent.toLowerCase();
    isLoss = (text.includes('1-0') && userIsBlack) ||
      (text.includes('0-1') && !userIsBlack) ||
      text.includes('lost');
  }

  if (!isLoss && modal) {
    const text = modal.textContent.toLowerCase();

    if (text.includes('you lost')) {
      isLoss = true;
    }

    if (text.includes('white won') && userIsBlack) {
      isLoss = true;
    } else if (text.includes('black won') && !userIsBlack) {
      isLoss = true;
    }

    if (text.includes('computer won') || text.includes('bot won')) {
      isLoss = true;
    }
  }

  if (isLoss) {
    soundFiredForCurrentGame = true;
    playFaaah();
  }
}

document.addEventListener('click', (e) => {
  const target = e.target;
  const isResignConfirm = target.closest('.accept-button-component') ||
    target.closest('[aria-label="Confirm"]') ||
    (target.tagName === 'BUTTON' && target.textContent.trim().toLowerCase() === 'yes');

  if (isResignConfirm && !soundFiredForCurrentGame) {
    soundFiredForCurrentGame = true;
    playFaaah();
  }
}, true);

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      checkForLoss();
      return;
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
