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

async function playSound() {
  try {
    await ensureOffscreenDocument();
    const audioUrl = chrome.runtime.getURL('faaah.mp3');
    chrome.runtime.sendMessage({ action: 'do_play', src: audioUrl }).catch(() => {});
  } catch (e) {}
}

ensureOffscreenDocument();
