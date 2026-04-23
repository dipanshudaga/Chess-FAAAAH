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
      // chrome.tabs.query url parameter accepts an array of match patterns
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
});

let creatingPromise = null;

async function ensureOffscreenDocument() {
  // Check if it already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
  });
  if (existingContexts.length > 0) return;

  // If we are already creating it, wait for that one
  if (creatingPromise) {
    await creatingPromise;
    return;
  }

  creatingPromise = chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play loss sound effect',
  }).then(() => {
    return new Promise(resolve => setTimeout(resolve, 200));
  }).catch(() => {
  }).finally(() => {
    creatingPromise = null;
  });

  await creatingPromise;
}

async function playSound() {
  try {
    await ensureOffscreenDocument();
    const audioUrl = chrome.runtime.getURL(currentSelectedSound);
    
    chrome.runtime.sendMessage({ action: 'do_play', src: audioUrl }).catch(() => {
      // If message fails, the offscreen doc might have just been created and not ready
      setTimeout(() => {
        chrome.runtime.sendMessage({ action: 'do_play', src: audioUrl }).catch(() => {});
      }, 300);
    });
  } catch (e) {}
}

// Pre-load offscreen doc on startup
ensureOffscreenDocument();
