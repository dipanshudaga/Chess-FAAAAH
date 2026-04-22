let currentSelectedSound = 'FAAAAH.mp3';

// Initialize sound from storage on startup
chrome.storage.sync.get({ selectedSound: 'FAAAAH.mp3' }, (data) => {
  currentSelectedSound = data.selectedSound;
});

// Update cached sound immediately when selection changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.selectedSound) {
    currentSelectedSound = changes.selectedSound.newValue;
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'play_faa') {
    playSound();
  }
});

async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
  });
  if (existingContexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play loss sound effect',
  });
}

function playSound() {
  // Use non-async trigger for zero latency
  const audioUrl = chrome.runtime.getURL(currentSelectedSound);
  
  // Fire and forget - ensureOffscreenDocument runs in background if needed
  ensureOffscreenDocument().then(() => {
    chrome.runtime.sendMessage({ action: 'do_play', src: audioUrl }).catch(() => {});
  }).catch(() => {});
}

// Pre-load offscreen doc
ensureOffscreenDocument();
