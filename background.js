// background.js — plays the FAA sound via offscreen document
// Content scripts send { action: 'play_faa' } to trigger playback

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'play_faa') {
    playSound();
  }
});

function playSound() {
  const audioUrl = chrome.runtime.getURL('faaah.mp3');
  chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play loss sound effect',
  }).then(() => {
    chrome.runtime.sendMessage({ action: 'do_play', src: audioUrl });
  }).catch(() => {
    // Offscreen doc may already exist — just send the message
    const audioUrl = chrome.runtime.getURL('faaah.mp3');
    chrome.runtime.sendMessage({ action: 'do_play', src: audioUrl });
  });
}
