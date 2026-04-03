// background.js — plays the FAA sound via offscreen document
// Content scripts send { action: 'play_faa' } to trigger playback

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'play_faa') {
    playSound();
  }
});

async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
  });
  if (existingContexts.length > 0) return false;

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play loss sound effect',
  });
  return true;
}

async function playSound() {
  try {
    const justCreated = await ensureOffscreenDocument();
    const audioUrl = chrome.runtime.getURL('faaah.mp3');
    
    if (justCreated) {
      setTimeout(() => {
        chrome.runtime.sendMessage({ action: 'do_play', src: audioUrl }).catch(() => {});
      }, 50);
    } else {
      chrome.runtime.sendMessage({ action: 'do_play', src: audioUrl }).catch(() => {});
    }
  } catch (e) {}
}
