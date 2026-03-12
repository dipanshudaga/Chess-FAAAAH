// content-chess.js — detects losses on Chess.com and triggers the FAA sound

let played = false;
let lastUrl = location.href;
let lastSeenResult = '';

function playFaaSound() {
  chrome.runtime.sendMessage({ action: 'play_faa' }).catch(() => {});
}

function getMyColor() {
  // The board div has class "board flipped" when playing black
  const board = document.querySelector('.board');
  if (board && board.classList.contains('flipped')) return 'black';
  return 'white';
}

function checkForLoss() {
  if (played) return;

  const resultRow = document.querySelector('.result-row');
  if (!resultRow) return;
  const result = resultRow.innerText.trim();
  if (result !== '0-1' && result !== '1-0') return;

  // Skip if this is the same result we already saw (stale from previous game)
  if (result === lastSeenResult) return;

  const me = getMyColor();
  const iLost = (me === 'black' && result === '1-0') ||
    (me === 'white' && result === '0-1');
  if (iLost) {
    played = true;
    lastSeenResult = result;
    playFaaSound();
  }
}

new MutationObserver(checkForLoss)
  .observe(document.body, { childList: true, subtree: true });

setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    played = false;
    // Remember the result text so we don't re-trigger on stale DOM
    const resultRow = document.querySelector('.result-row');
    lastSeenResult = resultRow ? resultRow.innerText.trim() : '';
  }
}, 1000);

