let currentSelectedSound = 'faaah.mp3';

// Initialize sound from storage on startup
chrome.storage.sync.get({ selectedSound: 'faaah.mp3' }, (data) => {
  currentSelectedSound = data.selectedSound;
});

// Update cached sound immediately when selection changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.selectedSound) {
    currentSelectedSound = changes.selectedSound.newValue;
  }
});

// Inject content scripts into existing tabs on installation
chrome.runtime.onInstalled.addListener(async () => {
  const manifests = chrome.runtime.getManifest();
  const contentScripts = manifests.content_scripts;

  for (const script of contentScripts) {
    try {
      const tabs = await chrome.tabs.query({ url: script.matches });
      for (const tab of tabs) {
        if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) continue;
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: script.js
        }).catch(() => {});
      }
    } catch (e) {}
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'play_faa') {
    playSound();
  }
  // 'ping' messages from content scripts keep the service worker alive — no-op
});

// ── Offscreen document management ──────────────────────────────────────────
// Use a boolean flag so we never call getContexts() (async IPC) on every play.
let offscreenReady = false;
let creatingPromise = null;

async function ensureOffscreenDocument() {
  if (offscreenReady) return; // already up — skip the IPC call

  // Double-check in case the SW was restarted and lost the flag
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
  });
  if (existingContexts.length > 0) {
    offscreenReady = true;
    return;
  }

  if (creatingPromise) {
    await creatingPromise;
    return;
  }

  creatingPromise = chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play loss sound effect',
  }).catch(() => {
  }).finally(() => {
    creatingPromise = null;
    offscreenReady = true;
  });

  await creatingPromise;
}

async function playSound() {
  try {
    await ensureOffscreenDocument();
    chrome.runtime.sendMessage({ action: 'do_play', soundFile: currentSelectedSound }).catch(() => {
      setTimeout(() => {
        chrome.runtime.sendMessage({ action: 'do_play', soundFile: currentSelectedSound }).catch(() => {});
      }, 50);
    });
  } catch (e) {}
}

// Pre-warm the offscreen doc on startup so it's ready before the first loss
ensureOffscreenDocument();
